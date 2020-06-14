// const {
//     ipcRenderer,
// } = require('electron');


//event dom 

document.querySelector('.btn-create').addEventListener('click', e => {
    e.preventDefault();
    document.querySelector('.form-create').style.display = 'block';
});
document.querySelector('.btn-close').addEventListener('click', e => {
    e.preventDefault();
    document.querySelector('.form-create').style.display = 'none';
})