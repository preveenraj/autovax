# autovax
An node server that would automatically open the cowin webpage when any vaccination centers are available.


## How to run?

- create a .env file in the environment which you want to run the process.
- Add the below keys into it.
```
token=18245****fuE4
chatId=25******99
includeTelegram=1 //if this parameter is 0, then no need to give token and chatId
shouldOpenBrowser=0
```

- please edit your districtId and age in the `index.js` file.

```
301: Alappuzha
307: Ernakulam
306: Idukki
297: Kannur
295: Kasaragod
298: Kollam
304: Kottayam
305: Kozhikode
302: Malappuram
308: Palakkad
300: Pathanamthitta
296: Thiruvananthapuram
303: Thrissur
299: Wayanad
```

- start by `npm start`
