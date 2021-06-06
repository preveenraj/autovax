const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();
const token = process.env.token;
let chatId;
let districtId = +process.env.districtId;
const pincode = +process.env.pincode;
const complexId = process.env.complexId;

const sendMessage = async (message, chatId) => {
  const slicedIndex = message.slice(0,4500).lastIndexOf("\n");
  const slicedMessage = message.slice(0,slicedIndex);
  const restMessage = message.slice(slicedIndex);
  if(slicedIndex) {
    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
        {
          text: slicedMessage,
          chat_id: chatId,
          parse_mode: "HTML"
        }
    );
    sendMessage(restMessage, chatId);
  }
};

const sendTelegram = async (message) => {
 try {
  chatId = process.env?.[`chatId_${districtId || complexId || pincode}`] || process.env.chatId_test;
  await sendMessage(message, chatId);
 } catch (error) {
 console.log("🚀 ~ file: telegram.js ~ line 15 ~ sendTelegram ~ error", error)
   
 }
};

module.exports =  { sendTelegram };
