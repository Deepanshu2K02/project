import { createRequire } from "module";
const require = createRequire(import.meta.url);
import validator from 'validator';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const express = require('express');
const http = require('https');
const bodyparser = require('body-parser');
const FormData = require('form-data');
const fs = require("fs");
const fetch = require('node-fetch');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const app = express();
// let initializeApp  = require('firebase/app')

import { initializeApp } from 'firebase/app';
import {
   getFirestore,collection, getDocs , onSnapshot, getDoc,
    addDoc , deleteDoc ,doc , query , where, orderBy, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword, getAuth, onAuthStateChanged, getRedirectResult,
    signInWithPopup, signInWithEmailAndPassword, signOut, GoogleAuthProvider ,updateProfile
} from 'firebase/auth';
import { connectStorageEmulator, getStorage,ref,uploadString,getDownloadURL,listAll} from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyBR2x1LfeDAgPo2ezzOtCk9xOUcQXFsO3k",
    authDomain: "text-tools-397da.firebaseapp.com",
    projectId: "text-tools-397da",
    storageBucket: "text-tools-397da.appspot.com",
    messagingSenderId: "1039784491156",
    appId: "1:1039784491156:web:6154e8fb9d66844ed5dc81"
};

initializeApp(firebaseConfig)  // init firebase app
const db = getFirestore();     //init database
const auth = getAuth();
const storage = getStorage();
const storageRef = ref(storage);

const imageStorage = multer.diskStorage({
    // Destination to store image     
    destination: 'images', 
      filename: (req, file, cb) => {
          cb(null, file.originalname)
    }
});
const imageUpload = multer({
    storage: imageStorage,
    limits: {
      fileSize: 10000000 // 10000000 Bytes = 10 MB
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg)$/)) { 
         return cb(new Error('Please upload a Image'))
       }
     cb(undefined, true)
  }
}) 

const filedownload = async (file_path)=>{

// Create a reference to the file we want to download
const starsRef = ref(storage, file_path);

// Get the download URL
return await getDownloadURL(starsRef)
  .then((url) => {
    return url;
  })
  .catch((error) => {
    return error.code;
  });
}

const colRef = collection(db,'users')  // get collection reference
app.set('view engine' , 'ejs');
app.use(express.static(path.join(__dirname, '/views')))
app.use(bodyparser.urlencoded());
app.use(bodyparser.json());

const allurlformpath = async (path)=>{
    let imgurls = [];
    const listRef = ref(storage, path);

    try{
        let response = await listAll(listRef);

        for (const i of response.items) {
            let url = await filedownload(i.fullPath);
            imgurls.push(url)
        }

        return imgurls;
    }
   catch(error){
    console.log(error);
    return ['error'];
   }
    

}



/***************************************   USER ACTIONS   ***********************************************************/

app.get('/',(req,res,next)=>{

    let user = auth.currentUser;
    if(user){
    res.render('index.ejs');
    }
    else{
        res.redirect('/loginpage');
    }
});

app.get('/loginpage',(req,res)=>{
    let user = auth.currentUser;
    if(user){
        res.redirect('/userpage');
    }
    else{
        res.render('LoginPage.ejs',{
            code : 'login',
            error : ''
        });
    }
    
});

app.get('/userpage',async (req,res)=>{

    const auth = getAuth();
    const user = auth.currentUser;
    if (user !== null) {
    console.log(user.displayName);
    
    let imgtotxturls = await allurlformpath(`users/${user.uid}/imgtotxt`);
    console.log(imgtotxturls);

    let summaryurls = await allurlformpath(`users/${user.uid}/summary`);
    console.log(summaryurls);

    let QnAurls = await allurlformpath(`users/${user.uid}/QnA`);
    console.log(QnAurls);

    let translatedurls = await allurlformpath(`users/${user.uid}/translation`);
    console.log(translatedurls);
    
    res.render('User.ejs');

    }
    else{
        res.redirect('/loginpage');
    }
});

app.get('/error',(req,res)=>{
    console.log(req.body);
    res.write('You are getting error , find cause for it');
    res.end();
})

