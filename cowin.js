const axios = require("axios");
const { transformDate } = require("./dateutils");
const { format, parse } = require("fecha");

const pingCowin = async ({ districtId, pincode, age, dose, date }) => {
  try {
    const transformedDate = transformDate(date);
    let url;
    if(districtId) {
      url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${transformedDate}`;
    } else if (pincode) {
      url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${transformedDate}`;
    }
    const { data } = await axios.get(
      url,
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
    let slotsfor40plus = 0;
    
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
        isSlotAvailable = false;
        center.sessions.forEach((session) => {
          if (dose && ((session.min_age_limit > age) || (session.vaccine === "COVAXIN") || (session.available_capacity_dose1 === 0))) {
            console.log("skipped");
            return;
          }
          const sessionDateFormatted = format(parse(session.date, "DD-MM-YYYY"), "MMM D");
          if (
            session.available_capacity > 0
          ) {
            isSlotAvailable = true;
            appointmentsAvailableCount++;
            const personLabel = session.available_capacity > 1 ? "people" : "person";
            dataOfSlot = `${dataOfSlot}\n<b>${center.name}</b> on <u>${sessionDateFormatted}</u>\n(<b>${session.min_age_limit}</b> years+ )\n__<b>${session.vaccine}</b>__\n<b>Dose[1]</b> for ${session.available_capacity_dose1} people\n<b>Dose[2]</b> for ${session.available_capacity_dose2} people\nAppointments available: ${session.available_capacity} ${personLabel}\n----------------------------------------------------------`;
            if(!nearestAppoinmentDate) {
              nearestAppoinmentDate = transformedDate;
            }
            if(session.min_age_limit < 40) {
              slotsfor18plus++;
            } else {
              slotsfor40plus++;
            }
          }
        });
        return isSlotAvailable;
      });
    }

    return { centers: updatedCenters, appointmentsAvailableCount, nearestAppoinmentDate, dataOfSlot, slotsfor18plus, slotsfor40plus };
  } catch (error) {
    console.log("Error: " + error.message);
    return Promise.reject(error);
  }
};

module.exports =  { pingCowin, transformDate };
