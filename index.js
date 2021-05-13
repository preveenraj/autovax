const dotenv = require('dotenv');

const { pingCowin } = require("./cowin");
const { getNextDate } = require("./dateutils");
const { sendTelegram } = require('./telegram');
const { openBrowser } = require('./browser');

dotenv.config();
let includeTelegram = !!+process.env.includeTelegram;
const shouldOpenBrowser = !!+process.env.shouldOpenBrowser;

let opened = false;
let everyAppointmentsAvailable = 0;

const districtId = +process.env.districtId;
console.log("🚀 ~ file: index.js ~ line 16 ~ districtId", districtId)

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
  let totalAppointmentsAvailable = data?.appointmentsAvailableCount;
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
    if (dataOfSlot.length) {
      totalDataSlots = `${totalDataSlots}\n${dataOfSlot}`;
    }
    totalAppointmentsAvailable += appointmentsAvailableCount;
    if (nearestAppoinmentDate) {
      appoinmentDates.push(nearestAppoinmentDate);
    }
    nextDate = getNextDate(nextDate);
  }
  console.log("totalAppointmentsAvailable ", totalAppointmentsAvailable);
  console.log("appoinmentDates ", appoinmentDates);
 if (!opened) {
   opened = true;
  if (totalAppointmentsAvailable) {
    if (includeTelegram) sendTelegram(`
    <b><u>Vaccine Alert</u></b>
    \n There are <b>${totalAppointmentsAvailable}</b> appointments.
    \n ${totalDataSlots} 
    \n\n
     <b>Register your vaccine now</b> => https://selfregistration.cowin.gov.in/`);

    if (shouldOpenBrowser) openBrowser();
  } else {
    if (includeTelegram) sendTelegram(`There are <b>NO</b> slots available!`);
  }
 }
  return totalAppointmentsAvailable;
};
const intervalInMs = 60000;
let pingCount = 0;
checkForVaccines();

setInterval(async () => {
  console.clear();
  pingCount+= 1;
  const currentAppointments = await checkForVaccines();
  if (currentAppointments !== everyAppointmentsAvailable) {
    opened =false;
  }
  everyAppointmentsAvailable = currentAppointments;
  console.log("Ping Count - ", pingCount);
}, intervalInMs);