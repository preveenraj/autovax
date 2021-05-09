const axios = require("axios");

const sendTelegram = async (message) => {
 try {
  await axios.post(
    `https://api.telegram.org/bot1824586313:AAEyLhsaMf3vD-Sns6Jrab-gTj-AgR-fuE4/sendMessage`,
      {
        "text": message,
        "chat_id": "-1001490910260"
      }
  );
 } catch (error) {
 console.log("🚀 ~ file: telegram.js ~ line 15 ~ sendTelegram ~ error", error)
   
 }
};

module.exports =  { sendTelegram };
