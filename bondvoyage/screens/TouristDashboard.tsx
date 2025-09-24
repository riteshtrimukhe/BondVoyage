import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

// Your reusable components
import ConsentManager from "@/components/ConsentManager";
import CurrentLocation from "@/components/CurrentLocation";
import EmergencyContact from "@/components/EmergencyContact";
import ItineraryManager from "@/components/ItineraryManager";
import PanicSOS from "@/components/PanicSOS";
import RecentActivity from "@/components/RecentActivity";
import SafetyScore from "@/components/SafetyScore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TouristPortal = () => {
  const [touristData, setTouristData] = useState({
    name: "Guest User",
    touristId: null as string | null,
    isRegistered: false,
  });

  useEffect(() => {
    loadTouristData();
  }, []);

  const loadTouristData = async () => {
    try {
      // Get stored tourist data
      const storedTouristId = await AsyncStorage.getItem("authToken");
      const storedName = await AsyncStorage.getItem("touristName");

      if (storedTouristId) {
        setTouristData({
          name: storedName || `Tourist ${storedTouristId.substring(0, 8)}`,
          touristId: storedTouristId,
          isRegistered: true,
        });
      } else {
        // User not registered yet
        setTouristData({
          name: "Guest User",
          touristId: null,
          isRegistered: false,
        });
      }
    } catch (error) {
      console.error("Error loading tourist data:", error);
    }
  };
  return (
    <LinearGradient colors={["#f8fafc", "#e0f2fe"]} style={{ flex: 1 }}>
      <ScrollView
        className="px-4 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="w-full max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between flex-wrap gap-4">
              <View>
                <Text className="text-2xl font-bold text-slate-800">
                  Tourist Dashboard
                </Text>
                <Text className="text-slate-500 text-sm">
                  Welcome back, {touristData.name}
                </Text>
                {touristData.isRegistered && touristData.touristId && (
                  <Text className="text-xs text-slate-400 mt-1">
                    ID: {touristData.touristId.substring(0, 12)}...
                  </Text>
                )}
                {!touristData.isRegistered && (
                  <Text className="text-orange-500 text-xs mt-1">
                    ⚠️ Please complete registration for full features
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View className="flex-col gap-6">
            {/* PRIORITY: Emergency Card - Now at the top */}
            <PanicSOS />

            {/* Safety Score - Enhanced */}
            <SafetyScore />

            {/* Current Location - Enhanced */}
            <CurrentLocation />

            {/* Itinerary Management - New Feature */}
            {touristData.isRegistered && <ItineraryManager />}

            {/* Privacy & Consent Management */}
            <ConsentManager />

            {/* Recent Activity - Enhanced */}
            <RecentActivity />

            {/* Emergency Contacts - Enhanced */}
            <EmergencyContact />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default TouristPortal;
