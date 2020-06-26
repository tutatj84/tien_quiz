const {
  ipcRenderer,
} = require('electron');

let timeLeft = 10 * 60;

const quizNav = document.querySelector('.quiz-nav');
const table = document.querySelector('table');
const quesDiv = document.querySelector('.ques');

const renderOptPerQuiz = (quiz, btnQuiz) => {
  quiz.options.forEach((opt, j) => {
    const optionIndex = j + 1; //! opt index start with 1
    const optRow = document.createElement('tr');

    // opt-index        
    const td1 = document.createElement('td');
    const optIndex = document.createElement('div');
    optIndex.classList.add('opt-index');
    optIndex.innerText = `${optionIndex}`;
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
    const inputEl = document.createElement('input');
    inputEl.type = tickType;
    inputEl.name = 'tick';
    inputEl.classList.add('opt-tick');
    inputEl.value = optionIndex;
    inputEl.checked = quiz.choiceIds.includes(`${optionIndex}`);
    //change button color of ticked quiz
    inputEl.addEventListener('change', (e) => {
      quiz.choiceIds = [...table.querySelectorAll('input:checked')].map(input => input.value);

      quiz.choiceIds.length > 0
        ? btnQuiz.classList.add('picked-quiz')
        : btnQuiz.classList.remove('picked-quiz');
    })

    td3.appendChild(inputEl);
    optRow.appendChild(td3);

    table.appendChild(optRow);
  });
}

const displayQuizzes = (quizzes) => {
  //* init nav button and quiz
  quizzes.forEach((quiz, i) => {
    const iQuiz = i + 1;                              //! quiz index start with 1
    const btnQuiz = document.createElement('button');
    btnQuiz.classList.add('btn-quiz-nav');
    btnQuiz.innerText = iQuiz;

    //load quiz when navigate
    btnQuiz.addEventListener('click', e => {
      e.preventDefault();

      //css for present quiz
      const prevBtn = document.querySelector('.present-quiz');
      prevBtn && prevBtn.classList.remove('present-quiz');
      e.target.classList.add('present-quiz');

      //ques
      quesDiv.innerHTML = '';
      quesDiv.innerText = `${quiz.question}`
      //opt
      table.innerHTML = '';
      renderOptPerQuiz(quiz, btnQuiz);

    });
    quizNav.appendChild(btnQuiz);

    //click quiz 1 when start
    if (i == 0) {
      btnQuiz.click();
    }
  });
}
const initSubmitHandler = (quizzes) => {
  //timer
  let _myTimer;
  _myTimer = timeCounter(document.querySelector('#time-left'));

  //* submit 
  const btnSubmit = document.querySelector('#btn-submit');
  btnSubmit.addEventListener('click', e => {
    e.preventDefault();
    clearInterval(_myTimer);

    ipcRenderer.send('submit-test', quizzes, timeLeft);
    ipcRenderer.on('submit-done', (_, mark) => {
      console.log('Mark is:' + Number(mark));
    })
  });
};

const handleWindowLoaded = () => {
  ipcRenderer.send('takeQuiz-mes');
  ipcRenderer.on('takeQuiz-rep', (_, quizzes) => {
    shuffle(quizzes);
    displayQuizzes(quizzes);
    initSubmitHandler(quizzes);
  });
}

//* load when start
window.addEventListener('load', handleWindowLoaded);

// function to call
function timeCounter(display) {
  //let timer;
  let minutes;
  let seconds;
  let myTimer = setInterval(() => {
    minutes = parseInt(timeLeft / 60, 10);
    seconds = parseInt(timeLeft % 60, 10);
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    display.textContent = minutes + ':' + seconds;
    timeLeft--;
    if (timeLeft < 0) {
      document.querySelector('#btn-submit').click();
      clearInterval(myTimer);
    }
  }, 1000);
  return myTimer;
}
function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

//close
window.onkeydown = e => {
  e.preventDefault()
}