app.post('/signup',(req,res)=>{
    console.log(__dirname)
    let email = req.body.semail;
    let name = req.body.sname;
    let password = req.body.spassword;
    
    createUserWithEmailAndPassword(auth,email,password)
    .then((cred)=>{

    updateProfile(auth.currentUser, {
        displayName: name,
      }).then(() => {
        res.render('User.ejs',{
            user : auth.currentUser,
        });

      }).catch((error) => {
        console.log(error);
        res.redirect('/');
      });

    }).catch((err)=>{
        res.render('LoginPage',{
            code: 'signup',
            error : err.message
        })
    })
})

app.post('/login',(req,res)=>{ 
    let email = req.body.email;
    let password = req.body.password;
    
    signInWithEmailAndPassword(auth,email,password).then((cred)=>{
        // console.log(cred.user);
        res.redirect('/');
    }).catch((err)=>{
        res.render('LoginPage',{
            code: 'login',
            error : err.message
        })
    })
})

app.get('/logout',(req,res)=>{
    signOut(auth).then(()=>{
        res.redirect('/loginpage');
    }).catch((err)=>{
        console.log(err);
        res.end();
    })
})

/*********************************************************************************************************************/


app.post('/updateuser',(req,res)=>{
    let name = req.body.name;
    let photoUrl = req.body.photoUrl;

    if(!name) name = auth.currentUser.displayName;
    if(!photoUrl) photoUrl = auth.currentUser.photoURL;
   
    updateProfile(auth.currentUser, {
        displayName: name, photoURL: photoUrl
      }).then(() => {
        console.log('updated!')
        res.render('User.ejs',{
            user : auth.currentUser,
        })
      }).catch((error) => {
        console.log(error);
      });
})

const savetostore = (file,path)=>{
    const storageRef = ref(storage, path);
            uploadString(storageRef, file).then((snapshot) => {
                
              }).catch((err)=>{
                console.log(err);
              });
}

// save text to user storgare -> 2 inputs -> files , functionid
const savetxt = (files,functionid)=>{
        
    let user = auth.currentUser;

    if(functionid === 'imgtotxt'){
            let {title , text} = files;
        
            const storageRef = ref(storage, `users/${user.uid}/${functionid}/${title}.txt`);
            uploadString(storageRef, text).then((snapshot) => {
                
              }).catch((err)=>{
                console.log(err);
              });
        } 
    if(functionid === 'translation'){
        let orignaltext = files.orignaltext;
        // let translatedtext = files.translatedtext;
        let title = files.title;
        
        const storageRef1 = ref(storage, `users/${user.uid}/${functionid}/${title}.txt`);
            uploadString(storageRef1, orignaltext).then((snapshot) => {
                
              }).catch((err)=>{
                console.log(err);
              });
    }       

    if(functionid === 'summary'){
         let title = files.title;
         let summary = files.summary;
       
         const storageRef = ref(storage, `users/${user.uid}/${functionid}/${title}.txt`);
            uploadString(storageRef, summary).then((snapshot) => {
                
              }).catch((err)=>{
                console.log(err);
              });

        // savetostore(text,`users/${user.uid}/${functionid}/${title}.txt`,metadata)
    }
    
    if(functionid === 'QnA'){
        let que = files.que;
        let ans = files.ans;

        let file = que.concat('\n\n','Answers : \n\n',ans);
        // savetostore(files.que,`users/${user.uid}/${functionid}/${files.que}/que.txt`);
        savetostore(file,`users/${user.uid}/${functionid}/${files.que}.txt`);
    }
}

/***************************IMAGE TO TEXT FUNCTIONALITY***************************/

app.get('/imgtotxt',(req,res)=>{
    res.render('imgtotxt.ejs',{
        gottext : null
    });
});

