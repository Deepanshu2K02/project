
const firebaseConfig = {
    apiKey: process.env.FIREKEY,
    authDomain: process.env.AUTHDOMAIN,
    projectId:  process.env.PROJECTID ,
    storageBucket:  process.env.STORAGEBUCKET ,
    messagingSenderId:  process.env.MESSAGINGSENDERID ,
    appId:  process.env.APPID ,
  };

import { initializeApp } from "firebase/app";
import jwt from 'jsonwebtoken';
import { getStorage, ref, uploadString, getDownloadURL, listAll, } from "firebase/storage";
initializeApp(firebaseConfig);
const storage = getStorage();


export const filedownload = async (file_path) => {
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

  export const allurlformpath = async (path) => {
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

  export const savetostore = async (file, path) => {
    try {
      const storageRef =  ref(storage, path);
      await uploadString(storageRef, file);
    } catch (error) {
      return error;
    }
  };

  
export const savetxt = async (files, functionid,token) => {
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