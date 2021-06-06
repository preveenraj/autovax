const dotenv = require('dotenv');

const { pingCowin } = require("./cowin");
const { getNextDate } = require("./dateutils");
const { sendTelegram } = require('./telegram');
const { openBrowser } = require('./browser');

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

dotenv.config();
let includeTelegram = !!+process.env.includeTelegram;
const shouldOpenBrowser = !!+process.env.shouldOpenBrowser;

let opened = false;
let everyAppointmentsAvailable = 0;

let districtId = +process.env.districtId;
const pincode = +process.env.pincode;
console.log("🚀 ~ file: index.js ~ line 21 ~ pincode", pincode)
const complexId = process.env.complexId;
console.log("🚀 ~ file: index.js ~ line 16 ~ complexId", complexId)

let age = 70;
let dose;
if(complexId) {
  [districtId, age, dose] = complexId.split("_");
}
console.log("🚀 ~ file: index.js ~ line 16 ~ districtId", districtId)
console.log("🚀 ~ file: index.js ~ line 16 ~ age", age)
console.log("🚀 ~ file: index.js ~ line 16 ~ dose", dose)

const checkForVaccines = async () => {
  try {
    const today = new Date();
    const data = await pingCowin({
      districtId,
      pincode,
      age,
      dose,
      date: today,
    });
    let dateCount = 2;
    let nextDate = getNextDate(today);
    let totalAppointmentsAvailable = data?.appointmentsAvailableCount;
    let totalDataSlots = data?.dataOfSlot;
    let appoinmentDates = [data?.nearestAppoinmentDate];
    let totalSlotsfor18plus = data?.slotsfor18plus;
    let totalSlotsfor40plus = data?.slotsfor40plus;
    while (dateCount++ <= 7) {
    await sleep(1000);
      const {
        appointmentsAvailableCount,
        nearestAppoinmentDate,
        dataOfSlot,
        slotsfor18plus,
        slotsfor40plus
      } = await pingCowin({
        districtId,
        pincode,
        age,
        dose,
        date: nextDate,
      });
      if (dataOfSlot.length) {
        totalDataSlots = `${totalDataSlots}\n${dataOfSlot}`;
      }
      totalAppointmentsAvailable += appointmentsAvailableCount;
      totalSlotsfor18plus += slotsfor18plus;
      totalSlotsfor40plus += slotsfor40plus;
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
      const verbLabel = totalAppointmentsAvailable > 1 ? "are" : "is only";
      if (includeTelegram) sendTelegram(`
      <b><u>Vaccine Alert</u></b>\n\nThere ${verbLabel} <b>${totalAppointmentsAvailable}</b> slot${totalAppointmentsAvailable > 1 ? "s" : ""} available.
      
      18+ Slots: <b>${totalSlotsfor18plus}</b>
      40+ Slots: <b>${totalSlotsfor40plus}</b>
      ${totalDataSlots}\n
       <b>Register your vaccine now </b> =>  https://selfregistration.cowin.gov.in/
       /n`);
  
      if (shouldOpenBrowser) openBrowser();
    } else {
      if (includeTelegram) 
      sendTelegram(`
      There are <b>NO</b> slots available!
      /n`);
    }
   }
    return totalAppointmentsAvailable;
    
  } catch (error) {
    return 0;
  }
};
const intervalInMs = 60000 * 10;
let pingCount = 0;
checkForVaccines();

setInterval(async () => {
  console.clear();
  pingCount+= 1;
  const currentAppointments = await checkForVaccines();
  if (currentAppointments === 0) {
    opened = true;
  } else if (currentAppointments !== everyAppointmentsAvailable) {
    opened =false;
  }
  everyAppointmentsAvailable = currentAppointments;
  console.log("Ping Count - ", pingCount);
}, intervalInMs);