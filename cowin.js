const axios = require("axios");
const { transformDate } = require("./dateutils");

const pingCowin = async ({ districtId, age, date }) => {
  try {
    const transformedDate = transformDate(date);
    const { data } = await axios.get(
      `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${transformedDate}`,
      {
        headers: {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36"}
      }
    );
    const { centers } = data;
    let isSlotAvailable = false;
    let dataOfSlot = "";
    let updatedCenters = [];
    let appointmentsAvailableCount = 0;
    let nearestAppoinmentDate = null;
    if (centers.length) {
      updatedCenters = centers.filter((center) => {
        isSlotAvailable = false;
        center.sessions.forEach((session) => {
          if (
            session.available_capacity > 0
          ) {
            isSlotAvailable = true;
            appointmentsAvailableCount++;
            dataOfSlot = `${dataOfSlot}\n Slot for ${session.available_capacity} people (${session.min_age_limit} years+ ) is available:\n <b>${center.name}</b> on ${session.date}\n ----------------------------------------------------------`;
            if(!nearestAppoinmentDate) {
              nearestAppoinmentDate = transformedDate;
            }
          }
        });
        return isSlotAvailable;
      });
    }

    return { centers: updatedCenters, appointmentsAvailableCount, nearestAppoinmentDate, dataOfSlot };
  } catch (error) {
    console.log("Error: " + error.message);
    return Promise.reject(error);
  }
};

module.exports =  { pingCowin, transformDate };