app.post('/imgtotxt',(request,response)=>{

    let imgurl = request.body.imgurl;
    
    const options= {
        "method": "GET",
        "hostname": "ocr-extract-text.p.rapidapi.com",
        "port": null,
        "path": `/ocr?url=${imgurl}`,
        "headers": {
            "X-RapidAPI-Key": "0c7dda6d6bmsh8b06d89db786c1ap104501jsna3cf57ff702b",
            "X-RapidAPI-Host": "ocr-extract-text.p.rapidapi.com",
            "useQueryString": true
        }
    };
    
    const req = http.request(options, function (res) {
        const chunks = [];
        
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        
        res.on("end", async function () {
            const body = await Buffer.concat(chunks);
            // console.log(JSON.parse(body));
            let text = await JSON.parse(body).text;
            response.render('imgtotxt.ejs',{
                gottext : text,
            });
        });
    });
    
    req.end();
    
});

app.post('/saveimgtotxt',(req,res)=>{
    let user = auth.currentUser;
        if(user){
    const texttitle = req.body.texttitle;
    const text = req.body.text;
    
    const file = {
        title : texttitle,
        text : text
    }

    
    savetxt(file,'imgtotxt');
    // users/${user.uid}/${functionid}/${title}.txt
    // savetxtconfig()

    res.render('imgtotxt.ejs',{
        gottext : text
    });
    
}
else{
    res.redirect('/loginpage');
}
});

app.post('/downloadimgtotxt',(req,res)=>{
    let title = req.body.downloadtitle;
    let text = req.body.downloadtext;
       res.end();
});


/***************************IMAGE TO TEXT FUNCTIONALITY***************************/


/***************************TRANSLATION FUNCTIONALITY*****************************/

app.get('/translate',(req,res)=>{
    res.render('TranslatePage.ejs',{
        translatedtext :null,
        orignaltext:null
    });
});

app.post('/translate',(request,response)=>{
    let text = request.body.text;
    let lang = request.body.lang;


    const options = {
        "method": "POST",
        "hostname": "microsoft-translator-text.p.rapidapi.com",
        "port": null,
        "path": `/translate?to%5B0%5D=${lang}&api-version=3.0&profanityAction=NoAction&textType=plain`,
        "headers": {
            "content-type": "application/json",
            "X-RapidAPI-Key": "0c7dda6d6bmsh8b06d89db786c1ap104501jsna3cf57ff702b",
            "X-RapidAPI-Host": "microsoft-translator-text.p.rapidapi.com",
            "useQueryString": true
        }
    };
    
    const req = http.request(options, function (res) {
        const chunks = [];
    
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
    
            res.on("end", function () {
            const body = Buffer.concat(chunks);
            const translatedtext = JSON.parse(body)[0].translations[0].text;
             
            response.render('TranslatePage.ejs',{
                translatedtext :translatedtext,
                orignaltext : text
            });

            response.end();
        });
    });  
    
    req.write(JSON.stringify([{Text: text}]));
    req.end();
});

app.post('/savetranslation',(req,res)=>{
    let user = auth.currentUser;
    if(user){
        let orignaltext = req.body.orignaltext;
        let translatedtext = req.body.translatedtext;

        orignaltext = orignaltext + '\n\n\n' + translatedtext;
        let title = req.body.title;
        savetxt({
                orignaltext : orignaltext , 
                title : title
            }
                ,'translation');
    }
    else{
        res.redirect('/loginpage');
    }
   res.redirect('/translate');
});

/***************************TRANSLATION FUNCTIONALITY*****************************/


/****************************SUMMARY**********************************************/

app.get('/summary' , (req,res)=>{
    res.render('Summary.ejs', {
        text : null
    })
});

app.post('/summary',(request,response)=>{
    let para = request.body.para;

    const options = {
        "method": "POST",
        "hostname": "gpt-summarization.p.rapidapi.com",
        "port": null,
        "path": "/summarize",
        "headers": {
            "content-type": "application/json",
            "X-RapidAPI-Key": "79f25e9d42mshed666ecd3dda012p1ed78ejsnaa144f427d4e",
            "X-RapidAPI-Host": "gpt-summarization.p.rapidapi.com",
            "useQueryString": true
        }
    };
    
    const req = http.request(options, function (res) {
        const chunks = [];
    
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
    
        res.on("end", function () {
            const body = Buffer.concat(chunks);
            let summary = JSON.parse(body).summary;
            response.render('summary.ejs',{
                text : summary
            })
        });
    });
    
    req.write(JSON.stringify({
      text: para,
      num_sentences: 6
    }));
    req.end();

});

