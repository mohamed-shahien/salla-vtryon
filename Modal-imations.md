#one / Unfolding modale
<!-- HTML -->
<button id="open-modal-one" class="button">Open Unfolding Modal</button>

<div id="modal-container">
  <div class="modal-background">
    <div class="modal">
      <h2>I'm a Modal</h2>
      <p>Hear me roar.</p>

      <svg
        class="modal-svg"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <rect
          x="0"
          y="0"
          fill="none"
          width="100%"
          height="100%"
          rx="8"
          ry="8"
        ></rect>
      </svg>
    </div>
  </div>
</div>

/* CSS */
* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
}

body.modal-active {
  overflow: hidden;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 40px;
  padding: 12px 18px;
  border: 0;
  border-radius: 10px;
  background: #efefef;
  color: #111;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: 0.25s ease;
}

.button:hover {
  background: #009bd5;
  color: #fff;
}

#modal-container {
  position: fixed;
  inset: 0;
  display: table;
  width: 100%;
  height: 100%;
  transform: scale(0);
  z-index: 9999;
}

#modal-container .modal-background {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
}

#modal-container .modal {
  position: relative;
  display: inline-block;
  width: min(90vw, 420px);
  padding: 32px 24px;
  background: #fff;
  border-radius: 8px;
  font-weight: 300;
  transform: scale(0);
}

#modal-container .modal h2 {
  margin: 0 0 12px;
  font-size: 24px;
  line-height: 1.2;
}

#modal-container .modal p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}

#modal-container .modal-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  pointer-events: none;
}

#modal-container .modal-svg rect {
  width: 100%;
  height: 100%;
  stroke: #ffffff;
  stroke-width: 2px;
  stroke-dasharray: 778;
  stroke-dashoffset: 778;
}

/* First Modal: one / Unfolding */
#modal-container.one {
  transform: scaleY(0.01) scaleX(0);
  animation: unfoldIn 1s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.one .modal {
  transform: scale(0);
  animation: zoomIn 0.5s 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.one.out {
  transform: scale(1);
  animation: unfoldOut 1s 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.one.out .modal {
  animation: zoomOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

@keyframes unfoldIn {
  0% {
    transform: scaleY(0.005) scaleX(0);
  }
  50% {
    transform: scaleY(0.005) scaleX(1);
  }
  100% {
    transform: scaleY(1) scaleX(1);
  }
}

@keyframes unfoldOut {
  0% {
    transform: scaleY(1) scaleX(1);
  }
  50% {
    transform: scaleY(0.005) scaleX(1);
  }
  100% {
    transform: scaleY(0.005) scaleX(0);
  }
}

@keyframes zoomIn {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes zoomOut {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}

// JS
const openModalOneBtn = document.getElementById('open-modal-one');
const modalContainer = document.getElementById('modal-container');
const modalBackground = modalContainer?.querySelector('.modal-background');
const modalCard = modalContainer?.querySelector('.modal');

function openModalOne() {
  if (!modalContainer) return;

  modalContainer.className = '';
  modalContainer.classList.add('one');
  document.body.classList.add('modal-active');
}

function closeModal() {
  if (!modalContainer) return;

  modalContainer.classList.add('out');
  document.body.classList.remove('modal-active');

  setTimeout(() => {
    modalContainer.className = '';
  }, 1300);
}

openModalOneBtn?.addEventListener('click', openModalOne);

modalBackground?.addEventListener('click', closeModal);

modalCard?.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalContainer.classList.contains('one')) {
    closeModal();
  }
});




#two / Revealing


<!-- HTML -->
<button id="open-modal-two" class="button">Open Revealing Modal</button>

<div id="modal-container">
  <div class="modal-background">
    <div class="modal">
      <h2>I'm a Modal</h2>
      <p>Hear me roar.</p>
    </div>
  </div>
</div>


/* CSS */
* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
}

body.modal-active {
  overflow: hidden;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 40px;
  padding: 12px 18px;
  border: 0;
  border-radius: 10px;
  background: #efefef;
  color: #111;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: 0.25s ease;
}

.button:hover {
  background: #009bd5;
  color: #fff;
}

#modal-container {
  position: fixed;
  inset: 0;
  display: table;
  width: 100%;
  height: 100%;
  transform: scale(0);
  z-index: 9999;
}

#modal-container .modal-background {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
}

#modal-container .modal {
  display: inline-block;
  width: min(90vw, 420px);
  padding: 32px 24px;
  background: #fff;
  border-radius: 8px;
  font-weight: 300;
  opacity: 0;
}

#modal-container .modal h2 {
  margin: 0 0 12px;
  font-size: 24px;
  line-height: 1.2;
}

#modal-container .modal p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}

/* Second Modal: two / Revealing */
#modal-container.two {
  transform: scale(1);
}

