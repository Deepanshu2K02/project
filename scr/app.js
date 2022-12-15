import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();
import path from "path";
import { fileURLToPath } from "url";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const express = require("express");
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');
const http = require("https");
const bodyparser = require("body-parser");
const app = express();
const bcrypt = require("bcryptjs");

import { mongoose } from "./db/conn.js";
import { User } from "./models/userSignUp.js";
import {Uauth} from "./middleware/auth.js";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, updateProfile,signInWithPopup, GoogleAuthProvider, } from "firebase/auth";
import { getStorage, ref, uploadString, getDownloadURL, listAll, } from "firebase/storage";
import multer from "multer";

const firebaseConfig = {
  apiKey: "AIzaSyBR2x1LfeDAgPo2ezzOtCk9xOUcQXFsO3k",
  authDomain: "text-tools-397da.firebaseapp.com",
  projectId: "text-tools-397da",
  storageBucket: "text-tools-397da.appspot.com",
  messagingSenderId: "1039784491156",
  appId: "1:1039784491156:web:6154e8fb9d66844ed5dc81",
};

initializeApp(firebaseConfig);
const auth = getAuth();
const storage = getStorage();
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/views")));
app.use(cookieParser());
// app.use(auth);
app.set('views',path.join(__dirname,'/views'));
app.use(bodyparser.urlencoded());
app.use(bodyparser.json());
/**********************************FUNCTIONS*******************************************************/

const filedownload = async (file_path) => {
  try {
    const starsRef = ref(storage, file_path);

    return await getDownloadURL(starsRef)
      .then((url) => {
        return url;
      })
      .catch((error) => {
        return null;
      });
  } catch (error) {
    return null;
  }
};

const allurlformpath = async (path) => {
  try {
    let imgurls = [];
    const listRef = ref(storage, path);

    let response = await listAll(listRef);

    for (const i of response.items) {
      let name = i.name;
      let url = await filedownload(i.fullPath);
      imgurls.push({ name, url });
    }

    return imgurls;
  } catch (error) {
    return [];
  }
};

const savetostore = async (file, path) => {
  try {
    const storageRef =  ref(storage, path);
    await uploadString(storageRef, file);
  } catch (error) {
    return error;
  }
};

const savetxt = async (files, functionid,token) => {
  try {

      if(!token) res.redirect('/loginpage');
      else{
        const genEmail = jwt.verify(token,process.env.SECRET);
        const useremail = genEmail.email;

        if(!useremail){
          res.redirect('/loginpage');
        }
        else{
 
    if (functionid === "imgtotxt") {
      let { title, text } = files;
      const storageRef = ref(
        storage,
        `users/${useremail}/${functionid}/${title}.txt`
      );

     await uploadString(storageRef, text);
    }
    if (functionid === "translation") {
      let orignaltext = files.orignaltext;
      let title = files.title;
      const storageRef1 = ref(
        storage,
        `users/${useremail}/${functionid}/${title}.txt`
      );

      await uploadString(storageRef1, orignaltext);
    }

    if (functionid === "summary") {
      let title = files.title;
      let summary = files.summary;

      const storageRef = ref(
        storage,
        `users/${useremail}/${functionid}/${title}.txt`
      );
      await uploadString(storageRef, summary);
    }

    if (functionid === "QnA") {
      let que = files.que;
      let ans = files.ans;
      let file = que.concat("\n\n", "Answers : \n\n", ans);

      await savetostore(file, `users/${useremail}/${functionid}/${files.que}.txt`);
    }
  }
}
  } catch (error) {
    console.log(error);
  }
};

/*******************************FUNCTIONS*******************************************************/

/*****************************************MAIN PAGES*******************************************/
app.get('/',Uauth,(req,res)=>{
  try{
      res.render('index.ejs')
  }
  catch{
    res.redirect('/error');
  }
})

app.get("/loginpage",async (req, res) => {
  try{
      const token = req.cookies.token;
      if(!token){
        res.render("LoginPage", {
          code: "login",
          error: '',
        });
      }
      else{
        const result = await jwt.verify(token,process.env.SECRET);

        if(result){
          res.render('index.ejs')
        }
        else{
          res.render("LoginPage", {
            code: "login",
            error: '',
          });
        }
        }
      }
  catch{
    res.redirect('/error');
  }
});



