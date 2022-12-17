if('serviceWorker' in navigator){
    navigator.serviceWorker.register('../sw.js');
}
else{
    console.log('You are offline');
}

let tosignuppage = document.querySelector('#tosignuppage');
let tologinpage = document.querySelector('#tologinpage');
let signupBox = document.querySelector('.signupBox');
let loginBox = document.querySelector('.loginBox');

function changepage(){
    signupBox.classList.toggle("hide");
    loginBox.classList.toggle("hide");
}

