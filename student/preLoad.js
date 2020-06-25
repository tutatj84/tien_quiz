const {
  ipcRenderer,
} = require('electron')

const btnLogout = document.querySelector('#logout')
const btnTakeQuiz = document.querySelector('#take-quiz')
const btnViewRs = document.querySelector('#view-rs')

btnLogout.addEventListener('click', e => {
  e.preventDefault();
  ipcRenderer.send('log-out');
})

btnTakeQuiz.addEventListener('click', e=>{
  e.preventDefault()
  ipcRenderer.send('load-take-quiz')
})

btnViewRs.addEventListener('click', e=>{
  e.preventDefault()
  ipcRenderer.send('load-view-rs')
})
