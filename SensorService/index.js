//sensorService
require("dotenv").config();
const express = require("express");
const mqtt = require("mqtt");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// Initialisierung von Express und Middleware
const app = express();
app.use(express.json());
app.use(cors());

// Initialisierung des MongoDB Clients
const mongoClient = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// const mongoClient = new MongoClient(process.env.MONGODB_URI);

// Globaler Verweis auf die Datenbank
let db;

// Funktion zum Herstellen der Verbindung zur MongoDB
async function connectToDatabase() {
  await mongoClient.connect();
  db = mongoClient.db("userDB");
  console.log("Verbunden mit der MongoDB-Datenbank.");
}

// MQTT-Broker-Verbindungsdetails
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
  clientId: `sensorservice_${uuidv4()}`,
});

// MQTT Verbindung und Nachrichtenhandling
mqttClient.on("connect", () => {
  mqttClient.subscribe([
    process.env.MQTT_TEMPERATURE_TOPIC, 
    process.env.MQTT_HUMIDITY_TOPIC,
    process.env.MQTT_DUST_TOPIC  // Neues Topic für Staubdaten
  ], (err) => {
    if (err) {
      console.error("Fehler beim Abonnieren der MQTT-Themen:", err);
    } else {
      console.log("Erfolgreich MQTT-Themen abonniert");
    }
  });
});


// MQTT Verbindung und Nachrichtenhandling
mqttClient.on("message", async (topic, message) => {
  const msg = message.toString();
  let data;

  try {
    data = JSON.parse(msg);
    console.log("Empfangene Daten:", data); // Protokollieren der empfangenen Daten
  } catch (e) {
    console.error(`Fehler beim Parsen der MQTT-Nachricht: ${e}`);
    return;
  }

  if (data.mac) {
    let sensorType;
    
    if (topic === process.env.MQTT_TEMPERATURE_TOPIC) {
      sensorType = "temperature";
    } else if (topic === process.env.MQTT_HUMIDITY_TOPIC) {
      sensorType = "humidity";
    } else if (topic === process.env.MQTT_DUST_TOPIC) {
      sensorType = "staub"; // Stellen Sie sicher, dass dies mit Ihrem MQTT-Nachrichtenformat übereinstimmt
    } else {
      console.error("Unbekanntes Topic: " + topic);
      return;
    }

    await mongoClient.connect();
    const collection = mongoClient.db("userDB").collection("data");

    const document = {
      mac: data.mac,
      sensorType: sensorType,
      value: data[sensorType], // Stellen Sie sicher, dass dieser Schlüssel im JSON-Objekt vorhanden ist
      timestamp: new Date(),
    };

    try {
      await collection.insertOne(document);
      console.log(`Daten gespeichert für ${sensorType}: ${JSON.stringify(document)}`);
    } catch (e) {
      console.error(`Fehler beim Speichern in die Datenbank: ${e}`);
    }
  } else {
    console.error("Keine MAC-Adresse in den Daten gefunden");
  }
});


// REST API Endpunkte
app.post("/add-esp-device", async (req, res) => {
  console.log("calling /add-esp-device endpoint");
  const { mac, username, devicename, raum } = req.body;
  console.log("adding esp with following data:");
  console.log(mac, username, devicename, raum);
  if (!mac || !username || !devicename || !raum)  {
    console.log("MAC-Adresse und Benutzername sind erforderlich");
    return res.status(400)
    //   .send({ error: "MAC-Adresse und Benutzername sind erforderlich" });
  }

  try {
    const result = await db.collection("esp_devices").insertOne({
      mac,
      username,
      devicename,
      raum,
      created_at: new Date(),
    });
    console.log("ESP-Gerät erfolgreich hinzugefügt");
    res.status(201).send({
      message: "ESP-Gerät erfolgreich hinzugefügt",
      id: result.insertedId,
    });
  } catch (err) {
    console.error("Fehler beim Hinzufügen des ESP-Geräts:", err);
    // res.status(500).send({ error: "Fehler beim Hinzufügen des ESP-Geräts" });
  }
});

// GET-Route, um alle Daten zu holen
app.post("/data", async (req, res) => {
  console.log("calling /data endpoint");
  const authheader = req.headers.authorization;
  if(!authheader || ! authheader.split(' ')[1]) return res.status(401).send({error: 'Token ist ungültig'});
  const token = authheader && authheader.split(' ')[1];


 
    const validationResponse = await axios.get('http://localhost:3001/validate-token', {
      headers: {authorization: `Bearer ${token}`}
    });
    console.log('Token-Validierung erfolgreich');
    console.log(validationResponse.data.user.username)
    const username = validationResponse.data.user.username;
    if (!validationResponse.data.isValid) {
      console.log('Token ist ungültig');
      return res.status(403).send({ error: 'Token ist ungültig' });
}

  try {
    await mongoClient.connect();
    const data = await mongoClient
      .db("userDB")
      .collection("esp_devices")
      .find({ username: username })
      .toArray();
console.log(data);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send({ error: "Fehler beim Abrufen der Daten" });
  }
  
});

// GET-Route, um Daten für ein bestimmtes Gerät abzurufen
app.post("/devicedata/:mac", async (req, res) => {
    const { mac } = req.params;
    console.log('Anfrage für Gerät mit MAC-Adresse:', mac);
  
    try {
      const deviceData = await db.collection("data").find({ mac: mac }).toArray();
      console.log('Gerätedaten gefunden:', deviceData);
      res.status(200).json(deviceData);
    } catch (err) {
        console.error('Fehler beim Abrufen der Gerätedaten:', err);
        res.status(500).send({ error: "Fehler beim Abrufen der Gerätedaten" });
      }
  });
  
  
// Serverstart
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await connectToDatabase(); // Stellen Sie sicher, dass die Datenbankverbindung hergestellt ist
  console.log(`Server läuft auf Port ${PORT}`);
});
