import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();
import path from "path";
import session from "express-session";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const express = require("express");
const cookieParser = require('cookie-parser')
const bodyparser = require("body-parser");
const app = express();

import mongoose from "mongoose";

mongoose.set('strictQuery', false);
//Set up default mongoose connection

const DB = "mongodb+srv://kartikhatwar98:9371865060k@cluster0.w3714lm.mongodb.net/Text-Tools?retryWrites=true&w=majority";

mongoose.connect(DB, { useNewUrlParser: true }).then(()=>{
    // console.log('Connected');
})



// import { mongoose } from "./db/db.js";
import { Uauth } from "./middleware/auth.js";
import { logout_router } from "./routes/logout.js";
import { imgtotxt } from "./routes/imgtotxt.js";
import { translate } from "./routes/translate.js";
import { summary } from "./routes/summary.js";
import { QnA } from "./routes/QnA.js";
import { txtTospeech } from "./routes/txtTospeech.js";
import { loginpage } from './routes/loginpage.js';
import { userpage } from "./routes/userpage.js";
import {signup_router} from './routes/signup.js';
import {login_router} from "./routes/login.js";


app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/views")));
app.use(cookieParser());
app.set('views',path.join(__dirname,'/views'));
app.use(bodyparser.urlencoded({extended : true}));
app.use(bodyparser.json());
app.use(session({
  secret: process.env.SESSSECRETE,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge : 24*60*60*1000 , secure : true , signed : true}
}))
app.get('/',(req,res)=>{
  try{
      res.render('index.ejs')
  }
  catch{
    res.redirect('/error');
  }
})
app.get("/error", (req, res) => {
  res.write(req.message);
  res.end();
}); 

app.use("/loginpage",loginpage);
app.use("/userpage",Uauth,userpage);
app.use("/signup", signup_router);
app.use('/login',login_router);
app.use("/logout", logout_router);
app.use('/imgtotxt',Uauth,imgtotxt);
app.use("/translate",Uauth,translate);
app.use("/summary",Uauth,summary);
app.use("/QnA", Uauth, QnA);
app.use("/txtTospeech",Uauth, txtTospeech);

let port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
