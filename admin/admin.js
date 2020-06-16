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

//* load when start 
//list created question
let _quizQuantity = 0;
ipcRenderer.send('loadAllQues-mes');
ipcRenderer.once('loadAllQues-rep', (event, quizzes) => {
  _quizQuantity = quizzes.length;
  createdQuiz_div = document.querySelector('.view-div-all');
  quizzes.forEach((quiz, i) => {
    createdQuiz_div.innerHTML += `
    <div class="view-div">
      <span class="div-index">#${i}</span>
      <button class="btn-edit btn-linear" id="edit-${i}">Edit 🛠</button>
      <div class="ques-div-all"><textarea readonly cols="40" rows="3">${quiz.question}</textarea>
      </div>
      <div class="opt-div-all" id="opts_${i}">
  
      </div>
      <div class="ans-div">
        Answer: <input type="text" value="2" readonly>
      </div>
      <button class="btn-delete"></button>
    </div>
    `;
    quiz.options.forEach((opt) => {
      document.querySelector(`#opts_${i}`).innerHTML += `
      <input type="text" value="${opt}" readonly>
      `;
    });
  });
  for (let i = 0; i < quizzes.length; i++) {
    let btnEdit = document.querySelector(`#edit-${i}`);
    console.log(btnEdit);
    document.querySelector(`#edit-${i}`).addEventListener('click', e => {
      e.preventDefault();
      console.log(`a`);
      let ques = document.querySelector('textarea');
      ques.readOnly = false;
      let opts = [...document.querySelectorAll('input')];
      opts.forEach(opt => {
        opt.readOnly = false;
      });
      ques.focus();
  
      //save btn
      const btnSave = document.createElement('button');
      btnSave.innerText = `Save ✍`;
      btnSave.classList.add('btn-edit', 'btn-linear');
      document.querySelector('.view-div').replaceChild(btnSave, btnEdit);
  
      btnSave.addEventListener('click', () => {
        ques.readOnly = true;
        opts.forEach(opt => {
          opt.readOnly = true;
        });
        document.querySelector('.view-div').replaceChild(btnEdit, btnSave);
      });
  
      //send data to server
      // let quizEdited = new Quiz()
    });
  }
});
//* event dom 
let _lastType = null;
let _lastQues = null;
let _lastOpts = null;
let _lastAnsIds = null;

let optionDiv = document.querySelector('.opt-div');
let formCreate = document.querySelector('.form-create');
//create div
document.querySelector('.btn-create').addEventListener('click', e => {
  e.preventDefault();
  const quizType = document.querySelector('#type');
  const ansNum = document.querySelector('#ans-num');
  const createDiv = document.querySelector('create-div');
  const warning = document.querySelector('.warning');

  optionDiv.innerHTML = '';

  if (!quizType.value || !ansNum.value) { //validate
    warning.innerHTML = 'Please select all field!!';
  } else {
    warning.innerHTML = '';
    formCreate.style.display = 'block';
    document.querySelector('.container').style.opacity = 0.3;
    _lastType = quizType.value;

    setupCreateForm(quizType.value, ansNum.value);

  }

});

function setupCreateForm(type, num) {
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

// form create 
document.querySelector('.btn-close').addEventListener('click', e => {
  e.preventDefault();
  //let optionDiv = document.querySelector('.opt-div');
  optionDiv.innerHTML = '';
  formCreate.style.display = 'none';
  document.querySelector('.container').style.opacity = 1;
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
// list created quiz
//edit btn
console.log(_quizQuantity);


