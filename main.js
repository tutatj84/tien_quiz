const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  globalShortcut,
} = require('electron');
const path = require('path');
//db init
let Datastore = require('nedb');
const { url } = require('inspector');
const db = {};
db.quiz = new Datastore('./database/quiz.db');
db.acc = new Datastore('./database/account.db');
db.result = new Datastore('./database/result.db');

db.quiz.loadDatabase(err => {
  if (err) {
    console.log(err)
  }
});
db.acc.loadDatabase(err => {
  if (err) {
    console.log(err)
  }
});
db.result.loadDatabase(err => {
  if (err) {
    console.log(err)
  }
});

let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    title: 'Carrot Quiz :3',
    icon: './img/icon.png',
  });
  mainWindow.loadFile('./login/login.html')
  mainWindow.setResizable(false)
  // mainWindow.setSimpleFullScreen(true)
  mainWindow.setMenu(null)
  mainWindow.setAlwaysOnTop(true, "floating")
}

app.whenReady()
  .then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows.length === 0) {
        createWindow();
      }
    });
  })
  .catch(err => console.log);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

//ipc
//login
let _user = null; //fake session :b
ipcMain.on('login', (event, user, pass) => {
  db.acc.find({}, (err, accs) => {
    const accDb = accs.find(acc => user === acc.user && pass === acc.pass);
    if (accDb) {
      _user = user;
      if (accDb.role == 0) {
        mainWindow.loadFile('./admin/admin.html')
      } else if (accDb.role == 1) {
        mainWindow.loadFile('./student/preLoad.html')
      }
    } else {
      event.reply('login-fail');
    }
  })

})

ipcMain.on('log-out', event => {
  mainWindow.loadFile('./login/login.html')
})

ipcMain.on('load-preload', e => {
  mainWindow.loadFile('./student/preLoad.html')
  mainWindow.setSize(800, 600)
})

//admin
ipcMain.on('quiz-manager', e => {
  mainWindow.loadFile('./admin/admin.html');
})

ipcMain.on('view-rs', e => {
  mainWindow.loadFile('./admin/viewAllResult.html')
})

ipcMain.on('loadAllQues-mes', event => {
  mainWindow.maximize();
  //mainWindow.setMaxHeight();
  db.quiz.find({})
    .sort({
      time: 1
    })
    .exec((err, docs) => {
      event.reply('loadAllQues-rep', docs);
    })
})

ipcMain.on('del-quiz', (e, id) => {
  let cfOptions = {}
  cfOptions.buttons = ['Sure!', 'No..']
  cfOptions.message = 'Chắc kèo chưa bro??'
  cfOptions.cancelId = 1
  dialog.showMessageBox(mainWindow, cfOptions, (res, checked) => {
    if (res === 0) {
      db.quiz.remove({
        _id: id
      }, {}, (err, numRemoved) => {
        console.log('num remove:' + numRemoved);
      })
      e.reply('del-done')
    }
  })
})

ipcMain.on('edit-mes', (event, quizEdited) => {
  db.quiz.update({
    _id: quizEdited._id
  }, quizEdited, {}, (err, numAffected) => {
    if (err) {
      console.log(err);
    }
    event.reply('edit-rep');
  });
})

_childWindow = null

//admin - add quiz
ipcMain.on('add-window', (event, quizType, ansNum) => {

  // open window as modal
  const child = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
    }
  });
  child.loadFile('./admin/add.html')
  child.setSize(450, 300)
  child.setResizable(false)
  child.setMenu(null)
  child.center();
  child.show();
  _childWindow = child;

  ipcMain.on('get-parent-info', event => {
    event.reply('get-parent-info-rep', quizType, ansNum);
  })
})

ipcMain.on('submit-create', (event, quiz) => {
  db.quiz.insert(quiz, err => {
    if (err) console.log(err);
  });
  dialog.showMessageBox({
    message: 'Add successfully!!!',
  });
  _childWindow.close()
  mainWindow.reload()
  // event.reply('create-reply')
})

//student
//nav
ipcMain.on('load-take-quiz', event => {
  mainWindow.loadFile('./student/takeQuiz.html')
  mainWindow.setResizable(true)
  mainWindow.setFullScreen(true)
  mainWindow.maximize()
  mainWindow.ontop
})

ipcMain.on('load-view-rs', e => {
  mainWindow.loadFile('./student/viewResult.html')
})

//takequiz
class QuizNoAns {
  constructor(type, question, options, _id) {
    this.type = type;
    this.question = question;
    this.options = options;
    this._id = _id;
    this.choiceIds = [];
  }
}

ipcMain.on('takeQuiz-mes', (event) => {
  db.quiz.find({}, (err, docs) => {
    const quizzesNoAns = docs.map(quiz => {
      return new QuizNoAns(quiz.type, quiz.question, quiz.options, quiz._id)
    });
    event.reply('takeQuiz-rep', quizzesNoAns);
  });
});

const MARK_PER_QUIZ = 1;

const handleSubmit = studentQuizzes => {
  let mark = 0;
  db.quiz.find({}, (err, allQuiz) => {
    studentQuizzes.forEach(stQuiz => {
      const quizAdSameId = allQuiz.find(quizAd => quizAd._id === stQuiz._id);
      const correctQuantity = quizAdSameId.answerIds.length;
      const markPerAns = MARK_PER_QUIZ / correctQuantity;

      stQuiz.choiceIds.forEach(choice => {
        const correct_ans = quizAdSameId.answerIds.find(ans => ans === choice);
        if (correct_ans && stQuiz.choiceIds.length <= quizAdSameId.answerIds.length) {
          mark += markPerAns;
        }
      })
    })
    mark = Math.round((mark + Number.EPSILON) * 100) / 100; //rounding 2 decimal place
    console.log('Mark:' + mark);
    //insert mark to db 
    db.result.insert({
      user: `${_user}`,
      quizQuantity : allQuiz.length,
      mark: mark,
      time: new Date().toLocaleString(),
    })
    //load rs after done quiz
    mainWindow.loadFile('./student/viewResult.html');
    mainWindow.setResizable(true)
    mainWindow.setSize(800,600)
  })
}
ipcMain.on('submit-test', async (event, studentQuizzes, timeleft) => {
  if (timeleft > 0) {
    let cfOptions = {}
    cfOptions.buttons = ['Sure!', 'No..']
    cfOptions.message = 'Chắc kèo chưa bro??'
    cfOptions.cancelId = 1
    dialog.showMessageBox(mainWindow, cfOptions, (res, checked) => {
      if (res === 0) {
        handleSubmit(studentQuizzes)
      }
    })
  } else {
    handleSubmit(studentQuizzes)
  }
})

//view Result
//ad
ipcMain.on('get-mark-ad', e => {
  db.result
    .find({})
    .sort({
      time: -1
    })
    .exec((err, rs) => {
      e.reply('send-result', rs)
    })
})

//st
ipcMain.on('get-mark-student', e => {
  db.result
    .find({
      user: _user
    })
    .sort({
      time: -1
    })
    .exec((err, rs) => {
      e.reply('send-result', rs)
    })
})