require('dotenv').config();
const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();
const createTables = require('./create_table');
const { v4: uuidv4 } = require('uuid'); // UUID-Modul importieren


// Überprüfung der Umgebungsvariablen
const requiredEnvVars = [
  'MQTT_BROKER_URL',
  'MQTT_TEMPERATURE_TOPIC',
  'MQTT_HUMIDITY_TOPIC',
  'MQTT_LOGS_TOPIC'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Fehlende Umgebungsvariablen: ${missingEnvVars.join(', ')}`);
  process.exit(1); // Beendet den Prozess mit einem Fehlerstatus
}




// DATABASE STUFF:

let db = new sqlite3.Database(`./${process.env.DATABASE_FILENAME}.db`, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Verbunden mit der SQLite-Datenbank.');

  createTables(db); // Tabelle erstellen

  // MQTT STUFF:
  const MqttclientId = 'mqtt_' + uuidv4(); // Eindeutige Client-ID generieren

  const temperatureTopic = process.env.MQTT_TEMPERATURE_TOPIC;
const humidityTopic = process.env.MQTT_HUMIDITY_TOPIC;
const logsTopic = process.env.MQTT_LOGS_TOPIC;

  const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
    clientId: MqttclientId
  });

  mqttClient.on('connect', function () {
    mqttClient.subscribe(temperatureTopic, function (err) {
      if (!err) {
        console.log(`Erfolgreich auf Thema "${temperatureTopic}" subscribed`);
      }
    });
    mqttClient.subscribe(humidityTopic, function (err) {
      if (!err) {
        console.log(`Erfolgreich auf Thema "${humidityTopicTopic}" subscribed`);
      }
    });
    const logMessage = `SensorService with  Client-ID ${MqttclientId} verbunden. (Julien)`;
    mqttClient.publish(logsTopic, logMessage);
  });

  mqttClient.on('message', (topic, message) => {
    if (topic === 'dp2/temperature') {
      try {
        const data = JSON.parse(message.toString());

        // Überprüfe, ob die Werte NULL sind
        if (data.temperature != null && data.mac != null) {
          const stmt = db.prepare('INSERT INTO temperature_data ( temperature, mac) VALUES ( ?, ?)');
          stmt.run( data.temperature, data.mac); // Verwende UUID als ID
          stmt.finalize();
          console.log(`Daten gespeichert: ${message.toString()}`);
        } else {
          console.log('NULL-Werte erkannt, Datensatz wird ignoriert.');
        }
      } catch (e) {
        console.error(`Fehler beim Parsen der Nachricht: ${e}`);
      }
    }
  });


});
