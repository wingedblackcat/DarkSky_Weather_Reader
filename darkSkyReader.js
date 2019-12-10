const request = require("request-promise");

const {
    API_KEY: apiKey,
    LATITUDE: latitude,
    LONGITUDE: longitude
} = process.env;

async function getWeather() {
    const weatherURL = `https://api.darksky.net/forecast/${apiKey}/${latitude},${longitude}?units=ca`;
    try {
        return await request.get(weatherURL, { json: true });
    } catch (e) {
        throw e;
    }
}

module.exports = getWeather;
