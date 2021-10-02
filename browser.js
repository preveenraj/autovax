const http = require("http"),
  open = require("open");
  
let server;

const openBrowser = async () => {
 try {
  server = http.createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World\n");
  });
  server.listen(1337, "127.0.0.1", function () {
    console.log("Launching the browser!");
    open("https://selfregistration.cowin.gov.in/");
  });
 } catch (error) {
 console.log("Error: ",  error)
   
 }
};

module.exports =  { openBrowser };