#modal-container.two .modal-background {
  background: rgba(0, 0, 0, 0);
  animation: fadeIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.two .modal {
  opacity: 0;
  animation: scaleUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.two.out {
  animation: quickScaleDown 0s 0.5s linear forwards;
}

#modal-container.two.out .modal-background {
  animation: fadeOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.two.out .modal {
  animation: scaleDown 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

@keyframes fadeIn {
  0% {
    background: rgba(0, 0, 0, 0);
  }
  100% {
    background: rgba(0, 0, 0, 0.7);
  }
}

@keyframes fadeOut {
  0% {
    background: rgba(0, 0, 0, 0.7);
  }
  100% {
    background: rgba(0, 0, 0, 0);
  }
}

@keyframes scaleUp {
  0% {
    transform: scale(0.8) translateY(1000px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes scaleDown {
  0% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  100% {
    transform: scale(0.8) translateY(1000px);
    opacity: 0;
  }
}

@keyframes quickScaleDown {
  0% {
    transform: scale(1);
  }
  99.9% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}



// JS
const openModalTwoBtn = document.getElementById('open-modal-two');
const modalContainer = document.getElementById('modal-container');
const modalBackground = modalContainer?.querySelector('.modal-background');
const modalCard = modalContainer?.querySelector('.modal');

function openModalTwo() {
  if (!modalContainer) return;

  modalContainer.className = '';
  modalContainer.classList.add('two');
  document.body.classList.add('modal-active');
}

function closeModalTwo() {
  if (!modalContainer) return;

  modalContainer.classList.add('out');
  document.body.classList.remove('modal-active');

  setTimeout(() => {
    modalContainer.className = '';
  }, 500);
}

openModalTwoBtn?.addEventListener('click', openModalTwo);

modalBackground?.addEventListener('click', closeModalTwo);

modalCard?.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalContainer?.classList.contains('two')) {
    closeModalTwo();
  }
});



#three / Uncovering

<!-- HTML -->
<button id="open-modal-three" class="button">Open Uncovering Modal</button>

<div id="modal-container">
  <div class="modal-background">
    <div class="modal">
      <h2>I'm a Modal</h2>
      <p>Hear me roar.</p>
    </div>
  </div>
</div>

<div class="content">
  <h1>Page Content</h1>
  <p>This content moves while the modal appears.</p>
</div>

/* CSS */
* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
}

body.modal-active {
  overflow: hidden;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 40px;
  padding: 12px 18px;
  border: 0;
  border-radius: 10px;
  background: #efefef;
  color: #111;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: 0.25s ease;
}

.button:hover {
  background: #009bd5;
  color: #fff;
}

#modal-container {
  position: fixed;
  inset: 0;
  display: table;
  width: 100%;
  height: 100%;
  transform: scale(0);
  z-index: 9999;
}

#modal-container .modal-background {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
}

#modal-container .modal {
  display: inline-block;
  width: min(90vw, 420px);
  padding: 32px 24px;
  background: #fff;
  border-radius: 8px;
  font-weight: 300;
  position: relative;
}

#modal-container .modal h2 {
  margin: 0 0 12px;
  font-size: 24px;
  line-height: 1.2;
}

#modal-container .modal p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}

.content {
  min-height: 100vh;
  padding: 40px;
  background: #fff;
  position: relative;
  z-index: 1;
  transition: transform 0.5s ease;
}

/* Third Modal: three / Uncovering */
#modal-container.three {
  z-index: 0;
  transform: scale(1);
}

#modal-container.three .modal-background {
  background: rgba(0, 0, 0, 0.6);
}

#modal-container.three .modal {
  animation: moveUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.three + .content {
  z-index: 1;
  animation: slideUpLarge 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.three.out .modal {
  animation: moveDown 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.three.out + .content {
  animation: slideDownLarge 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

@keyframes moveUp {
  0% {
    transform: translateY(150px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes moveDown {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(150px);
  }
}

@keyframes slideUpLarge {
  0% {
    transform: translateY(0%);
  }
  100% {
    transform: translateY(-100%);
  }
}

@keyframes slideDownLarge {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(0%);
  }
}


// JS
const openModalThreeBtn = document.getElementById('open-modal-three');
const modalContainer = document.getElementById('modal-container');
const modalBackground = modalContainer?.querySelector('.modal-background');
const modalCard = modalContainer?.querySelector('.modal');

function openModalThree() {
  if (!modalContainer) return;

  modalContainer.className = '';
  modalContainer.classList.add('three');
  document.body.classList.add('modal-active');
}

function closeModalThree() {
  if (!modalContainer) return;

  modalContainer.classList.add('out');
  document.body.classList.remove('modal-active');

  setTimeout(() => {
    modalContainer.className = '';
  }, 500);
}

openModalThreeBtn?.addEventListener('click', openModalThree);

modalBackground?.addEventListener('click', closeModalThree);

modalCard?.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalContainer?.classList.contains('three')) {
    closeModalThree();
  }
});


#four / Blow Up

<!-- HTML -->
<button id="open-modal-four" class="button">Open Blow Up Modal</button>

<div id="modal-container">
  <div class="modal-background">
    <div class="modal">
      <h2>I'm a Modal</h2>
      <p>Hear me roar.</p>
    </div>
  </div>
</div>

<div class="content">
  <h1>Page Content</h1>
  <p>This content scales away while the modal opens.</p>
</div>



/* CSS */
* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
}

body.modal-active {
  overflow: hidden;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 40px;
  padding: 12px 18px;
  border: 0;
  border-radius: 10px;
  background: #efefef;
  color: #111;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: 0.25s ease;
}

.button:hover {
  background: #009bd5;
  color: #fff;
}

#modal-container {
  position: fixed;
  inset: 0;
  display: table;
  width: 100%;
  height: 100%;
  transform: scale(0);
  z-index: 9999;
}

#modal-container .modal-background {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
}

#modal-container .modal {
  display: inline-block;
  width: min(90vw, 420px);
  padding: 32px 24px;
  background: #fff;
  border-radius: 8px;
  font-weight: 300;
  position: relative;
}

#modal-container .modal h2 {
  margin: 0 0 12px;
  font-size: 24px;
  line-height: 1.2;
}

#modal-container .modal p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}

.content {
  min-height: 100vh;
  padding: 40px;
  background: #fff;
  position: relative;
  z-index: 1;
}

/* Fourth Modal: four / Blow Up */
#modal-container.four {
  z-index: 0;
  transform: scale(1);
}

#modal-container.four .modal-background {
  background: rgba(0, 0, 0, 0.7);
}

