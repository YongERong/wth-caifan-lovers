# include <WiFi.h>
#include <esp_wifi.h>

const char* ssid = "";
const char* password = "";


void setup() {
  Serial.begin(115200);
  delay(2000);  // give the monitor time

  WiFi.mode(WIFI_STA);  // initialize WiFi in station mode

  WiFi.begin(ssid, password);
  Serial.println("\nConnecting");

    while(WiFi.status() != WL_CONNECTED){
        Serial.print(".");
        delay(100);
    }

    Serial.println("\nConnected to the WiFi network");
    Serial.print("Local ESP32 IP: ");
    Serial.println(WiFi.localIP());
}


void loop() {
}