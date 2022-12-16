import express  from "express";
export const imgtotxt = express.Router();
import http from 'https';
import { savetxt } from "../functions/functions.js";
import env from "dotenv";
env.config();

imgtotxt
.get('/',(req, res) => {
    res.render("imgtotxt.ejs", {
      gottext: null,
    });
})
.post('/',(request, response) => {
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
})
.post('/save',(req, res) => {
    try {
    //  if(req.params['id'] == 'save'){
        // console.log(req.params['id']);
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
    //  }
    //  else{
    //    res.redirect(req.url);
    //  }
     
    } catch (err) {
       res.redirect('/error');
    }
     
});

