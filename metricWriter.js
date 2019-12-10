const Influx = require("influx");
const unix = require("unix-timestamp");

const { HOST: host, DATABASE: database } = process.env;

class MetricsWriter {
    constructor(measurement) {
        this.measurement = measurement;
        this.influx = new Influx.InfluxDB({
            host,
            database,
            schema: [
                {
                    measurement: this.measurement,
                    fields: {
                        currentTemperature: Influx.FieldType.FLOAT,
                        currentHumidity: Influx.FieldType.FLOAT,
                        currentWindSpeed: Influx.FieldType.FLOAT,
                        currentUVIndex: Influx.FieldType.INTEGER,
                        currentCloudCover: Influx.FieldType.FLOAT,
                        forecastTemperature: Influx.FieldType.FLOAT,
                        forecastHumidity: Influx.FieldType.FLOAT,
                        forecastWindSpeed: Influx.FieldType.FLOAT,
                        forecastUVIndex: Influx.FieldType.INTEGER,
                        forecastCloudCover: Influx.FieldType.FLOAT,
                        amountOfSnow: Influx.FieldType.FLOAT,
                        amountOfRain: Influx.FieldType.FLOAT,
                        chanceOfOccurrence: Influx.FieldType.FLOAT,
                        dailyAvgWindSpeed: Influx.FieldType.FLOAT,
                        dailyAvgHumidity: Influx.FieldType.FLOAT,
                        dailyAvgTemperature: Influx.FieldType.FLOAT,
                        dailyAvgUV: Influx.FieldType.INTEGER,
                        dailyAvgCloudCover: Influx.FieldType.FLOAT
                    },
                    tags: ["weatherType"]
                }
            ]
        });
    }

    async writeMetrics(measurement, tags, fields, time) {
        try {
            await this.influx.writePoints([
                {
                    measurement: measurement,
                    tags: tags,
                    fields: fields,
                    timestamp: time
                }
            ]);
        } catch (e) {
            console.error(e);
        }
    }

    async distributeData(inserts) {
        // Writing current weather to InfluxDB
        const {
            apparentTemperature: currentTemperature,
            humidity: currentHumidity,
            windSpeed: currentWindSpeed,
            uvIndex: currentUVIndex,
            cloudCover: currentCloudCover,
            time
        } = inserts.currently;
        await this.writeMetrics(
            "current_weather",
            {},
            {
                currentTemperature,
                currentHumidity,
                currentWindSpeed,
                currentUVIndex,
                currentCloudCover
            },
            unix.toDate(time)
        );

        // Writing forecast weather of the next 48 hours to InfluxDB
        inserts.hourly.data.map(async hour => {
            const {
                temperature: forecastTemperature,
                humidity: forecastHumidity,
                windSpeed: forecastWindSpeed,
                uvIndex: forecastUVIndex,
                cloudCover: forecastCloudCover,
                time
            } = hour;
            await this.writeMetrics(
                "hourly_weather",
                {},
                {
                    forecastTemperature,
                    forecastHumidity,
                    forecastWindSpeed,
                    forecastUVIndex,
                    forecastCloudCover
                },
                unix.toDate(time)
            );
        });

        // Writing forecast for the next 7 days to InfluxDB
        inserts.daily.data.map(async day => {
            const {
                precipAccumulation: amountOfSnow = 0,
                precipIntensity: amountOfRain,
                precipProbability: chanceOfOccurrence,
                precipType: weatherType,
                time
            } = day;
            await this.writeMetrics(
                "daily_weather",
                { weatherType },
                {
                    amountOfSnow,
                    amountOfRain,
                    chanceOfOccurrence
                },
                unix.toDate(time)
            );
        });

        // Writing forecast for tomorrow to InfluxDB
        const {
            windSpeed: dailyAvgWindSpeed,
            humidity: dailyAvgHumidity,
            uvIndex: dailyAvgUV,
            cloudCover: dailyAvgCloudCover,
            temperatureMax,
            temperatureMin,
            time: tomorrowTime
        } = inserts.daily.data[1];
        const dailyAvgTemperature = (temperatureMax + temperatureMin) / 2;
        await this.writeMetrics(
            "daily_weather",
            {},
            {
                dailyAvgTemperature,
                dailyAvgWindSpeed,
                dailyAvgHumidity,
                dailyAvgUV,
                dailyAvgCloudCover
            },
            unix.toDate(tomorrowTime)
        );
    }
}

module.exports = MetricsWriter;
