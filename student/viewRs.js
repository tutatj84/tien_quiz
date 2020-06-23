const {ipcRenderer} = require('electron');

const btnPreLoad = document.querySelector('#preload');

btnPreLoad.addEventListener('click', e =>{
  ipcRenderer.send('load-preload');
})