app.get("/userpage",Uauth, async (req, res) => {
  try {
      
      let token = req.cookies.token;

      if(!token) res.redirect('/loginpage');
      else{
        const genEmail = jwt.verify(token,process.env.SECRET);

        if(!genEmail){
          res.redirect('/loginpage');
        }
        else{
        // genEmail = genEmail.email;
        const useremail = genEmail.email;
        
        const user = await User.findOne({email : useremail});

        if(user){
          const displayName = user.name || 'not found';
          const email = user.email;
          const contact = user.contact || 'not found';
        
    
          let imgtotxturls = allurlformpath(`users/${user.email}/imgtotxt`);
    
          let summaryurls = allurlformpath(`users/${user.email}/summary`);
    
          let QnAurls = allurlformpath(`users/${user.email}/QnA`);
    
          let translatedurls = allurlformpath(`users/${user.email}/translation`);
    
          let data = await Promise.all([imgtotxturls,summaryurls,QnAurls,translatedurls]);
    
          res.render("User.ejs", {
            displayName: displayName,
            email: email,
            contact : contact,
            imgtotxturls: data[0],
            summaryurls: data[1],
            QnAurls: data[2],
            translatedurls: data[3],
          });
        }
        else{
          res.send('user not found');
        }
      
        }
      }
      
    
  } catch (error) {
    res.redirect("/error");
  }
});

app.get("/error", (req, res) => {
  res.write(req.message);
  res.end();
});

/*****************************************MAIN PAGES*******************************************/

/***************************************   USER ACTIONS   ***********************************************************/


app.post("/signup", async (req, res) => {
  try {
  
    let Password = req.body.spassword;
    let Cpassword = req.body.spassword2;

    if(Password === Cpassword){
      const Register_User = new User({
        name : req.body.sname,
        email : req.body.semail,
        contact : req.body.scontact,
        password : req.body.spassword,
      });

      const token = await Register_User.generateAuthToken();

      const result = await Register_User.save();

      res.cookie('token',token,{
        httpOnly: true,
        maxAge : 24*60*60*1000, //  60 seconds
      });
      res.redirect('/');
    }
    else{
      res.render("LoginPage", {
        code: "signup",
        error: ' ********Passwords are Not Matching',
      });
    }
 

    // createUserWithEmailAndPassword(auth, email, password)
    //   .then((cred) => {
    //     updateProfile(auth.currentUser, {
    //       displayName: name,
    //       photoURL: path.join(__dirname, "/views/images/user.png"),
    //     })
    //       .then(() => {
    //         res.redirect("/");
    //       })
    //       .catch((error) => {
    //         res.redirect("/error");
    //       });
    //   })
    //   .catch((err) => {
    //     res.render("LoginPage", {
    //       code: "signup",
    //       error: err.message,
    //     });
    //   });
  } catch (err) {
    console.log(err);
    if(err.code){
      if(err.code == 11000){
        res.render("LoginPage", {
          code: "signup",
          error: '*********'+'Users one or more credentials already exists',
        });
      }
    }
    else{
      res.render("LoginPage", {
        code: "signup",
        error: '********'+err.message,
      });
    }

  }
});

app.post("/login",async (req, res) => {
 try{
  const email = req.body.email;
  const password = req.body.password;

   const usermail = await User.findOne({email : email});

   if(!usermail){
    res.render("LoginPage", {
      code: "login",
      error: '*********'+'Wrong Credentials',
    });
   }
   else{

    const isMatch = await bcrypt.compare(password,usermail.password);
   
    const token = await usermail.generateAuthToken();

    if(isMatch){ 
      res.cookie('token',token,{
        httpOnly: true,
        maxAge : 24*60*60*1000, //  24 hrs
        // secure: true
      });
      res.redirect(`/`)
    }  
    else{
     res.render("LoginPage", {
       code: "login",
       error: '*********'+'Wrong Credentials',
     });
    }
   }

 }catch(err){
  res.render("LoginPage", {
    code: "login",
    error: '*********'+ err.message,
  });
 }


  
  

  // signInWithEmailAndPassword(auth, email, password)
  //   .then((cred) => {
  //     // console.log(cred.user);
  //     res.redirect("/");
  //   })
  //   .catch((err) => {
  //     res.render("LoginPage", {
  //       code: "login",
  //       error: err.message,
  //     });
  //   });
});

