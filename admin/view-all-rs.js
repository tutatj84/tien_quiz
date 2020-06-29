const { ipcRenderer } = require('electron')

const btnQuizManage = document.querySelector('#quiz-manage');
const btnLogout = document.querySelector('#logout')


const fillRsToTable = (rs) => {
  const table = document.querySelector('table')
  const tbody = document.querySelector('tbody')

  rs.forEach((record, i)=>{
  const tr = document.createElement('tr')

  //stt
  const td1 = document.createElement('td')
  td1.textContent = i + 1
  //name
  const td2 =document.createElement('td');
  td2.textContent = record.user
  //mark
  const td3 = document.createElement('td')
  td3.textContent = record.mark + '/' + record.quizQuantity
  //date
  const td4 = document.createElement('td')
  td4.textContent = record.time

  tr.appendChild(td1)
  tr.appendChild(td2)
  tr.appendChild(td3)
  tr.appendChild(td4)
  tbody.appendChild(tr)
  })
}

ipcRenderer.send('get-mark-ad');
ipcRenderer.on('send-result', (e, rs) => {
  console.log(rs)
  fillRsToTable(rs)
  
})

btnQuizManage.addEventListener('click', e=>{
  e.preventDefault();
  ipcRenderer.send('quiz-manager');
})

btnLogout.addEventListener('click', e => {
  e.preventDefault();
  ipcRenderer.send('log-out');
})