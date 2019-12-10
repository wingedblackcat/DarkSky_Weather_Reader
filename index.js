const darkSkyReader = require("./darkSkyReader");

const WeatherWriter = require("./metricWriter");
const weatherDataWriter = new WeatherWriter();

const darkSky = { read: darkSkyReader, write: weatherDataWriter };

const handler = async () => {
    try {
        const data = await darkSky.read();
        await darkSky.write.distributeData(data);
        console.info(`Fetching weather info from DarkSky is done`);
    } catch (e) {
        console.error(`ERROR getting data`, e);
    }
};

module.exports = {
    handler
};
