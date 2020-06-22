const { ipcRenderer } = require('electron');
let optionDiv = document.querySelector('.opt-div');

class Quiz {
  constructor(type, question, options, answerIds) {
    this.time = Date.now();
    this.type = type;
    this.question = question;
    this.options = options;
    this.answerIds = answerIds;
  }
}

let _lastType;
ipcRenderer.send('get-parent-info');
ipcRenderer.on('get-parent-info-rep', (e, type, num) => {
  _lastType = type;
  setupCreateForm(type, num, optionDiv);
})

document.querySelector('.submit-create').addEventListener('click', e => {
  e.preventDefault();
  const ques = document.querySelector('#ques').value;
  const inputOpts = document.querySelectorAll('.input-opt');
  const opts = Array.from(inputOpts).map(input => input.value);
  const ticks = document.querySelectorAll('input[name="tick"]:checked');
  const ansIds = [...ticks].map(input => input.value);
  const warning = document.querySelector('#create-warning');

  if (!_lastType || !ques || !opts.length || !ticks.length
    || !ansIds || isInputArrayEmpty(opts)) { //validate
    warning.innerHTML = 'Please fill all fields!!';
  } else {
    const quiz = new Quiz(_lastType, ques, opts, ansIds);
    console.log(quiz);
    ipcRenderer.send('submit-create', quiz);

  }
});

//function to call
function setupCreateForm(type, num, optionDiv) {
  optionDiv.innerHTML = '';
  for (let i = 1; i <= num; i++) {
    const opt = document.createElement('div');
    opt.classList.add(); //..
    const label = document.createElement('label');
    label.innerHTML = `Option ${i}: `;
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

function isInputArrayEmpty(inputs) {
  inputs.forEach(input => {
    if (!input.value) return false;
  })
}