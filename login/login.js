const { ipcRenderer } = require('electron');

const formLogin = document.querySelector('.form-login');
const user = document.querySelector('#user');
const pass = document.querySelector('#pass');
const btnSubmit = document.querySelector('#submit');
const warning = document.querySelector('.warning');

class Account {
  constructor(user, pass, role) {
    this.user = user;
    this.pass = pass;
    this.role = role;
  }
}

formLogin.addEventListener('submit', e => {
  e.preventDefault();
  ipcRenderer.send('login', user.value.trim(), pass.value.trim());
  ipcRenderer.on('login-fail', e => {
    warning.innerHTML = 'Login failed!!';
    console.log(warning);
    
  })
})
