document.addEventListener('DOMContentLoaded', init, false);
function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../service_worker.js')
      .then((reg) => {
        // console.log('Service worker registered -->', reg);
      }, (err) => {
        // console.error('Service worker not registered -->', err);
      });
  }
}

let tosignuppage = document.querySelector('#tosignuppage');
let tologinpage = document.querySelector('#tologinpage');
let signupBox = document.querySelector('.signupBox');
let loginBox = document.querySelector('.loginBox');

function changepage(){
    signupBox.classList.toggle("hide");
    loginBox.classList.toggle("hide");
}

