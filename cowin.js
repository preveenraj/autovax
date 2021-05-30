const axios = require("axios");
const { transformDate } = require("./dateutils");
const { format, parse } = require("fecha");

const pingCowin = async ({ districtId, age, date }) => {
  try {
    const transformedDate = transformDate(date);
    const { data } = await axios.get(
      `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${transformedDate}`,
      {
        headers: {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36"}
      }
    );
    // const data = require("./centers.json");
    const { centers } = data;
    let isSlotAvailable = false;
    let dataOfSlot = "";
    let updatedCenters = [];
    let appointmentsAvailableCount = 0;
    let nearestAppoinmentDate = null;
    let slotsfor18plus = 0;
    let slotsfor45plus = 0;
    
// sample structure of a center
// {
//   session_id: 'bedaed15-730a-41b0-a1dc-3ebd31fbdb0a',
//   date: '06-06-2021',
//   available_capacity: 0,
//   min_age_limit: 18,
//   vaccine: 'COVISHIELD',
//   slots: [Array],
//   available_capacity_dose1: 0,
//   available_capacity_dose2: 0
// }
    if (centers.length) {
      updatedCenters = centers.filter((center) => {
        console.log("🚀 ~ file: cowin.js ~ line 41 ~ updatedCenters=centers.filter ~ center", center)
        isSlotAvailable = false;
        center.sessions.forEach((session) => {
          const sessionDateFormatted = format(parse(session.date, "DD-MM-YYYY"), "MMM D");
          if (
            session.available_capacity > 0
          ) {
            isSlotAvailable = true;
            appointmentsAvailableCount++;
            const personLabel = session.available_capacity > 1 ? "people" : "person";
            dataOfSlot = `${dataOfSlot}\n<b>${center.name}</b> on <u>${sessionDateFormatted}</u>\n(<b>${session.min_age_limit}</b> years+ )\n<b>Dose[1]</b> for ${session.available_capacity_dose1} people\n<b>Dose[2]</b> for ${session.available_capacity_dose2} people\nAppointments available: ${session.available_capacity} ${personLabel}\n----------------------------------------------------------`;
            if(!nearestAppoinmentDate) {
              nearestAppoinmentDate = transformedDate;
            }
            if(session.min_age_limit < 40) {
              slotsfor18plus++;
            } else {
              slotsfor45plus++;
            }
          }
        });
        return isSlotAvailable;
      });
    }

    return { centers: updatedCenters, appointmentsAvailableCount, nearestAppoinmentDate, dataOfSlot, slotsfor18plus, slotsfor45plus };
  } catch (error) {
    console.log("Error: " + error.message);
    return Promise.reject(error);
  }
};

module.exports =  { pingCowin, transformDate };