#modal-container.four .modal {
  animation: blowUpModal 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.four + .content {
  z-index: 1;
  animation: blowUpContent 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.four.out .modal {
  animation: blowUpModalTwo 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.four.out + .content {
  animation: blowUpContentTwo 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

@keyframes blowUpContent {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  99.9% {
    transform: scale(2);
    opacity: 0;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

@keyframes blowUpContentTwo {
  0% {
    transform: scale(2);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes blowUpModal {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes blowUpModalTwo {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}



// JS
const openModalFourBtn = document.getElementById('open-modal-four');
const modalContainer = document.getElementById('modal-container');
const modalBackground = modalContainer?.querySelector('.modal-background');
const modalCard = modalContainer?.querySelector('.modal');

function openModalFour() {
  if (!modalContainer) return;

  modalContainer.className = '';
  modalContainer.classList.add('four');
  document.body.classList.add('modal-active');
}

function closeModalFour() {
  if (!modalContainer) return;

  modalContainer.classList.add('out');
  document.body.classList.remove('modal-active');

  setTimeout(() => {
    modalContainer.className = '';
  }, 500);
}

openModalFourBtn?.addEventListener('click', openModalFour);

modalBackground?.addEventListener('click', closeModalFour);

modalCard?.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalContainer?.classList.contains('four')) {
    closeModalFour();
  }
});





#five / Meep Meep

<!-- HTML -->
<button id="open-modal-five" class="button">Open Meep Meep Modal</button>

<div id="modal-container">
  <div class="modal-background">
    <div class="modal">
      <h2>I'm a Modal</h2>
      <p>Hear me roar.</p>
    </div>
  </div>
</div>



/* CSS */
* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
}

body.modal-active {
  overflow: hidden;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 40px;
  padding: 12px 18px;
  border: 0;
  border-radius: 10px;
  background: #efefef;
  color: #111;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: 0.25s ease;
}

.button:hover {
  background: #009bd5;
  color: #fff;
}

#modal-container {
  position: fixed;
  inset: 0;
  display: table;
  width: 100%;
  height: 100%;
  transform: scale(0);
  z-index: 9999;
}

#modal-container .modal-background {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
}

#modal-container .modal {
  display: inline-block;
  width: min(90vw, 420px);
  padding: 32px 24px;
  background: #fff;
  border-radius: 8px;
  font-weight: 300;
  transform: translateX(-1500px);
}

#modal-container .modal h2 {
  margin: 0 0 12px;
  font-size: 24px;
  line-height: 1.2;
}

#modal-container .modal p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}

/* Fifth Modal: five / Meep Meep */
#modal-container.five {
  transform: scale(1);
}

#modal-container.five .modal-background {
  background: rgba(0, 0, 0, 0);
  animation: fadeIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.five .modal {
  transform: translateX(-1500px);
  animation: roadRunnerIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.five.out {
  animation: quickScaleDown 0s 0.5s linear forwards;
}

#modal-container.five.out .modal-background {
  animation: fadeOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.five.out .modal {
  animation: roadRunnerOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

@keyframes fadeIn {
  0% {
    background: rgba(0, 0, 0, 0);
  }
  100% {
    background: rgba(0, 0, 0, 0.7);
  }
}

@keyframes fadeOut {
  0% {
    background: rgba(0, 0, 0, 0.7);
  }
  100% {
    background: rgba(0, 0, 0, 0);
  }
}

@keyframes roadRunnerIn {
  0% {
    transform: translateX(-1500px) skewX(30deg) scaleX(1.3);
  }
  70% {
    transform: translateX(30px) skewX(0deg) scaleX(0.9);
  }
  100% {
    transform: translateX(0) skewX(0deg) scaleX(1);
  }
}

@keyframes roadRunnerOut {
  0% {
    transform: translateX(0) skewX(0deg) scaleX(1);
  }
  30% {
    transform: translateX(-30px) skewX(-5deg) scaleX(0.9);
  }
  100% {
    transform: translateX(1500px) skewX(30deg) scaleX(1.3);
  }
}

@keyframes quickScaleDown {
  0% {
    transform: scale(1);
  }
  99.9% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}


// JS
const openModalFiveBtn = document.getElementById('open-modal-five');
const modalContainer = document.getElementById('modal-container');
const modalBackground = modalContainer?.querySelector('.modal-background');
const modalCard = modalContainer?.querySelector('.modal');

function openModalFive() {
  if (!modalContainer) return;

  modalContainer.className = '';
  modalContainer.classList.add('five');
  document.body.classList.add('modal-active');
}

function closeModalFive() {
  if (!modalContainer) return;

  modalContainer.classList.add('out');
  document.body.classList.remove('modal-active');

  setTimeout(() => {
    modalContainer.className = '';
  }, 500);
}

openModalFiveBtn?.addEventListener('click', openModalFive);

modalBackground?.addEventListener('click', closeModalFive);

modalCard?.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalContainer?.classList.contains('five')) {
    closeModalFive();
  }
});





#six / Sketch



<!-- HTML -->
<button id="open-modal-six" class="button">Open Sketch Modal</button>

<div id="modal-container">
  <div class="modal-background">
    <div class="modal">
      <h2>I'm a Modal</h2>
      <p>Hear me roar.</p>

      <svg
        class="modal-svg"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <rect x="1" y="1" width="100%" height="100%" rx="8" ry="8" />
      </svg>
    </div>
  </div>
</div>


/* CSS */
* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
}

body.modal-active {
  overflow: hidden;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 40px;
  padding: 12px 18px;
  border: 0;
  border-radius: 10px;
  background: #efefef;
  color: #111;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: 0.25s ease;
}

.button:hover {
  background: #009bd5;
  color: #fff;
}

#modal-container {
  position: fixed;
  inset: 0;
  display: table;
  width: 100%;
  height: 100%;
  transform: scale(0);
  z-index: 9999;
}

#modal-container .modal-background {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
}

#modal-container .modal {
  position: relative;
  display: inline-block;
  width: min(90vw, 420px);
  padding: 32px 24px;
  border-radius: 8px;
  background: transparent;
  font-weight: 300;
  opacity: 0;
}

