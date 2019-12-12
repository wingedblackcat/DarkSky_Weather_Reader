# DarkSky_Weather_Reader

### Motivation
I wanted to show weather information in Grafana, but I coudn't find something that suits my needs.
So I build this script that receives weather information from DarkSky API and sends it to an InfluxDB Database,
and in Grafana I use it to show my weather.

### About
Javascript app that reads weather information from DarkSky API, and writes it into an InfluxDB database.

### Dependencies
1) influx
  npm page - https://www.npmjs.com/package/influx
2) request
  npm page - https://www.npmjs.com/package/request
3) request-promise
  npm page - https://www.npmjs.com/package/request-promise
4) unix-timestamp
  npm page - https://www.npmjs.com/package/unix-timestamp
