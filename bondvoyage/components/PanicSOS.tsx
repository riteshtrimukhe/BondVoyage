import { apiService, getDeviceInfo, PanicEventData } from "@/lib/api";
import { locationService } from "@/lib/location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle, Phone, Zap } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const PanicSOS = () => {
  const [isActivating, setIsActivating] = useState(false);

  const isDemoMode = async (): Promise<boolean> => {
    try {
      const demoStatus = await AsyncStorage.getItem("isDemoUser");
      return demoStatus === "true";
    } catch {
      return false;
    }
  };

  const getTouristId = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("authToken"); // Tourist ID stored as auth token
    } catch (error) {
      console.error("Error getting tourist ID:", error);
      return null;
    }
  };

  const handlePanicAlert = async () => {
    if (isActivating) return;

    // Show confirmation dialog
    Alert.alert(
      "Emergency Alert",
      "This will immediately alert authorities and emergency contacts. Are you in danger?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "SEND ALERT",
          style: "destructive",
          onPress: activatePanicAlert,
        },
      ]
    );
  };

  const activatePanicAlert = async () => {
    setIsActivating(true);

    try {
      // Get tourist ID
      const touristId = await getTouristId();
      if (!touristId) {
        Alert.alert(
          "Error",
          "Tourist registration not found. Please register first."
        );
        return;
      }

      // Get current location
      const location = await locationService.getCurrentLocation();
      if (!location) {
        Alert.alert(
          "Error",
          "Unable to get your location. Please check location permissions."
        );
        return;
      }

      // Get device information
      const deviceInfo = await getDeviceInfo();

      // Prepare panic event data
      const panicData: PanicEventData = {
        touristId,
        location: {
          lat: location.latitude,
          lon: location.longitude,
        },
        deviceId: deviceInfo.deviceId,
        source: "phone",
        panicType: "manual",
        additionalData: {
          batteryLevel: deviceInfo.batteryLevel,
          networkStrength: deviceInfo.networkStrength,
          nearbyDevices: 2, // Placeholder - would need Bluetooth scanning
          lastKnownActivity: "emergency_button_pressed",
        },
      };

      // Send panic event to backend
      const response = await apiService.createPanicEvent(panicData);

      // Check if we're in demo mode for enhanced alert
      const inDemoMode = await isDemoMode();

      if (response.success && response.data) {
        const alertTitle = inDemoMode
          ? "🚨 Demo Emergency Alert Sent!"
          : "Emergency Alert Sent!";
        const coordinatesInfo = inDemoMode
          ? `\n📍 Current Coordinates:\nLatitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}\n\n`
          : "";

        Alert.alert(
          alertTitle,
          `${coordinatesInfo}Alert ID: ${response.data.eventId}\n\nAuthorities and emergency contacts have been notified of your location.`,
          [{ text: "OK" }]
        );
      } else {
        // Fallback: Even if backend fails, show user that something happened
        Alert.alert(
          "Alert Activated",
          "Emergency alert has been triggered. If backend is unavailable, please call emergency services directly.",
          [
            {
              text: "Call Emergency",
              onPress: () => {
                /* Would open phone dialer */
              },
            },
            { text: "OK" },
          ]
        );
      }
    } catch (error) {
      console.error("Panic alert error:", error);
      Alert.alert(
        "Emergency Alert",
        "There was an issue sending the alert, but emergency mode is activated. Please call emergency services if needed.",
        [
          {
            text: "Call Emergency",
            onPress: () => {
              /* Would open phone dialer */
            },
          },
          { text: "OK" },
        ]
      );
    } finally {
      setIsActivating(false);
    }
  };
  return (
    <LinearGradient
      colors={["#ef4444", "#dc2626"]}
      style={{ borderRadius: 24, shadowOpacity: 0.5 }}
    >
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="bg-red-600 p-3 rounded-full mr-3">
              <AlertTriangle color="white" size={24} />
            </View>
            <View>
              <Text className="text-xl font-bold text-white">
                Emergency SOS
              </Text>
              <Text className="text-red-100 text-sm">
                Instant emergency alert
              </Text>
            </View>
          </View>
          <View className="bg-red-600 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">24/7</Text>
          </View>
        </View>

        <LinearGradient
          colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.3)"]}
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.3)",
          }}
        >
          <TouchableOpacity
            onPress={handlePanicAlert}
            activeOpacity={0.8}
            disabled={isActivating}
            className="w-full p-4 rounded-2xl"
          >
            <View className="flex flex-row items-center justify-center gap-3">
              <View className="bg-white p-2 rounded-full">
                <Phone color="#EF4444" size={20} />
              </View>
              <Text className="text-base font-bold text-white">
                {isActivating ? "SENDING ALERT..." : "EMERGENCY ALERT"}
              </Text>
              {!isActivating && <Zap color="white" size={20} />}
            </View>
          </TouchableOpacity>
        </LinearGradient>
        <Text className="text-red-100 text-xs mt-3 text-center">
          Instantly alerts authorities & emergency contacts with your location
        </Text>
      </View>
    </LinearGradient>
  );
};

export default PanicSOS;
