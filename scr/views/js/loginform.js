let pass1 = document.querySelector('#spassword');
        let pass2 = document.querySelector('#spasswordagain');

        function checkmatch(){
            if(pass1.value===pass2.value){
                 document.querySelector('#buton').innerHTML = ''
            }
            else{
                document.querySelector('#buton').innerHTML = '<button class="btn-primary btn-sm" type="submit">Login In</button>'
            }
        }