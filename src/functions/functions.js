
const firebaseConfig = {
    apiKey: "AIzaSyBR2x1LfeDAgPo2ezzOtCk9xOUcQXFsO3k",
    authDomain: "text-tools-397da.firebaseapp.com",
    projectId:  "text-tools-397da" ,
    storageBucket:  "text-tools-397da.appspot.com" ,
    messagingSenderId: "1039784491156" ,
    appId:  "1:1039784491156:web:6154e8fb9d66844ed5dc81" ,
  };

import { initializeApp } from "firebase/app";
import jwt from 'jsonwebtoken';

import env from "dotenv";
env.config();

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
         return error;
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
          const genEmail = jwt.verify(token,"Text-Tools_secret_key_CreatedBy_Kartik_Hatwar_for_registered_users");
          
          if(!genEmail){
            res.redirect('/loginpage');
          }
          else{
        const useremail = genEmail.email;
   
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
      return error;
    }
  };