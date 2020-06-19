const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
} = require('electron');
const path = require('path');
let Datastore = require('nedb');

function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    }
  });

  mainWindow.loadFile('./student/takeQuiz.html')
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
//admin
db = new Datastore('./database/quiz.db');
db.loadDatabase(err => {
  if (err) { console.log(err) }
});

ipcMain.on('submit-create', (event, quiz) => {
  console.log('db');

  db.insert(quiz, err => {
    if (err) console.log(err);
  });
  dialog.showMessageBox({
    message: 'Add successfully!!!',
  });
  // event.reply('create-reply')
})

ipcMain.on('loadAllQues-mes', event => {
  db.find({}, (err, docs) => {
    event.reply('loadAllQues-rep', docs);
  })

})

ipcMain.on('edit-mes', (event, quizEdited) => {
  db.update({ _id: quizEdited._id }, quizEdited, {}, (err, numAffected) => {
    if (err) {
      console.log(err);
    }
    console.log(quizEdited);

    console.log(numAffected);

    event.reply('edit-rep');
  });
})

//student
class QuizNoAns {
  constructor(type, question, options, _id) {
    this.type = type;
    this.question = question;
    this.options = options;
    this._id = _id;
  }
}

ipcMain.on('takeQuiz-mes', (event) => {
  db.find({}, (err, docs) => {
    const quizzesNoAns = docs.map(quiz => {
      return new QuizNoAns(quiz.type, quiz.question, quiz.options, quiz._id)
    });
    event.reply('takeQuiz-rep', quizzesNoAns);
  });
});

ipcMain.on('submit-test', async (event, studentQuizzes) => {
  let mark =0;
  db.find({}, (err, docs) => {
    allQuiz = docs;
    // studentQuizzes.forEach(stQuiz => {
    //   allQuiz. 
    // });
    console.log(allQuiz[1]);
    console.log(studentQuizzes[1]);
    
    
    //event.reply('submit-done');
  })
})