app.post('/savesummary',(req,res)=>{
    let title = req.body.title;
    let summary = req.body.summary;
    
    let file = {
        title : title , 
        summary : summary
    }

    let user = auth.currentUser;

    if(user){
        savetxt(file,'summary');
        res.render('summary.ejs',{
            text : null
        })
    }
    else{
        res.redirect('/loginpage')
    }
    
});

/****************************SUMMARY**********************************************/


/****************************QUESTIONS AND ANSWERS*********************************/

app.get('/QnA',(req,res)=>{
    res.render('QnA.ejs',{
        que : '',
        ans : null,
        saved : false
    });
});

app.post('/QnA',(request,response)=>{

   try {
    
   

    let que = request.body.que;
    
    const options = {
        "method": "GET",
        "hostname": "question-answer.p.rapidapi.com",
        "port": null,
        "path": `/question-answer?question=${encodeURIComponent(que)}`,
        "headers": {
            "X-RapidAPI-Key": "785c7cec95mshb0e94aab5f692c6p113ea9jsna35a7d1beee5",
            "X-RapidAPI-Host": "question-answer.p.rapidapi.com",
            "useQueryString": true
        }
    };
  

    const req = http.request(options, function (res) {
        const chunks = [];
    
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
    
        res.on("end", async function () {
            const body = Buffer.concat(chunks);
            console.log(body);
            let ans = await JSON.parse(body);
            
            if(ans != null){
    
            response.render('QnA.ejs',{
                ans : ans,
                que : que ,
                saved : false
            });}else{
                response.render('QnA.ejs',{
                    ans : null ,
                    que : que ,
                    saved : false
                    
                })
            }
        });
    });
    req.end();

} catch (error) {
    res.end(error.message);
}
});

app.post('/saveans',(req,res)=>{
    let que = req.body.getque;
    let ans = req.body.ans;
    let user = auth.currentUser;

    // console.log(que,ans);

    if(user){
        
         savetxt({que : que ,ans : ans},'QnA');
         res.render('QnA.ejs',{
            que : que,
            ans : null,
            saved : true
         })
    }
    else{
        res.redirect('/loginpage');
    }
});

/****************************QUESTIONS AND ANSWERS*********************************/


/****************************TEXT TO SPEECH FUNCTIONALITY**************************/

app.get('/txtTospeech',(req,res)=>{
    res.render('TxtToSpeech.ejs',{
        link : null,
    });
});

app.post('/txtTospeech',(request,response)=>{

    let textfile = request.body.text;
    let voicecode = request.body.voice;


const qs = require("querystring");
const http = require("https");

const options = {
	"method": "POST",
	"hostname": "cloudlabs-text-to-speech.p.rapidapi.com",
	"port": null,
	"path": "/synthesize",
	"headers": {
		"content-type": "application/x-www-form-urlencoded",
		"X-RapidAPI-Key": "5922605310msh98c3321e6c15dd4p1af3f5jsn309d0d0cdf97",
		"X-RapidAPI-Host": "cloudlabs-text-to-speech.p.rapidapi.com",
		"useQueryString": true
	}
};

const req = http.request(options, function (res) {
	const chunks = [];

	res.on("data", function (chunk) {
		chunks.push(chunk);
	});

	res.on("end", function () {
        try {
            const body = Buffer.concat(chunks);
        let obj = JSON.parse(body);
        if(obj.status){
        response.render('TxtToSpeech',{
            link : JSON.parse(body).result.audio_url,
        })}
		else{
            response.redirect('/error');
        }
        } catch (error) {
            redirect('/error')
        }
		
	});
});

req.write(qs.stringify({
  voice_code: voicecode,
  text: request.body.text,
  speed: '1.00',
  pitch: '1.00',
  output_type: 'audio_url'
}));
req.end();
});

/****************************TEXT TO SPEECH FUNCTIONALITY**************************/

// onAuthStateChanged(auth,(user)=>{             // very useful 
//     console.log('User Status' , user);        // tells current state of user
// })




















app.listen('8080',()=>{
    console.log('http://localhost:8080/');
});