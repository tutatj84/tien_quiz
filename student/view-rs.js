const { ipcRenderer } = require('electron')

const btnPreLoad = document.querySelector('#preload')
const btnLogout = document.querySelector('#logout')


const fillRsToTable = (rs) => {
  const table = document.querySelector('table')
  const tbody = document.querySelector('tbody')

  rs.forEach((record, i)=>{
  const tr = document.createElement('tr')

  //stt
  const td1 = document.createElement('td')
  td1.textContent = i + 1;
  //mark
  const td2 = document.createElement('td')
  td2.textContent = record.mark + '/' + record.quizQuantity;
  //date
  const td3 = document.createElement('td')
  td3.textContent = record.time

  tr.appendChild(td1)
  tr.appendChild(td2)
  tr.appendChild(td3)
  tbody.appendChild(tr)
  })
}

ipcRenderer.send('get-mark-student');
ipcRenderer.on('send-result', (e, rs) => {
  console.log(rs)
  fillRsToTable(rs)
  
})

btnPreLoad.addEventListener('click', e => {
  ipcRenderer.send('load-preload');
})

btnLogout.addEventListener('click', e => {
  e.preventDefault();
  ipcRenderer.send('log-out');
})