#modal-container .modal h2,
#modal-container .modal p {
  position: relative;
  opacity: 0;
  z-index: 2;
}

#modal-container .modal h2 {
  margin: 0 0 12px;
  font-size: 24px;
  line-height: 1.2;
}

#modal-container .modal p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}

#modal-container .modal-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

#modal-container .modal-svg rect {
  fill: none;
  stroke: #ffffff;
  stroke-width: 2;
  stroke-dasharray: 1400;
  stroke-dashoffset: 1400;
}

/* Sixth Modal: six / Sketch */
#modal-container.six {
  transform: scale(1);
}

#modal-container.six .modal-background {
  background: rgba(0, 0, 0, 0);
  animation: fadeIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.six .modal {
  background-color: transparent;
  animation: modalFadeIn 0.5s 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.six .modal h2,
#modal-container.six .modal p {
  animation: modalContentFadeIn 0.5s 1s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.six .modal-svg rect {
  animation: sketchIn 0.5s 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.six.out {
  animation: quickScaleDown 0s 0.5s linear forwards;
}

#modal-container.six.out .modal-background {
  animation: fadeOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.six.out .modal {
  animation: modalFadeOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.six.out .modal h2,
#modal-container.six.out .modal p {
  animation: modalContentFadeOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.six.out .modal-svg rect {
  animation: sketchOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

@keyframes fadeIn {
  0% {
    background: rgba(0, 0, 0, 0);
  }
  100% {
    background: rgba(0, 0, 0, 0.7);
  }
}

@keyframes fadeOut {
  0% {
    background: rgba(0, 0, 0, 0.7);
  }
  100% {
    background: rgba(0, 0, 0, 0);
  }
}

@keyframes sketchIn {
  0% {
    stroke-dashoffset: 1400;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes sketchOut {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 1400;
  }
}

@keyframes modalFadeIn {
  0% {
    background-color: transparent;
    opacity: 0;
  }
  100% {
    background-color: #fff;
    opacity: 1;
  }
}

@keyframes modalFadeOut {
  0% {
    background-color: #fff;
    opacity: 1;
  }
  100% {
    background-color: transparent;
    opacity: 0;
  }
}

@keyframes modalContentFadeIn {
  0% {
    opacity: 0;
    top: -20px;
  }
  100% {
    opacity: 1;
    top: 0;
  }
}

@keyframes modalContentFadeOut {
  0% {
    opacity: 1;
    top: 0;
  }
  100% {
    opacity: 0;
    top: -20px;
  }
}

@keyframes quickScaleDown {
  0% {
    transform: scale(1);
  }
  99.9% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}



// JS
const openModalSixBtn = document.getElementById('open-modal-six');
const modalContainer = document.getElementById('modal-container');
const modalBackground = modalContainer?.querySelector('.modal-background');
const modalCard = modalContainer?.querySelector('.modal');

function openModalSix() {
  if (!modalContainer) return;

  modalContainer.className = '';
  modalContainer.classList.add('six');
  document.body.classList.add('modal-active');
}

function closeModalSix() {
  if (!modalContainer) return;

  modalContainer.classList.add('out');
  document.body.classList.remove('modal-active');

  setTimeout(() => {
    modalContainer.className = '';
  }, 500);
}

openModalSixBtn?.addEventListener('click', openModalSix);

modalBackground?.addEventListener('click', closeModalSix);

modalCard?.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalContainer?.classList.contains('six')) {
    closeModalSix();
  }
});




#seven / Bond

<!-- HTML -->
<button id="open-modal-seven" class="button">Open Bond Modal</button>

<div id="modal-container">
  <div class="modal-background">
    <div class="modal">
      <h2>I'm a Modal</h2>
      <p>Hear me roar.</p>
    </div>
  </div>
</div>



/* CSS */
* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
}

body.modal-active {
  overflow: hidden;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 40px;
  padding: 12px 18px;
  border: 0;
  border-radius: 10px;
  background: #efefef;
  color: #111;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: 0.25s ease;
}

.button:hover {
  background: #009bd5;
  color: #fff;
}

#modal-container {
  position: fixed;
  inset: 0;
  display: table;
  width: 100%;
  height: 100%;
  transform: scale(0);
  z-index: 9999;
}

#modal-container .modal-background {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
}

#modal-container .modal {
  display: inline-block;
  width: 227px;
  height: 162px;
  padding: 32px 24px;
  background: #fff;
  border-radius: 3px;
  font-weight: 300;
  position: relative;
  overflow: hidden;
}

#modal-container .modal h2,
#modal-container .modal p {
  opacity: 0;
  position: relative;
}

#modal-container .modal h2 {
  margin: 0 0 12px;
  font-size: 24px;
  line-height: 1.2;
}

#modal-container .modal p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}

/* Seventh Modal: seven / Bond */
#modal-container.seven {
  transform: scale(1);
}

#modal-container.seven .modal-background {
  background: rgba(0, 0, 0, 0);
  animation: fadeIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.seven .modal {
  width: 75px;
  height: 75px;
  border-radius: 75px;
  overflow: hidden;
  animation: bondJamesBond 1.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.seven .modal h2,
#modal-container.seven .modal p {
  animation: modalContentFadeIn 0.5s 1.4s linear forwards;
}

#modal-container.seven.out {
  animation: slowFade 0.5s 1.5s linear forwards;
}

