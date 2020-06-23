const {
  ipcRenderer,
} = require('electron');

const btnTakeQuiz = document.querySelector('#take-quiz');
const btnViewRs = document.querySelector('#view-rs');

btnTakeQuiz.addEventListener('click', e=>{
  e.preventDefault();
  ipcRenderer.send('load-take-quiz');
})

btnViewRs.addEventListener('click', e=>{
  e.preventDefault();
  ipcRenderer.send('load-view-rs');
})