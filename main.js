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

//all quiz
let allQuiz = [];
db.find({}, (err, docs) => {
  allQuiz = docs;
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
  event.reply('loadAllQues-rep', allQuiz);
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

  console.log(allQuiz[0]);

  const quizzesNoAns = allQuiz.map(quiz => {    
    return new QuizNoAns(quiz.type, quiz.question, quiz.options, quiz._id)
  });
  console.log(quizzesNoAns);
  event.reply('takeQuiz-rep', quizzesNoAns);
})