#modal-container.seven.out .modal-background {
  background-color: rgba(0, 0, 0, 0.7);
  animation: fadeToRed 2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.seven.out .modal {
  border-radius: 3px;
  height: 162px;
  width: 227px;
  animation: killShot 1s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

#modal-container.seven.out .modal h2,
#modal-container.seven.out .modal p {
  animation: modalContentFadeOut 0.5s 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

@keyframes fadeIn {
  0% {
    background: rgba(0, 0, 0, 0);
  }
  100% {
    background: rgba(0, 0, 0, 0.7);
  }
}

@keyframes bondJamesBond {
  0% {
    transform: translateX(1000px);
  }
  80% {
    transform: translateX(0);
    border-radius: 75px;
    width: 75px;
    height: 75px;
  }
  90% {
    border-radius: 3px;
    width: 247px;
    height: 182px;
  }
  100% {
    border-radius: 3px;
    width: 227px;
    height: 162px;
  }
}

@keyframes modalContentFadeIn {
  0% {
    opacity: 0;
    top: -20px;
  }
  100% {
    opacity: 1;
    top: 0;
  }
}

@keyframes modalContentFadeOut {
  0% {
    opacity: 1;
    top: 0;
  }
  100% {
    opacity: 0;
    top: -20px;
  }
}

@keyframes killShot {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(300px) rotate(45deg);
    opacity: 0;
  }
}

@keyframes fadeToRed {
  0% {
    background-color: rgba(0, 0, 0, 0.6);
  }
  100% {
    background-color: rgba(255, 0, 0, 0.8);
  }
}

@keyframes slowFade {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  99.9% {
    opacity: 0;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0);
  }
}


// JS
const openModalSevenBtn = document.getElementById('open-modal-seven');
const modalContainer = document.getElementById('modal-container');
const modalBackground = modalContainer?.querySelector('.modal-background');
const modalCard = modalContainer?.querySelector('.modal');

function openModalSeven() {
  if (!modalContainer) return;

  modalContainer.className = '';
  modalContainer.classList.add('seven');
  document.body.classList.add('modal-active');
}

function closeModalSeven() {
  if (!modalContainer) return;

  modalContainer.classList.add('out');
  document.body.classList.remove('modal-active');

  setTimeout(() => {
    modalContainer.className = '';
  }, 2000);
}

openModalSevenBtn?.addEventListener('click', openModalSeven);

modalBackground?.addEventListener('click', closeModalSeven);

modalCard?.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalContainer?.classList.contains('seven')) {
    closeModalSeven();
  }
});


#eight /  Aurora


<!-- HTML -->
<button id="open-modal-eight" class="button">Open Aurora Modal</button>

<div id="modal-container">
  <div class="modal-background">
    <div class="modal">
      <span class="modal-badge">New</span>
      <h2>Aurora Modal</h2>
      <p>
        Smooth glass-style modal with soft glow, blur backdrop, and premium entrance animation.
      </p>

      <div class="modal-actions">
        <button class="modal-btn modal-btn--ghost" type="button">Cancel</button>
        <button class="modal-btn modal-btn--primary" type="button">Continue</button>
      </div>
    </div>
  </div>
</div>


/* CSS */
* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
}

body.modal-active {
  overflow: hidden;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 40px;
  padding: 12px 18px;
  border: 0;
  border-radius: 12px;
  background: #efefef;
  color: #111;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: 0.25s ease;
}

.button:hover {
  background: #111827;
  color: #fff;
}

#modal-container {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  transform: scale(0);
  z-index: 9999;
}

#modal-container .modal-background {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0);
  -webkit-backdrop-filter: blur(0);
}

#modal-container .modal {
  position: relative;
  width: min(92vw, 460px);
  padding: 24px;
  border-radius: 24px;
  color: #fff;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  overflow: hidden;
  opacity: 0;
  transform: translateY(40px) scale(0.92) rotateX(-12deg);
  transform-origin: center center;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

#modal-container .modal::before,
#modal-container .modal::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

#modal-container .modal::before {
  top: -80px;
  left: -60px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.45), transparent 70%);
}

#modal-container .modal::after {
  right: -70px;
  bottom: -90px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.35), transparent 70%);
}

#modal-container .modal-badge {
  position: relative;
  z-index: 1;
  display: inline-flex;
  margin-bottom: 14px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

#modal-container .modal h2,
#modal-container .modal p,
#modal-container .modal-actions {
  position: relative;
  z-index: 1;
}

#modal-container .modal h2 {
  margin: 0 0 12px;
  font-size: 28px;
  line-height: 1.2;
}

#modal-container .modal p {
  margin: 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: 16px;
  line-height: 1.7;
}

#modal-container .modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

#modal-container .modal-btn {
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
}

#modal-container .modal-btn--ghost {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

#modal-container .modal-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.14);
}

#modal-container .modal-btn--primary {
  color: #0f172a;
  background: #fff;
}

#modal-container .modal-btn--primary:hover {
  transform: translateY(-1px);
}

/* Eighth Modal: eight / Aurora */
#modal-container.eight {
  transform: scale(1);
}

#modal-container.eight .modal-background {
  animation: auroraBackdropIn 0.45s ease forwards;
}

#modal-container.eight .modal {
  animation: auroraModalIn 0.65s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
}

#modal-container.eight.out .modal-background {
  animation: auroraBackdropOut 0.35s ease forwards;
}

#modal-container.eight.out .modal {
  animation: auroraModalOut 0.35s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
}

#modal-container.eight.out {
  animation: quickScaleDown 0s 0.35s linear forwards;
}

@keyframes auroraBackdropIn {
  0% {
    background: rgba(0, 0, 0, 0);
    backdrop-filter: blur(0);
    -webkit-backdrop-filter: blur(0);
  }
  100% {
    background: rgba(3, 7, 18, 0.58);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}

@keyframes auroraBackdropOut {
  0% {
    background: rgba(3, 7, 18, 0.58);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  100% {
    background: rgba(0, 0, 0, 0);
    backdrop-filter: blur(0);
    -webkit-backdrop-filter: blur(0);
  }
}

@keyframes auroraModalIn {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.92) rotateX(-12deg);
    filter: blur(8px);
  }
  60% {
    opacity: 1;
    transform: translateY(-6px) scale(1.02) rotateX(0deg);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0deg);
    filter: blur(0);
  }
}

