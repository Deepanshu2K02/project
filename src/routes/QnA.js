import express  from "express";
export const QnA = express.Router();
import http from 'https';
import { savetxt } from "../functions/functions.js";
import env from "dotenv";
env.config();

QnA
.get('/', (req, res) => {
    res.render("QnA.ejs", {
      que: "",
      ans: null,
      saved: false,
    });
  })
.post('/',(request, response) => {
    try {
      let que = request.body.que;
  
      const options = {
        method: "GET",
        hostname: "question-answer.p.rapidapi.com",
        port: null,
        path: `/question-answer?question=${encodeURIComponent(que)}`,
        headers: {
          "X-RapidAPI-Key": "a9b82fb48emsh5805ff4c98752c2p138328jsn79eeb2b18429",
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
  })
.post('/save', (req, res) => {
    let que = req.body.getque;
    let ans = req.body.ans;
   
      savetxt({ que: que, ans: ans }, "QnA",req.cookies.token);
      res.render("QnA.ejs", {
        que: que,
        ans: null,
        saved: true,
      });
    
  })