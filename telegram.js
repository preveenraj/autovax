const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();
const token = process.env.token;
let chatId;
const districtId = +process.env.districtId;

const sendTelegram = async (message) => {
 try {
  chatId = process.env?.[`chatId_${districtId}`] || process.env.chatId_test;
  await axios.post(
    `https://api.telegram.org/bot${token}/sendMessage`,
      {
        text: message,
        chat_id: chatId,
        parse_mode: "HTML"
      }
  );
 } catch (error) {
 console.log("🚀 ~ file: telegram.js ~ line 15 ~ sendTelegram ~ error", error)
   
 }
};

module.exports =  { sendTelegram };
