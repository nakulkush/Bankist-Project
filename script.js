'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currentAcc, timer;

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
const formatMovementDate = function (date, locale) {
  const calcdaysPassed = (date1, date2) =>
    Math.round(Math.abs((date1 - date2) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcdaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth()}`.padStart(2, 0);
    // const year = date.getFullYear();

    // return `${day}/${month}/${year}`;

    return new Intl.DateTimeFormat(locale).format(date);
  }
};
const displayMovements = function (acc, sorted = false) {
  //adding the sort functionality
  containerMovements.innerHTML = '';

  const movs = sorted
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    //displaying the date
    const movDate = new Date(acc.movementsDates[i]);

    const displayDate = formatMovementDate(movDate, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const typeTrans = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${typeTrans}">${
      i + 1
    } ${typeTrans}</div>
    <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayBalance = function (acc) {
  acc.balance = acc.movements.reduce((accu, mov) => accu + mov, 0);
  labelBalance.textContent = formatCur(mov, acc.locale, acc.currency);
};

const displaySummary = function (acc) {
  const incomes = acc.movements
    .filter(deposit => deposit > 0)
    .reduce((accu, mov) => accu + mov, 0);

  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const outgoing = acc.movements
    .filter(withdraw => withdraw < 0)
    .reduce((accu, mov) => accu + mov);

  labelSumOut.textContent = formatCur(
    Math.abs(outgoing),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter(deposit => deposit > 0)
    .map(mov => (mov * 1.2) / 100)
    .filter((interest, i, arr) => {
      console.log(arr);
      return interest >= 1;
    })
    .reduce((accu, mov, i, arr) => {
      console.log(arr);
      return accu + mov;
    });

  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsername(accounts);
console.log(accounts);

const updateUI = function (acc) {
  //displaying movements
  displayMovements(acc);
  //displaying balance
  displayBalance(acc);
  //displaying summary
  displaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 120;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

//checking login
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAcc = accounts.find(acc => acc.username === inputLoginUsername.value);
  // console.log(currentAcc);
  if (currentAcc?.pin === Number(inputLoginPin.value)) {
    //displaying ui and message
    // console.log('logged in'); //if wrong username, currentAcc becomes undefined hence we use nullish operator for smooth operation of code
    labelWelcome.textContent = `Welcome back, ${
      currentAcc.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // //displaying the date
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth()}`.padStart(2, 0);
    // const year = now.getFullYear();

    // const hours = `${now.getHours()}`.padStart(2, 0);
    // const mins = `${now.getMinutes()}`.padStart(2, 0);

    // labelDate.textContent = `${day}/${month}/${year}  ${hours}:${mins}`;

    //displaying the date using Intl api

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };
    // const locale = navigator.language;//used to find the language of the browser(english/hindi etc)
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAcc.locale,
      options
    ).format(now);

    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    updateUI(currentAcc);
  }
  // console.log(currentAcc);
});

// //fake login
// currentAcc = account1;
// updateUI(currentAcc);
// containerApp.style.opacity = 100;

//transfer feature
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  //emptying the visible fields
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferTo.blur();
  // console.log(receiverAcc);
  if (
    amount > 0 &&
    receiverAcc &&
    currentAcc.balance >= amount &&
    receiverAcc?.username !== currentAcc.username
  ) {
    currentAcc.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //adding the transfer date
    currentAcc.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    //updating the UI
    updateUI(currentAcc);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});
//taking a loan feature
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  console.log(amount);

  if (
    amount > 0 &&
    //traditional method
    // currentAcc.movements.some(function (mov) {
    //   return mov >= 0.1 * amount;
    // })
    //using arrow functions
    currentAcc.movements.some(mov => mov >= 0.1 * amount)
  ) {
    setTimeout(function () {
      currentAcc.movements.push(amount);
      //adding the loan date
      currentAcc.movementsDates.push(new Date().toISOString());
      updateUI(currentAcc);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});
//close account feature
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAcc.username &&
    Number(inputClosePin.value) === currentAcc.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAcc.username
    );

    //deleting account
    accounts.splice(index, 1);

    //hideUI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
  labelWelcome.textContent = `Account Deleted Successfully`;
  // console.log(closeUser);
});

//sorting the transcations feature
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAcc, !sorted);
  sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
