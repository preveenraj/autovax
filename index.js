const http = require("http"),
  open = require("open");
let server;
const { pingCowin } = require("./cowin");
const { getNextDate } = require("./dateutils");
let opened = false;

const checkForVaccines = async () => {
  const today = new Date();
  const data = await pingCowin({
    districtId: 304,
    ageValue: 55,
    date: getNextDate(today),
  });
  let dateCount = 2;
  let nextDate = getNextDate(today);
  let totalAppoinmentsAvailable = data.appointmentsAvailableCount;
  let appoinmentDates = [data.nearestAppoinmentDate];
  while (dateCount++ <= 7) {
    const {
      appointmentsAvailableCount,
      nearestAppoinmentDate,
    } = await pingCowin({
      districtId: 304,
      ageValue: 55,
      date: nextDate,
    });
    totalAppoinmentsAvailable += appointmentsAvailableCount;
    if (nearestAppoinmentDate) {
      appoinmentDates.push(nearestAppoinmentDate);
    }
    nextDate = getNextDate(nextDate);
  }
  console.log("totalAppoinmentsAvailable ", totalAppoinmentsAvailable);
  console.log("appoinmentDates ", appoinmentDates);
  if (totalAppoinmentsAvailable && !opened) {
    opened = true;
    server = http.createServer(function (req, res) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello World\n");
    });
    server.listen(1337, "127.0.0.1", function () {
      console.log("Launching the browser!");
      open("https://selfregistration.cowin.gov.in/");
    });
  }
};
const intervalInMs = 1000;
let pingCount = 0;
checkForVaccines();

var timer = setInterval(() => {
  console.clear();
  pingCount+= 1;
  checkForVaccines();
  console.log("Ping Count - ", pingCount);
}, intervalInMs);
