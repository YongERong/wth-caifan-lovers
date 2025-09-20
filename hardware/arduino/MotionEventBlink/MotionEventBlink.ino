/*
  Arduino Uno WiFi Rev2 – Motion-Triggered Event LED Blink

  Description:
  This sketch connects the Arduino Uno WiFi Rev2 to WiFi and fetches event data
  from a Supabase table named 'events'. It uses the onboard IMU accelerometer to detect motion.

  Behavior:
  1. When the Arduino is moved (detected via accelerometer), it makes a GET request
     to Supabase to fetch the number of events scheduled for the current day.
  2. The onboard LED (LED_BUILTIN) blinks a number of times equal to the number 
     of events for that day.
  3. The LED blinks only once per motion event. If the Arduino remains stationary,
     no blinking occurs until it is moved again.
  4. Motion state is tracked so that repeated blinking does not happen while the 
     Arduino is continuously moving.

  Requirements:
  - WiFiNINA library
  - ArduinoHttpClient library
  - Arduino_LSM6DS3 library
  - Supabase project with an 'events' table containing 'id', 'event_name', and 'event_date' fields.

  Notes:
  - The date is currently hardcoded for testing; it can be replaced with a real-time
    clock (RTC) or NTP to automatically fetch the current date.
  - 'event' table was created on a separate database for testing purposes. 
    Not sure which table to reference to.
*/

#include <SPI.h>
#include <WiFiNINA.h>
#include <ArduinoHttpClient.h>
#include <Arduino_LSM6DS3.h> // IMU library

// WiFi credentials
char ssid[] = "YOUR_WIFI_SSID";
char pass[] = "YOUR_WIFI_PASSWORD";

// Supabase credentials
char supabase_url[] = "YOUR_PROJECT_ID.supabase.co";  
char supabase_key[] = "YOUR_SUPABASE_ANON_KEY";  
int port = 443; // HTTPS

WiFiSSLClient wifi;
HttpClient client = HttpClient(wifi, supabase_url, port);

const int ledPin = LED_BUILTIN;
bool wasMoved = false; // tracks previous motion state

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);

  // Connect to WiFi
  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    Serial.println("Connecting to WiFi...");
    delay(5000);
  }
  Serial.println("WiFi connected");

  // Initialize IMU
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }
  Serial.println("IMU ready");
}

void loop() {
  bool moved = false;
  float x, y, z;

  // Check for motion
  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(x, y, z);
    if (abs(x) > 0.2 || abs(y) > 0.2 || abs(z) > 0.2) {
      moved = true;
    }
  }

  // Trigger LED only on **new motion**
  if (moved && !wasMoved) {
    wasMoved = true;  // update state

    // Hardcoded date for testing; replace with NTP if desired
    String today = "2025-09-20";

    // Fetch events from Supabase
    String url = "/rest/v1/events?select=id&event_date=eq." + today;
    client.beginRequest();
    client.get(url);
    client.sendHeader("apikey", supabase_key);
    client.sendHeader("Authorization", "Bearer " + String(supabase_key));
    client.sendHeader("Accept", "application/json");
    client.endRequest();

    int statusCode = client.responseStatusCode();
    String response = client.responseBody();
    Serial.print("Status: "); Serial.println(statusCode);
    Serial.print("Response: "); Serial.println(response);

    // Count events (number of JSON objects)
    int blinkCount = 0;
    for (unsigned int i = 0; i < response.length(); i++) {
      if (response[i] == '{') blinkCount++;
    }
    Serial.print("Blinking LED "); Serial.print(blinkCount); Serial.println(" times");

    // Blink LED
    for (int i = 0; i < blinkCount; i++) {
      digitalWrite(ledPin, HIGH);
      delay(300);
      digitalWrite(ledPin, LOW);
      delay(300);
    }
  }
  else if (!moved) {
    wasMoved = false; // reset state when motion stops
  }

  delay(100); // small delay to avoid too fast looping
}