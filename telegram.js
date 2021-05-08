const axios = require("axios");

const sendTelegram = async (message) => {
 try {
  await axios.post(
    `https://api.telegram.org/bottoken/sendMessage`,
      {
        "text": message,
        "chat_id": "********"
      }
  );
 } catch (error) {
 console.log("🚀 ~ file: telegram.js ~ line 15 ~ sendTelegram ~ error", error)
   
 }
};

module.exports =  { sendTelegram };