@keyframes auroraModalOut {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0deg);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateY(24px) scale(0.94) rotateX(8deg);
    filter: blur(6px);
  }
}

@keyframes quickScaleDown {
  0% {
    transform: scale(1);
  }
  99.9% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}



// JS
const openModalEightBtn = document.getElementById('open-modal-eight');
const modalContainer = document.getElementById('modal-container');
const modalBackground = modalContainer?.querySelector('.modal-background');
const modalCard = modalContainer?.querySelector('.modal');

function openModalEight() {
  if (!modalContainer) return;

  modalContainer.className = '';
  modalContainer.classList.add('eight');
  document.body.classList.add('modal-active');
}

function closeModalEight() {
  if (!modalContainer) return;

  modalContainer.classList.add('out');
  document.body.classList.remove('modal-active');

  setTimeout(() => {
    modalContainer.className = '';
  }, 350);
}

openModalEightBtn?.addEventListener('click', openModalEight);
modalBackground?.addEventListener('click', closeModalEight);

modalCard?.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalContainer?.classList.contains('eight')) {
    closeModalEight();
  }
});



#nine / Cyber Pulse


<button id="open-modal-nine" class="button">Open Hologram Modal</button>
<div id="modal-container">
        <div class="modal-background">
                <div class="modal-noise"></div>
                <div class="modal">
                        <div class="modal-scanline"></div>
                        <div class="modal-corners"> <span></span> <span></span> <span></span> <span></span> </div> <span
                                class="modal-badge">System Alert</span>
                        <h2>Hologram Pulse</h2>
                        <p> Futuristic hologram modal with pulse glow, scanline sweep, animated corners, and layered
                                neon entrance. </p>
                        <div class="modal-actions"> <button class="modal-btn modal-btn--ghost"
                                        type="button">Dismiss</button> <button class="modal-btn modal-btn--primary"
                                        type="button">Proceed</button> </div>
                </div>
        </div>
</div>


