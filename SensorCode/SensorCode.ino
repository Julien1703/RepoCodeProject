#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "config.h"
#include "MHZ19.h" 
#include <SoftwareSerial.h>

// DHT11 Sensor
#define DHTPIN 5
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// GP2Y1014AU0F Staub Sensor
const int ledPower = D7;   
const int analogPin = A0;  
const unsigned int samplingTime = 280;
const unsigned int deltaTime = 40;
const unsigned int sleepTime = 9680;

// MH-Z19B CO2 Sensor
#define RX_PIN D5                                        
#define TX_PIN D6                                          
#define BAUDRATE 9600 

MHZ19 myMHZ19;
SoftwareSerial mySerial(RX_PIN, TX_PIN);

unsigned long timeElapse = 0;

WiFiClient espClient;
PubSubClient mqttClient(espClient);

void setup() {
  Serial.begin(115200);
  pinMode(ledPower, OUTPUT);
  dht.begin();

  // WLAN-Verbindung
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nVerbunden mit Wi-Fi!");
  Serial.print("IP-Adresse: ");
  Serial.println(WiFi.localIP());

  // MQTT-Verbindung
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  while (!mqttClient.connected()) {
    if (mqttClient.connect("ESP8266Client")) {
      Serial.println("Verbunden mit MQTT-Broker");
    } else {
      Serial.print("Fehler beim Verbinden mit MQTT-Broker, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Warte 5 Sekunden, bevor erneuter Versuch...");
      delay(5000);
    }
  }

  // Initialisieren des MH-Z19B CO2 Sensors
  mySerial.begin(BAUDRATE);    
  myMHZ19.begin(mySerial);     
  myMHZ19.autoCalibration(false); 
}

int mapSensorValue(int rawValue) {
    return map(rawValue, 0, 1023, 1, 100);
}

float round2(float val) {
    return round(val * 100.0) / 100.0;
}

void loop() {
  if (!mqttClient.connected()) {
    Serial.println("conection lost");
    while (!mqttClient.connected()) {
      if (mqttClient.connect("ESP8266Client")) {
        Serial.println("Verbunden mit MQTT-Broker");
      } else {
        Serial.print("Fehler beim Verbinden mit MQTT-Broker, rc=");
        Serial.print(mqttClient.state());
        Serial.println(" Warte 5 Sekunden, bevor erneuter Versuch...");
        delay(5000);
      }
    }
  }
  mqttClient.loop();

  // MAC-Adresse ermitteln
  String macAddress = WiFi.macAddress();

  // GP2Y1014AU0F Staub Sensor Logik
  digitalWrite(ledPower, LOW);
  delayMicroseconds(samplingTime);
  int voMeasured = analogRead(analogPin);
  delayMicroseconds(deltaTime);
  digitalWrite(ledPower, HIGH);
  delayMicroseconds(sleepTime);
  int mappedValue = round2(mapSensorValue(voMeasured));

  // JSON-Objekt für Staub Sensor
  DynamicJsonDocument jsonDocumentStaub(256);
  jsonDocumentStaub["mac"] = macAddress;
  jsonDocumentStaub["dust"] = mappedValue;
  String jsonStringStaub;
  serializeJson(jsonDocumentStaub, jsonStringStaub);
  mqttClient.publish("dp2/dust", jsonStringStaub.c_str());

  Serial.print("Staub Wert: ");
  Serial.println(mappedValue);

  // MH-Z19B CO2 Sensor Logik
  if (millis() - timeElapse >= 2000) {
    int CO2 = round2(myMHZ19.getCO2());        

    // JSON-Objekt für CO2 Sensor
    DynamicJsonDocument jsonDocumentCO2(256);
    jsonDocumentCO2["mac"] = macAddress;
    jsonDocumentCO2["co2"] = CO2;
    String jsonStringCO2;
    serializeJson(jsonDocumentCO2, jsonStringCO2);
    mqttClient.publish("dp2/co2", jsonStringCO2.c_str());

    Serial.print("CO2 Wert: ");
    Serial.println(CO2);

    timeElapse = millis();
  }

  // DHT11 Sensor Logik
  float h = round2(dht.readHumidity());
  float t = round2(dht.readTemperature());

  if (isnan(h) || isnan(t)) {
    Serial.println("Fehler beim Lesen des DHT11-Sensors!");
  } else {
    // JSON-Objekt für Temperatur erstellen und senden
    DynamicJsonDocument jsonDocumentTemp(256);
    jsonDocumentTemp["mac"] = macAddress;
    jsonDocumentTemp["temperature"] = t;
    String jsonStringTemp;
    serializeJson(jsonDocumentTemp, jsonStringTemp);
    mqttClient.publish("dp2/temperature", jsonStringTemp.c_str());

    // JSON-Objekt für Luftfeuchtigkeit erstellen und senden
    DynamicJsonDocument jsonDocumentHum(256);
    jsonDocumentHum["mac"] = macAddress;
    jsonDocumentHum["humidity"] = h;
    String jsonStringHum;
    serializeJson(jsonDocumentHum, jsonStringHum);
    mqttClient.publish("dp2/humidity", jsonStringHum.c_str());

    Serial.print("Temperatur: ");
    Serial.print(t);
    Serial.print("°C, Luftfeuchtigkeit: ");
    Serial.print(h);
    Serial.println("%");
  }

  delay(5000);
}
