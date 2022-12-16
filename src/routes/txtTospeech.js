import express  from "express";
export const txtTospeech = express.Router();
import http from 'https';
import qs from 'querystring';
import env from "dotenv";
env.config();

txtTospeech
.get('/', (req, res) => {
    res.render("TxtToSpeech.ejs", {
      link: null,
    });
  })
.post('/',(request, response) => {
    let voicecode = request.body.voice;
  
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
          response.redirect("/error");
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