{
                box-sizing: border-box;
        }

        html,
        body {
                min-height: 100%;
                margin: 0;
                font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
                background: radial-gradient(circle at top, #132238 0%, #09111d 45%, #04070c 100%);
        }

        body.modal-active {
                overflow: hidden;
        }

        .button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin: 40px;
                padding: 13px 20px;
                border: 0;
                border-radius: 14px;
                background: linear-gradient(135deg, #00d4ff, #7c3aed);
                color: #fff;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 18px 42px rgba(0, 212, 255, 0.22);
                transition: 0.3s ease;
        }

        .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 24px 54px rgba(124, 58, 237, 0.24);
        }

        #modal-container {
                position: fixed;
                inset: 0;
                display: grid;
                place-items: center;
                transform: scale(0);
                z-index: 9999;
        }

        #modal-container .modal-background {
                position: absolute;
                inset: 0;
                display: grid;
                place-items: center;
                padding: 24px;
                overflow: hidden;
                background: rgba(2, 8, 20, 0);
                backdrop-filter: blur(0);
                -webkit-backdrop-filter: blur(0);
        }

        #modal-container .modal-noise {
                position: absolute;
                inset: 0;
                opacity: 0;
                background-image: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.05) 1px, transparent 1px), radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.035) 1px, transparent 1px), radial-gradient(circle at 30% 80%, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
                background-size: 120px 120px, 160px 160px, 140px 140px;
                pointer-events: none;
        }

        #modal-container .modal {
                position: relative;
                width: min(92vw, 520px);
                padding: 30px 28px;
                border-radius: 26px;
                overflow: hidden;
                color: #e8fbff;
                background: linear-gradient(145deg, rgba(4, 20, 35, 0.88), rgba(12, 32, 54, 0.68));
                border: 1px solid rgba(0, 212, 255, 0.22);
                box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.03) inset, 0 30px 80px rgba(0, 0, 0, 0.52), 0 0 40px rgba(0, 212, 255, 0.12);
                opacity: 0;
                transform: perspective(1200px) rotateX(18deg) scale(0.82) translateY(40px);
                transform-origin: center center;
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
        }

        #modal-container .modal::before {
                content: "";
                position: absolute;
                inset: -1px;
                border-radius: inherit;
                background: linear-gradient(135deg, rgba(0, 212, 255, 0.55), rgba(124, 58, 237, 0.25), rgba(0, 212, 255, 0.1));
                filter: blur(16px);
                opacity: 0.7;
                z-index: 0;
        }

        #modal-container .modal::after {
                content: "";
                position: absolute;
                inset: 1px;
                border-radius: 24px;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.015));
                z-index: 0;
        }

        #modal-container .modal-scanline {
                position: absolute;
                top: -40%;
                left: -20%;
                width: 140%;
                height: 120px;
                background: linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.08), rgba(255, 255, 255, 0.18), rgba(0, 212, 255, 0.08), transparent);
                transform: rotate(-6deg);
                opacity: 0;
                pointer-events: none;
                z-index: 1;
        }

        #modal-container .modal-corners {
                position: absolute;
                inset: 0;
                z-index: 2;
                pointer-events: none;
        }

        #modal-container .modal-corners span {
                position: absolute;
                width: 36px;
                height: 36px;
                border-color: #67e8f9;
                opacity: 0;
        }

        #modal-container .modal-corners span:nth-child(1) {
                top: 14px;
                left: 14px;
                border-top: 2px solid;
                border-left: 2px solid;
        }

        #modal-container .modal-corners span:nth-child(2) {
                top: 14px;
                right: 14px;
                border-top: 2px solid;
                border-right: 2px solid;
        }

        #modal-container .modal-corners span:nth-child(3) {
                bottom: 14px;
                left: 14px;
                border-bottom: 2px solid;
                border-left: 2px solid;
        }

        #modal-container .modal-corners span:nth-child(4) {
                bottom: 14px;
                right: 14px;
                border-bottom: 2px solid;
                border-right: 2px solid;
        }

        #modal-container .modal-badge,
        #modal-container .modal h2,
        #modal-container .modal p,
        #modal-container .modal-actions {
                position: relative;
                z-index: 3;
        }

        #modal-container .modal-badge {
                display: inline-flex;
                margin-bottom: 16px;
                padding: 8px 12px;
                border-radius: 999px;
                background: rgba(0, 212, 255, 0.09);
                border: 1px solid rgba(103, 232, 249, 0.2);
                color: #a5f3fc;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                opacity: 0;
                transform: translateY(16px);
        }

        #modal-container .modal h2 {
                margin: 0 0 12px;
                font-size: 32px;
                line-height: 1.15;
                color: #f0fdff;
                text-shadow: 0 0 14px rgba(0, 212, 255, 0.14);
                opacity: 0;
                transform: translateY(20px);
        }

        #modal-container .modal p {
                margin: 0;
                font-size: 16px;
                line-height: 1.8;
                color: rgba(232, 251, 255, 0.82);
                opacity: 0;
                transform: translateY(20px);
        }

        #modal-container .modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                margin-top: 24px;
                opacity: 0;
                transform: translateY(20px);
        }

        #modal-container .modal-btn {
                border: 0;
                border-radius: 14px;
                padding: 12px 18px;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                transition: 0.25s ease;
        }

        #modal-container .modal-btn--ghost {
                color: #e8fbff;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(103, 232, 249, 0.12);
        }

        #modal-container .modal-btn--ghost:hover {
                background: rgba(255, 255, 255, 0.1);
        }

        #modal-container .modal-btn--primary {
                color: #04121f;
                background: linear-gradient(135deg, #67e8f9, #00d4ff);
                box-shadow: 0 14px 30px rgba(0, 212, 255, 0.22);
        }

        #modal-container .modal-btn--primary:hover {
                transform: translateY(-1px);
        }

        /* Ninth Modal: nine / Hologram Pulse */
        #modal-container.nine {
                transform: scale(1);
        }

        #modal-container.nine .modal-background {
                animation: holoBackdropIn 0.45s ease forwards;
        }

        #modal-container.nine .modal-noise {
                animation: noiseFadeIn 0.45s ease forwards;
        }

        #modal-container.nine .modal {
                animation: hologramIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards, pulseGlow 2.2s ease-in-out infinite 0.8s;
        }

        #modal-container.nine .modal-scanline {
                animation: scanlineSweep 2.2s linear infinite 0.7s;
        }

        #modal-container.nine .modal-corners span {
                animation: cornerReveal 0.45s ease forwards;
        }

        #modal-container.nine .modal-corners span:nth-child(1) {
                animation-delay: 0.45s;
        }

        #modal-container.nine .modal-corners span:nth-child(2) {
                animation-delay: 0.55s;
        }

        #modal-container.nine .modal-corners span:nth-child(3) {
                animation-delay: 0.65s;
        }

        #modal-container.nine .modal-corners span:nth-child(4) {
                animation-delay: 0.75s;
        }

        #modal-container.nine .modal-badge {
                animation: contentRise 0.4s 0.45s ease forwards;
        }

        #modal-container.nine .modal h2 {
                animation: contentRise 0.4s 0.56s ease forwards;
        }

        #modal-container.nine .modal p {
                animation: contentRise 0.4s 0.68s ease forwards;
        }

        #modal-container.nine .modal-actions {
                animation: contentRise 0.4s 0.8s ease forwards;
        }

        #modal-container.nine.out .modal-background {
                animation: holoBackdropOut 0.35s ease forwards;
        }

        #modal-container.nine.out .modal-noise,
        #modal-container.nine.out .modal-scanline,
        #modal-container.nine.out .modal-corners span,
        #modal-container.nine.out .modal {
                animation-play-state: paused;
        }

        #modal-container.nine.out .modal {
                animation: hologramOut 0.35s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }

        #modal-container.nine.out {
                animation: quickScaleDown 0s 0.35s linear forwards;
        }

        @keyframes holoBackdropIn {
                0% {
                        background: rgba(2, 8, 20, 0);
                        backdrop-filter: blur(0);
                        -webkit-backdrop-filter: blur(0);
                }

                100% {
                        background: rgba(2, 8, 20, 0.68);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                }
        }

        @keyframes holoBackdropOut {
                0% {
                        opacity: 1;
                }

                100% {
                        opacity: 0;
                }
        }

        @keyframes noiseFadeIn {
                0% {
                        opacity: 0;
                }

                100% {
                        opacity: 0.55;
                }
        }

        @keyframes hologramIn {
                0% {
                        opacity: 0;
                        transform: perspective(1200px) rotateX(18deg) scale(0.82) translateY(40px);
                        filter: blur(10px);
                }

                60% {
                        opacity: 1;
                        transform: perspective(1200px) rotateX(-3deg) scale(1.02) translateY(-4px);
                        filter: blur(0);
                }

                100% {
                        opacity: 1;
                        transform: perspective(1200px) rotateX(0deg) scale(1) translateY(0);
                        filter: blur(0);
                }
        }

        @keyframes hologramOut {
                0% {
                        opacity: 1;
                        transform: perspective(1200px) rotateX(0deg) scale(1) translateY(0);
                        filter: blur(0);
                }

                100% {
                        opacity: 0;
                        transform: perspective(1200px) rotateX(14deg) scale(0.9) translateY(28px);
                        filter: blur(8px);
                }
        }

        @keyframes pulseGlow {

                0%,
                100% {
                        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.03) inset, 0 30px 80px rgba(0, 0, 0, 0.52), 0 0 28px rgba(0, 212, 255, 0.1);
                }

                50% {
                        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04) inset, 0 30px 80px rgba(0, 0, 0, 0.52), 0 0 52px rgba(0, 212, 255, 0.2);
                }
        }

        @keyframes scanlineSweep {
                0% {
                        top: -40%;
                        opacity: 0;
                }

                15% {
                        opacity: 1;
                }

                50% {
                        opacity: 0.8;
                }

                100% {
                        top: 120%;
                        opacity: 0;
                }
        }

        @keyframes cornerReveal {
                0% {
                        opacity: 0;
                        transform: scale(0.7);
                }

                100% {
                        opacity: 1;
                        transform: scale(1);
                }
        }

        @keyframes contentRise {
                0% {
                        opacity: 0;
                        transform: translateY(20px);
                }

                100% {
                        opacity: 1;
                        transform: translateY(0);
                }
        }

        @keyframes quickScaleDown {
                0% {
                        transform: scale(1);
                }

                99.9% {
                        transform: scale(1);
                }

                100% {
                        transform: scale(0);
                }
        }



