const { pingCowin } = require("./cowin");
const { getNextDate } = require("./dateutils");
const { sendTelegram } = require('./telegram');
const { openBrowser } = require('./browser');
let opened = false;
let includeTelegram = false;

const districtId = 304;
const age = 55;

const checkForVaccines = async () => {
  const today = new Date();
  const data = await pingCowin({
    districtId,
    age,
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
      districtId,
      age,
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
    if (includeTelegram) sendTelegram(`There are ${totalAppoinmentsAvailable} for Kottayam now.`);
    openBrowser();
  } else {
    if (includeTelegram) sendTelegram(`Oops, there are no slots for Kottayam.`);
  }
};
const intervalInMs = 5000;
let pingCount = 0;
checkForVaccines();

setInterval(() => {
  console.clear();
  pingCount+= 1;
  checkForVaccines();
  console.log("Ping Count - ", pingCount);
}, intervalInMs);