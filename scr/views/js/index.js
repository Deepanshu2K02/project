
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('../sw.js');
}
else{
    console.log('You are offline');
}