app.get("/logout", (req, res) => {
     try {
       res.clearCookie('token');
       res.redirect("/loginpage");
     } catch (error) {
        res.redirect("/error");
      
     }
});

/***************************************   USER ACTIONS   ***********************************************************/

/***************************IMAGE TO TEXT FUNCTIONALITY***************************/

app.get("/imgtotxt",Uauth,(req, res) => {
  res.render("imgtotxt.ejs", {
    gottext: null,
  });
});

app.post("/imgtotxt",Uauth, (request, response) => {
  let imgurl = request.body.imgurl;

  const options = {
    method: "GET",
    hostname: "ocr-extract-text.p.rapidapi.com",
    port: null,
    path: `/ocr?url=${imgurl}`,
    headers: {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": "ocr-extract-text.p.rapidapi.com",
      useQueryString: true,
    },
  };

  const req = http.request(options, function (res) {
    const chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", async function () {
      const body = await Buffer.concat(chunks);
      let text = await JSON.parse(body).text;
      response.render("imgtotxt.ejs", {
        gottext: text,
      });
    });
  });

  req.end();
});

app.post("/saveimgtotxt",Uauth,(req, res) => {
   try {
    const texttitle = req.body.texttitle;
    const text = req.body.text;

    const file = {
      title: texttitle,
      text: text,
    };

    savetxt(file, "imgtotxt",req.cookies.token);

    res.render("imgtotxt.ejs", {
      gottext: text,
    });
   } catch (err) {
      res.redirect('/error');
   }
    
    
  
});

/***************************IMAGE TO TEXT FUNCTIONALITY***************************/

/***************************TRANSLATION FUNCTIONALITY*****************************/

app.get("/translate",Uauth, (req, res) => {
  try {
    res.render("TranslatePage.ejs", {
      translatedtext: null,
      orignaltext: null,
    });
  } catch (error) {
    res.redirect("/error");
  }
});

app.post("/translate", Uauth,(request, response) => {
  try {
    let text = request.body.text;
    let lang = request.body.lang;

    const options = {
      method: "POST",
      hostname: "microsoft-translator-text.p.rapidapi.com",
      port: null,
      path: `/translate?to%5B0%5D=${lang}&api-version=3.0&profanityAction=NoAction&textType=plain`,
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key":  process.env.API_KEY,
        "X-RapidAPI-Host": "microsoft-translator-text.p.rapidapi.com",
        useQueryString: true,
      },
    };

    const req = http.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", ()=>{
        const body = Buffer.concat(chunks);
        const translatedtext = JSON.parse(body)[0].translations[0].text;

        response.render("TranslatePage.ejs", {
          translatedtext: translatedtext,
          orignaltext: text,
        });

        response.end();
      });
    });

    req.write(JSON.stringify([{ Text: text }]));
    req.end();
  } catch (error) {
    response.redirect("/error");
  }
});

app.post("/savetranslation",Uauth, (req, res) => {
  try {
   
      let orignaltext = req.body.orignaltext;
      let translatedtext = req.body.translatedtext;
      let title = req.body.title;

      orignaltext = orignaltext + "\n\n\n" + translatedtext;

      savetxt(
        {
          orignaltext: orignaltext,
          title: title,
        },
        "translation",req.cookies.token
      );

    res.redirect("/translate");
  } catch (error) {
    res.redirect("/error");
  }
});

/***************************TRANSLATION FUNCTIONALITY*****************************/

/****************************SUMMARY**********************************************/

app.get("/summary",Uauth, (req, res) => {
  res.render("Summary.ejs", {
    text: null,
  });
});

