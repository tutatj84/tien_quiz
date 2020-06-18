const {
  ipcRenderer,
} = require('electron');

class Quiz {
  constructor(type, question, options, answerIds) {
    this.type = type;
    this.question = question;
    this.options = options;
    this.answerIds = answerIds;
  }
}
class QuizEdited {
  constructor(type, question, options, answerIds, _id) {
    this.type = type;
    this.question = question;
    this.options = options;
    this.answerIds = answerIds;
    this._id = _id;
  }
}

//* load when start 

let _quizQuantity = 0;
ipcRenderer.send('loadAllQues-mes');
ipcRenderer.once('loadAllQues-rep', (event, quizzes) => {
  _quizQuantity = quizzes.length;
  createdQuiz_div = document.querySelector('.view-div-all');

  //list created question
  quizzes.forEach((quiz, i) => {
    createdQuiz_div.innerHTML += `
    <div class="view-div" id="div-${i}">
      <span class="div-index">#${i}</span>
      <button class="btn-edit btn-linear" id="edit-${i}">Edit 🛠</button>
      <div class="ques-div-all"><textarea readonly cols="40" rows="3">${quiz.question}</textarea>
      </div>
      <div class="opt-div-all" id="opts_${i}">

      </div>

      <button class="btn-delete"></button>
    </div>
    `;
    quiz.options.forEach((opt, j) => {
      document.querySelector(`#opts_${i}`).innerHTML += `
      <div class = "opt-div-created" id="optCreated-${j}">
        <input type="text" value="${opt}" readonly>

      </div>
      `;
      // tick
      const div_i = document.querySelector(`#div-${i}`);
      let optCreated = div_i.querySelector(`#optCreated-${j}`);
      const ticked = document.createElement('input');
      ticked.type = (quiz.type == 1) ? 'radio' : 'checkbox';
      ticked.name = `ticked-${i}`;
      ticked.value = j+1;
      ticked.disabled = true;
      if (quiz.answerIds.find(ans => ans == j + 1)) {
        ticked.setAttribute('checked', 'true');
      }
      // console.log(ticked);
      optCreated.appendChild(ticked);
    });

  });

  //edit
  quizzes.forEach((quiz, i) => {
    const div_i = document.querySelector(`#div-${i}`);
    let btnEdit = document.querySelector(`#edit-${i}`);
    document.querySelector(`#edit-${i}`).addEventListener('click', e => {
      e.preventDefault();
      let ques = div_i.querySelector('textarea');
      ques.readOnly = false;
      let opts = [...div_i.querySelectorAll('input')];
      opts.forEach(opt => {
        opt.readOnly = false;
        opt.disabled = false;
      });
      ques.focus();

      //save btn
      let btnSave = document.createElement('button');
      btnSave.innerText = `Save ✍`;
      btnSave.classList.add('btn-edit', 'btn-linear');
      div_i.replaceChild(btnSave, btnEdit);

      btnSave.addEventListener('click', () => {
        ques.readOnly = true;
        opts.forEach(opt => {
          opt.readOnly = true;
          opt.disabled = true;
        });
        //send data to server
        let editedAnsIds = [...div_i.querySelectorAll('input:checked')]                  
          .map((input, i)=> input.value);
        let editedOpts = [...div_i.querySelectorAll('input[type="text"]')].map(input=>input.value);
        
        const quizEdited = new QuizEdited(quiz.type, ques.value, editedOpts, editedAnsIds, quiz._id); 
        // console.log(quizEdited);
        
        ipcRenderer.send('edit-mes', quizEdited);

        //loading...
        let loading = document.createElement('img')
        loading.src = '../loading.gif';
        div_i.replaceChild(loading, btnSave);
        //when edit done
        ipcRenderer.once('edit-rep', () => {
          setTimeout(() => {
            div_i.replaceChild(btnEdit, div_i.querySelector('img'));
          }, 1000);
          loading.src = '../done.png';
          console.log('edit done!!');
        })
      });
    });
  });
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
});

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
    document.querySelector('.container').style.opacity = 1;
  }
  location.reload();
});

