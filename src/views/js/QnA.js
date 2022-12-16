let successmsg = document.querySelector('.successmsg');

function hidit(){
    console.log('clicked');
    successmsg.classList.toggle('hide')
}

document.addEventListener('click', function handleClickOutsideBox(event) {
    const box = document.getElementById('cbox');
  
    if (!box.contains(event.target)) {
      box.style.display = 'none';
    }
  });