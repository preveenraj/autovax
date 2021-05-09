const { pingCowin } = require("./cowin");
const { getNextDate } = require("./dateutils");
const { sendTelegram } = require('./telegram');
const { openBrowser } = require('./browser');
let opened = false;
let includeTelegram = true;
let everyAppoinmentsAvailable = 0;

const districtId = 304;
const age = 55;

const checkForVaccines = async () => {
  const today = new Date();
  const data = await pingCowin({
    districtId,
    age,
    date: today,
  });
  let dateCount = 2;
  let nextDate = getNextDate(today);
  let totalAppoinmentsAvailable = data?.appointmentsAvailableCount;
  let totalDataSlots = data?.dataOfSlot;
  let appoinmentDates = [data?.nearestAppoinmentDate];
  while (dateCount++ <= 7) {
    const {
      appointmentsAvailableCount,
      nearestAppoinmentDate,
      dataOfSlot
    } = await pingCowin({
      districtId,
      age,
      date: nextDate,
    });
    totalDataSlots = `${totalDataSlots}\n${dataOfSlot}`;
    totalAppoinmentsAvailable += appointmentsAvailableCount;
    if (nearestAppoinmentDate) {
      appoinmentDates.push(nearestAppoinmentDate);
    }
    nextDate = getNextDate(nextDate);
  }
  console.log("totalAppoinmentsAvailable ", totalAppoinmentsAvailable);
  console.log("appoinmentDates ", appoinmentDates);
 if (!opened) {
   opened = true;
  if (totalAppoinmentsAvailable) {
    if (includeTelegram) sendTelegram(`There are ${totalAppoinmentsAvailable} appoinments for Kottayam now.\n ${totalDataSlots} \n\n Register your vaccine now => https://selfregistration.cowin.gov.in/`);
    // openBrowser();
  } else {
    if (includeTelegram) sendTelegram(`Oops, there are no slots for Kottayam now.`);
  }
 }
  return totalAppoinmentsAvailable;
};
const intervalInMs = 60000;
let pingCount = 0;
checkForVaccines();

setInterval(async () => {
  console.clear();
  pingCount+= 1;
  const currentAppoinments = await checkForVaccines();
  if (currentAppoinments !== everyAppoinmentsAvailable) {
    opened =false;
  }
  everyAppoinmentsAvailable = currentAppoinments;
  console.log("Ping Count - ", pingCount);
}, intervalInMs);