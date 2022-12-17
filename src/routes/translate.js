import express  from "express";
export const translate = express.Router();
import http from 'https';
import { savetxt } from "../functions/functions.js";
import env from "dotenv";
env.config();

translate
.get('/', (req, res) => {
    try {
      res.render("TranslatePage.ejs", {
        translatedtext: null,
        orignaltext: null,
      });
    } catch (error) {
      res.redirect("/error");
    }
})
.post('/',(request, response) => {
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
          "X-RapidAPI-Key":"a9b82fb48emsh5805ff4c98752c2p138328jsn79eeb2b18429",
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
})
.post('/save', (req, res) => {
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
          "translation",req.signedCookies.token
        );
  
      res.redirect("/translate");
    } catch (error) {
      res.redirect("/error");
    }
})