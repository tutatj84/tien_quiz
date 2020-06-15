const {
    ipcRenderer,
} = require('electron');

class Quiz {
  constructor(type, question, options, answerIds) {
    this.type = type;
    this.question = question;
    this.options = options;
    this.answers = answerIds;
  }
}

//list created question
ipcRenderer.send('loadAllQues-mes');
ipcRenderer.once('loadAllQues-rep', (event, questions) =>{
  console.log(questions);
  
})
//event dom 
let _lastType = null;
let _lastQues = null;
let _lastOpts = null;
let _lastAnsIds = null;

let optionDiv = document.querySelector('.opt-div');
let formCreate = document.querySelector('.form-create');
document.querySelector('.btn-create').addEventListener('click', e => {
  e.preventDefault();
  const quizType = document.querySelector('#type');
  const ansNum = document.querySelector('#ans-num');
  const createDiv = document.querySelector('create-div');
  const warning = document.querySelector('.warning');

  optionDiv.innerHTML = '';

  if (!quizType.value || !ansNum.value) {               //validate
    warning.innerHTML = 'Please select all field!!';
  } else {
    warning.innerHTML = '';
    formCreate.style.display = 'block';
    _lastType = quizType.value;

    //continue...    
    setupCreateForm(quizType.value, ansNum.value);
  }

});

function setupCreateForm(type, num) {
  for (let i = 1; i <= num; i++) {
    const opt = document.createElement('div');
    opt.classList.add(); //..
    const label = document.createElement('label');
    label.innerHTML = `Option ${i}`;
    const inputOpt = document.createElement('input');
    inputOpt.type = 'text';
    inputOpt.classList.add('input-opt');
    inputOpt.required = true;
    inputOpt.name = 'opt';
    inputOpt.placeholder = `Enter Option ${i}...`;
    const tick = document.createElement('input');
    tick.type = (type == 1) ? 'radio' : 'checkbox';
    tick.name = 'tick';
    tick.value = i;

    opt.appendChild(label);
    opt.appendChild(inputOpt);
    opt.appendChild(tick);
    optionDiv.appendChild(opt);
  }
}

document.querySelector('.btn-close').addEventListener('click', e => {
  e.preventDefault();
  //let optionDiv = document.querySelector('.opt-div');
  optionDiv.innerHTML = '';
  formCreate.style.display = 'none';
})

document.querySelector('.submit-create').addEventListener('click', e => {
  e.preventDefault();
  _lastQues = document.querySelector('#ques').value;
  const inputOpts = document.querySelectorAll('.input-opt');
  _lastOpts = Array.from(inputOpts).map(input => input.value);
  const ticks = document.querySelectorAll('input[name="tick"]:checked');
  _lastAnsIds = [...ticks].map(input => input.value);

  const warning = document.querySelector('#create-warning');
  if (!_lastType || !_lastQues || !_lastOpts[0] || !_lastAnsIds) { //validate
    warning.innerHTML = 'Please fill all fields!!';
  } else {
    const quiz = new Quiz(_lastType, _lastQues, _lastOpts, _lastAnsIds);
    console.log(quiz);
    ipcRenderer.send('submit-create', quiz);

    formCreate.style.display = 'none';
  }
})