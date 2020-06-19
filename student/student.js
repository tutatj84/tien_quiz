const {
  ipcRenderer,
} = require('electron');

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

//* load when start
ipcRenderer.send('takeQuiz-mes');
ipcRenderer.on('takeQuiz-rep', (event, quizzes) => {
  shuffle(quizzes);

  let _previousBtn = null;
  let _previousQuiz = null;
  const quizNav = document.querySelector('.quiz-nav');
  const table = document.querySelector('table');
  const quesDiv = document.querySelector('.ques');
  //* init nav button and quiz
  quizzes.forEach((quiz, i) => {
    const iQuiz = i + 1;    //! quiz index start with 1
    const btnQuiz = document.createElement('button');
    btnQuiz.classList.add('btn-quiz-nav');
    btnQuiz.innerText = iQuiz;
    shuffle(quiz.options)
    //1.  load 1 quiz when navigate
    btnQuiz.addEventListener('click', e => {
      e.preventDefault();
      // save student choice for each quiz
      if (_previousQuiz != null && _previousQuiz !== quiz) {
        _previousQuiz.choiceIds = [...document.querySelectorAll('input:checked')].map(input => input.value);
        if(_previousQuiz.choiceIds.length > 0) {
          _previousBtn.classList.add('picked-quiz');
        }
        
        // console.log(_previousQuiz);
      }
      _previousQuiz = quiz; //# pass by reference
      // load clicked quiz 
      btnQuiz.classList.add('present-quiz');
      if (_previousBtn !== null && _previousBtn !== btnQuiz) {
        _previousBtn.classList.remove('present-quiz');
      }

      _previousBtn = e.target;

      //ques
      quesDiv.innerHTML = '';
      quesDiv.innerText = `${quiz.question}`
      //opt
      table.innerHTML = '';

      quiz.options.forEach((opt, j) => {
        iOption = j + 1;    //! opt index start with 1
        const optRow = document.createElement('tr');
        // opt-index        
        const td1 = document.createElement('td');
        const optIndex = document.createElement('div');
        optIndex.classList.add('opt-index');
        optIndex.innerText = `${iOption}`;
        td1.appendChild(optIndex);
        optRow.appendChild(td1);
        // opt-content
        const td2 = document.createElement('td');
        td2.classList.add('opt-content');
        td2.innerText = `${opt}`;
        optRow.appendChild(td2);
        // opt-tick
        const td3 = document.createElement('td');

        const tickType = quiz.type == 1 ? 'radio' : 'checkbox';
        const tick = document.createElement('input');
        tick.type = tickType;
        tick.name = 'tick';
        tick.classList.add('opt-tick');
        tick.value = iOption;
        td3.appendChild(tick);
        optRow.appendChild(td3);

        table.appendChild(optRow);
      });   
    });
         
    quizNav.appendChild(btnQuiz);
  });
  //* submit 
  const btnSubmit = document.querySelector('#btn-submit');
  btnSubmit.addEventListener('click', e =>{
    e.preventDefault();
    //save last quiz
    _previousQuiz.choiceIds = [...document.querySelectorAll('input:checked')].map(input => input.value);
    
    //
    ipcRenderer.send('submit-test', quizzes);
    ipcRenderer.on();
  })
})