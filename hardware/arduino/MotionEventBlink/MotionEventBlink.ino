/*
  Arduino Uno WiFi Rev2 – Motion-Triggered LED and Buzzer Based on Supabase Activities

  Description:
  This sketch connects the Arduino Uno WiFi Rev2 to a WiFi network and fetches
  event/activity data from a Supabase database. It uses the onboard IMU 
  accelerometer to detect motion and triggers an external LED and buzzer 
  when motion is detected.

  Behavior:
  1. The Arduino detects motion using the onboard accelerometer.
  2. On detecting **new motion**, it fetches all registrations for a specified 
     profile ID from the Supabase `registrations` table.
  3. It extracts the `activity_id`s from the registrations and then fetches the 
     corresponding activities from the `activities` table **scheduled for the hardcoded date**.
  4. The number of activities for that day determines how many times the external 
     LED (pin 13) blinks and the buzzer (pin 12 buzzes in sync).
  5. The LED and buzzer trigger **only once per motion event**. If the Arduino 
     remains stationary, no blinking/buzzing occurs until it is moved again.

  Hardware Requirements:
  - Arduino Uno WiFi Rev2
  - External LED connected to pin 13 with a 220–330Ω resistor to GND
  - Buzzer connected to pin 12 to GND

  Software Requirements:
  - WiFiNINA library
  - ArduinoHttpClient library
  - Arduino_LSM6DS3 library
  - ArduinoJson library (for parsing JSON responses)

  Notes:
  - The date for fetching activities is currently **hardcoded**. It can be 
    replaced with NTP/RTC logic for dynamic daily updates.
  - The profile ID is specified in the code (`profileID`) for fetching user-specific 
    registrations.
  - The sketch communicates securely with Supabase using HTTPS.
*/


#include <SPI.h>
#include <WiFiNINA.h>
#include <ArduinoHttpClient.h>
#include <Arduino_LSM6DS3.h>
#include <ArduinoJson.h>

// WiFi credentials
char ssid[] = "YOUR_WIFI_SSID";
char pass[] = "YOUR_WIFI_PASSWORD";

// Supabase credentials
char supabase_url[] = "YOUR_PROJECT_ID.supabase.co";  
char supabase_key[] = "YOUR_SUPABASE_ANON_KEY";  
int port = 443;

// User profile ID (dynamic)
char profileID[] = "28307ee2-ddc7-4395-a621-cfb7f85a50e1";

WiFiSSLClient wifi;
HttpClient client = HttpClient(wifi, supabase_url, port);

// External devices
const int ledPin = 13;    // external LED
const int buzzerPin = 12; // buzzer
bool wasMoved = false;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
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

  // Trigger LED/buzzer only on new motion
  if (moved && !wasMoved) {
    wasMoved = true;

    // --- Step 1: Fetch registrations for this profile ---
    String regUrl = "/rest/v1/registrations?select=activity_id&profile_id=eq." + String(profileID);
    client.beginRequest();
    client.get(regUrl);
    client.sendHeader("apikey", supabase_key);
    client.sendHeader("Authorization", "Bearer " + String(supabase_key));
    client.sendHeader("Accept", "application/json");
    client.endRequest();

    int statusCode = client.responseStatusCode();
    String regResponse = client.responseBody();
    Serial.print("Registrations Status: "); Serial.println(statusCode);
    Serial.print("Registrations Response: "); Serial.println(regResponse);

    // --- Step 2: Parse JSON to extract activity IDs ---
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, regResponse);
    if (error) {
      Serial.print("JSON parse error: ");
      Serial.println(error.c_str());
      return;
    }

    String ids = "";
    for (JsonObject reg : doc.as<JsonArray>()) {
      if (ids.length() > 0) ids += ",";
      ids += "\"" + String((const char*)reg["activity_id"]) + "\""; // quote UUIDs
    }

    if (ids.length() == 0) return; // no registrations

    // --- Step 3: Fetch activities for hardcoded date ---
    String today = "2024-09-23"; // hardcoded date
    String actUrl = "/rest/v1/activities?select=start_datetime&id=in.(" + ids + ")&start_datetime=gte." + today + "&start_datetime=lt." + today + "T23:59:59";

    client.beginRequest();
    client.get(actUrl);
    client.sendHeader("apikey", supabase_key);
    client.sendHeader("Authorization", "Bearer " + String(supabase_key));
    client.sendHeader("Accept", "application/json");
    client.endRequest();

    int actStatus = client.responseStatusCode();
    String actResponse = client.responseBody();
    Serial.print("Activities Status: "); Serial.println(actStatus);
    Serial.print("Activities Response: "); Serial.println(actResponse);

    // --- Step 4: Count events and blink LED + buzzer ---
    int blinkCount = 0;
    for (unsigned int i = 0; i < actResponse.length(); i++) {
      if (actResponse[i] == '{') blinkCount++;
    }
    Serial.print("Blinking LED and buzzing "); Serial.print(blinkCount); Serial.println(" times");

    for (int i = 0; i < blinkCount; i++) {
      digitalWrite(ledPin, HIGH);
      digitalWrite(buzzerPin, HIGH);
      delay(300);
      digitalWrite(ledPin, LOW);
      digitalWrite(buzzerPin, LOW);
      delay(300);
    }
  }
  else if (!moved) {
    wasMoved = false;
  }

  delay(100);
}