app.post("/summary",Uauth, (request, response) => {
  let para = request.body.para;

  const options = {
    method: "POST",
    hostname: "gpt-summarization.p.rapidapi.com",
    port: null,
    path: "/summarize",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key":  process.env.API_KEY,
      "X-RapidAPI-Host": "gpt-summarization.p.rapidapi.com",
      useQueryString: true,
    },
  };

  const req = http.request(options, function (res) {
    const chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      const body = Buffer.concat(chunks);
      let summary = JSON.parse(body).summary;
      response.render("summary.ejs", {
        text: summary,
      });
    });
  });

  req.write(
    JSON.stringify({
      text: para,
      num_sentences: 4,
    })
  );
  req.end();
});

app.post("/savesummary",Uauth, (req, res) => {
  let title = req.body.title;
  let summary = req.body.summary;

  let file = {
    title: title,
    summary: summary,
  };

  let user = auth.currentUser;

  if (user) {
    savetxt(file, "summary",req.cookies.token);
    res.render("summary.ejs", {
      text: null,
    });
  } else {
    res.redirect("/loginpage");
  }
});

/****************************SUMMARY**********************************************/

/****************************QUESTIONS AND ANSWERS*********************************/

app.get("/QnA", Uauth,(req, res) => {
  res.render("QnA.ejs", {
    que: "",
    ans: null,
    saved: false,
  });
});

app.post("/QnA",Uauth, (request, response) => {
  try {
    let que = request.body.que;

    const options = {
      method: "GET",
      hostname: "question-answer.p.rapidapi.com",
      port: null,
      path: `/question-answer?question=${encodeURIComponent(que)}`,
      headers: {
        "X-RapidAPI-Key":  process.env.API_KEY,
        "X-RapidAPI-Host": "question-answer.p.rapidapi.com",
        useQueryString: true,
      },
    };

    const req = http.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", async function () {
        const body = Buffer.concat(chunks);
        let ans = await JSON.parse(body);

        if (ans != null) {
          response.render("QnA.ejs", {
            ans: ans,
            que: que,
            saved: false,
          });
        } else {
          response.render("QnA.ejs", {
            ans: null,
            que: que,
            saved: false,
          });
        }
      });
    });
    req.end();
  } catch (error) {
    res.end(error.message);
  }
});

app.post("/saveans",Uauth, (req, res) => {
  let que = req.body.getque;
  let ans = req.body.ans;
  let user = auth.currentUser;

  // console.log(que,ans);

  if (user) {
    savetxt({ que: que, ans: ans }, "QnA",req.cookies.token);
    res.render("QnA.ejs", {
      que: que,
      ans: null,
      saved: true,
    });
  } else {
    res.redirect("/");
  }
});
/****************************QUESTIONS AND ANSWERS*********************************/

/****************************TEXT TO SPEECH FUNCTIONALITY**************************/

app.get("/txtTospeech",Uauth, (req, res) => {
  res.render("TxtToSpeech.ejs", {
    link: null,
  });
});

app.post("/txtTospeech",Uauth, (request, response) => {
  let voicecode = request.body.voice;

  const qs = require("querystring");
  const http = require("https");

  const options = {
    method: "POST",
    hostname: "cloudlabs-text-to-speech.p.rapidapi.com",
    port: null,
    path: "/synthesize",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "X-RapidAPI-Key":  process.env.API_KEY,
      "X-RapidAPI-Host": "cloudlabs-text-to-speech.p.rapidapi.com",
      useQueryString: true,
    },
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
        if (obj.status) {
          response.render("TxtToSpeech", {
            link: JSON.parse(body).result.audio_url,
          });
        } else {
          response.redirect("/error");
        }
      } catch (error) {
        redirect("/error");
      }
    });
  });

  req.write(
    qs.stringify({
      voice_code: voicecode,
      text: request.body.text,
      speed: "1.00",
      pitch: "1.00",
      output_type: "audio_url",
    })
  );
  req.end();
});

/****************************TEXT TO SPEECH FUNCTIONALITY**************************/
let port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
