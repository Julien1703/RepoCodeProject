#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <WiFiManager.h>
#include <ArduinoJson.h>
#include "config.h"

#define DHTPIN D5
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);

  // Verbindung zum Wi-Fi-Netzwerk herstellen
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("Verbunden mit Wi-Fi!");
  Serial.println("IP Adresse: ");
  Serial.println(WiFi.localIP());

  // Verbindung zum MQTT-Broker herstellen
  client.setServer(mqttServer, mqttPort);

  // Warte, bis die Verbindung hergestellt ist
  while (!client.connected()) {
    if (client.connect("ESP-julien")) {
      Serial.println("Verbunden mit MQTT-Broker");
    } else {
      Serial.print("Fehler beim Verbinden mit MQTT-Broker, rc=");
      Serial.print(client.state());
      Serial.println("Warte 5 Sekunden, bevor erneuter Versuch...");
      delay(5000);
    }
  }
}


void loop() {
  // Lese Temperatur- und Luftfeuchtigkeitswerte aus dem DHT11-Sensor
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Fehler beim Lesen des DHT11-Sensors!");
    return;
  }

  // Erstelle JSON-Objekte und fülle sie mit den gewünschten Daten
  DynamicJsonDocument tempJsonDocument(256);
  tempJsonDocument["sender"] = "julien";
  tempJsonDocument["mac"] = WiFi.macAddress();
  tempJsonDocument["temperature"] = temperature;

  DynamicJsonDocument humiJsonDocument(256);
  humiJsonDocument["sender"] = "julien";
  humiJsonDocument["mac"] = WiFi.macAddress();
  humiJsonDocument["humidity"] = humidity;

  // Konvertiere JSON-Objekte in Strings
  String tempJsonString;
  serializeJson(tempJsonDocument, tempJsonString);

  String humiJsonString;
  serializeJson(humiJsonDocument, humiJsonString);

  // Sende JSON-Strukturen als Nachrichten
  client.publish("dp2/temperature", tempJsonString.c_str());
  Serial.println("Temperature erfolgreich gesendet: " + tempJsonString);

  client.publish("dp2/humidity", humiJsonString.c_str());
  Serial.println("Humidity erfolgreich gesendet: " + humiJsonString);

  delay(2000);
}