const openModalNineBtn = document.getElementById('open-modal-nine'); const modalContainer = document.getElementById('modal-container'); const modalBackground = modalContainer?.querySelector('.modal-background'); const modalCard = modalContainer?.querySelector('.modal'); function openModalNine() { if (!modalContainer) return; modalContainer.className = ''; modalContainer.classList.add('nine'); document.body.classList.add('modal-active'); } function closeModalNine() { if (!modalContainer) return; modalContainer.classList.add('out'); document.body.classList.remove('modal-active'); setTimeout(() => { modalContainer.className = ''; }, 350); } openModalNineBtn?.addEventListener('click', openModalNine); modalBackground?.addEventListener('click', closeModalNine); modalCard?.addEventListener('click', (e) => { e.stopPropagation(); }); document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalContainer?.classList.contains('nine')) { closeModalNine(); } });

















Read the project docs first and treat them as source of truth.

Your task is to revamp the widget settings system end-to-end without breaking the current Virtual Try-On architecture.

Scope:
- Work only on the widget settings experience, config model, dashboard settings UI, widget preset system, modal preset system, visual identity settings, display rules, and runtime safeguards.
- Do not re-architect auth, credits, AI pipeline, or job processing unless a tiny supporting change is strictly required.

Critical architectural rules:
- Keep the existing hybrid model intact:
  - Dashboard = Embedded App inside Salla
  - Storefront widget = App Snippet / Device Mode runtime
- Embedded SDK is for dashboard context only.
- Do not make the storefront widget depend on Salla Embedded SDK.
- merchant_id remains the source of truth.
- Preserve Shadow DOM/style isolation, bundle discipline, selected-products logic, and existing runtime safety fixes.

Before coding:
1. Audit the current settings page, current widget config contract, and current storefront widget renderer.
2. Search the repo for `Modal-imations.md`.
   - Also check likely typo variants such as `Modal-animations.md` and `modal-animations.md`.
   - Use that file as the source of truth for modal/window animations.
3. Identify which current settings are purely cosmetic and not actually applied in storefront runtime.
4. Keep backward compatibility for existing merchant settings.

Implement the following:

1) Button Templates
- Build a registry of 20 distinct button presets for the widget trigger.
- Each preset must have a unique visual identity, not just color swaps.
- Support label, icon enable/disable, icon position, size, inline/full-width behavior, and mobile sticky option.
- Remove any generic “button style” setting that conflicts with preset ownership.

2) Window Templates
- Build a registry of 10 distinct modal/window presets.
- Each preset must define layout + motion + header/footer composition + state rendering behavior.
- Map animations from the modal animations doc instead of inventing a new motion language.
- Respect prefers-reduced-motion.

3) Visual Identity
- Replace the weak visual settings with a real token-based visual identity section.
- Keep brand color.
- Add settings such as surface style, corner radius, spacing density, typography tone, visual intensity, icon style, backdrop style, motion energy, and state emphasis.
- Remove “window width” as an isolated setting.
- Replace “shadow intensity” with a more valuable system like visual intensity or surface depth.

4) Display Rules
- Upgrade the current operational/display rules into a real runtime system.
- Support eligibility mode, placement target, display timing, trigger behavior, availability conditions, fallback strategy, device-specific behavior, localization mode, and state messaging policy.
- Ensure every rule is actually enforced in storefront runtime, not just saved in dashboard UI.

5) Access & Runtime Safeguards
- Add diagnostics/status indicators for config publish state, storefront render status, subscription/credits availability, and protected feature availability.
- Ensure inactive/uninstalled merchants return safe config behavior.
- Ensure zero-credit behavior is configurable and correctly enforced.

6) Data + Validation
- Introduce a versioned widget settings schema (v2).
- Add Zod validation and safe defaults.
- Keep backward compatibility with the existing schema.
- Do not store raw CSS or arbitrary merchant-provided styling.

7) Dashboard UI
- Rebuild the settings page sections with a clean, production-grade UX.
- Add live preview that uses the same rendering primitives/config logic as the storefront widget as much as possible.
- Use shadcn/ui patterns and keep the page embedded-friendly.

8) Storefront Runtime
- Implement config resolver + preset resolver + placement resolver.
- Maintain style isolation and performance discipline.
- Do not regress current polling/error/image safety fixes.

Verification requirements:
- Test desktop/mobile behavior.
- Test all-products vs selected-products eligibility.
- Test placement fallbacks.
- Test no-credits, inactive merchant, uninstalled app, and invalid config scenarios.
- Verify the new settings actually change storefront output.

Output requirements:
- Keep changes scoped.
- Update STATUS.md and HANDOFF.md when finished if they exist in the repo.
- Add a concise implementation summary and list exactly what was changed.
- Reference the plan in: `docs/02-architecture/widget-settings-revamp-plan.md`

Use this file as the implementation plan:
`docs/02-architecture/widget-settings-revamp-plan.md`