/*
  Rui Santos & Sara Santos - Random Nerd Tutorials
  Complete project details at https://RandomNerdTutorials.com/esp-now-esp32-arduino-ide/  
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

#include <esp_now.h>
#include <WiFi.h>

int LED = 13;
bool buttonState = 0;

// Structure example to receive data
// Must match the sender structure
typedef struct struct_message {
  bool button_value;
} struct_message;

// Create a struct_message called myData
struct_message blink;

// callback function that will be executed when data is received
void OnDataRecv(const uint8_t * mac, const uint8_t *incomingData, int len) {
  memcpy(&blink, incomingData, sizeof(blink));
  Serial.print("Bytes received: ");
  Serial.println(len);
  Serial.print("Button Value: ");
  Serial.println(blink.button_value);
  led_lightup();
  
}
 
void led_lightup() {
  if (blink.button_value != 1) { //while button is pressed
    buttonState = !buttonState;   //changes buttonState everytime button is pressed
 //button state only changes when button is pressed down, once u release whatever the button state is at will be saved
    if (buttonState == 1) {
      digitalWrite(LED, HIGH);
    } else{
        digitalWrite(LED, LOW);
    }
    delay(100);
    
  }
}


void setup() {
  // Initialize Serial Monitor
  Serial.begin(115200);
  pinMode(LED, OUTPUT);

  // Set device as a Wi-Fi Station
  WiFi.mode(WIFI_STA);

  // Init ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }
  
  // Once ESPNow is successfully Init, we will register for recv CB to
  // get recv packer info
  esp_now_register_recv_cb(esp_now_recv_cb_t(OnDataRecv));
}
 
void loop() {

}