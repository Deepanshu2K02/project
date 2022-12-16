import express  from "express";
export const summary = express.Router();
import http from 'https';
import { savetxt } from "../functions/functions.js";
import env from "dotenv";
env.config();

summary
.get('/', (req, res) => {
    res.render("Summary.ejs", {
      text: null,
    });
  })
.post('/',(request, response) => {
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
  })
.post('/save',(req, res) => {
    let title = req.body.title;
    let summary = req.body.summary;
  
    let file = {
      title: title,
      summary: summary,
    };
  
      savetxt(file, "summary",req.cookies.token);
      res.render("summary.ejs", {
        text: null,
      });
    
  })