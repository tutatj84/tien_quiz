const {
  ipcRenderer,
} = require ('electron');

//* load when start
ipcRenderer.send('takeQuiz-mes');
ipcRenderer.on('takeQuiz-rep', (event, quizzes)=>{
  console.log(quizzes);
  
})