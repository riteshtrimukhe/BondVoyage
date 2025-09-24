import { apiService, ItineraryData } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, MapPin, Plus, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Itinerary {
  id?: string;
  touristId: string;
  startDate: string;
  endDate: string;
  locations: string[];
  activities: string[];
  accommodations: string[];
  anchored?: boolean;
  blockchainRecord?: { id: string };
}

const ItineraryManager = () => {
  const [itinerary, setItinerary] = useState<Itinerary>({
    touristId: "",
    startDate: "",
    endDate: "",
    locations: [],
    activities: [],
    accommodations: [],
    anchored: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [newAccommodation, setNewAccommodation] = useState("");

  useEffect(() => {
    loadTouristId();
  }, []);

  const loadTouristId = async () => {
    try {
      const touristId = await AsyncStorage.getItem("authToken");
      if (touristId) {
        setItinerary((prev) => ({ ...prev, touristId }));
      }
    } catch (error) {
      console.error("Error loading tourist ID:", error);
    }
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      setItinerary((prev) => ({
        ...prev,
        locations: [...prev.locations, newLocation.trim()],
      }));
      setNewLocation("");
    }
  };

  const removeLocation = (index: number) => {
    setItinerary((prev) => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index),
    }));
  };

  const addActivity = () => {
    if (newActivity.trim()) {
      setItinerary((prev) => ({
        ...prev,
        activities: [...prev.activities, newActivity.trim()],
      }));
      setNewActivity("");
    }
  };

  const removeActivity = (index: number) => {
    setItinerary((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const addAccommodation = () => {
    if (newAccommodation.trim()) {
      setItinerary((prev) => ({
        ...prev,
        accommodations: [...prev.accommodations, newAccommodation.trim()],
      }));
      setNewAccommodation("");
    }
  };

  const removeAccommodation = (index: number) => {
    setItinerary((prev) => ({
      ...prev,
      accommodations: prev.accommodations.filter((_, i) => i !== index),
    }));
  };

  const validateItinerary = (): boolean => {
    if (!itinerary.touristId) {
      Alert.alert("Error", "Tourist ID not found. Please register first.");
      return false;
    }
    if (!itinerary.startDate || !itinerary.endDate) {
      Alert.alert("Error", "Please provide start and end dates.");
      return false;
    }
    if (itinerary.locations.length === 0) {
      Alert.alert("Error", "Please add at least one location.");
      return false;
    }
    if (new Date(itinerary.startDate) >= new Date(itinerary.endDate)) {
      Alert.alert("Error", "End date must be after start date.");
      return false;
    }
    return true;
  };

  const anchorItinerary = async () => {
    if (!validateItinerary()) return;

    setIsLoading(true);
    try {
      const itineraryData: ItineraryData = {
        touristId: itinerary.touristId,
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        locations: itinerary.locations,
        activities: itinerary.activities,
        accommodations: itinerary.accommodations,
      };

      const response = await apiService.anchorItinerary(itineraryData);

      if (response.success && response.data) {
        setItinerary((prev) => ({
          ...prev,
          id: response.data.itineraryId,
          anchored: true,
          blockchainRecord: response.data.blockchainRecord,
        }));

        Alert.alert(
          "Itinerary Anchored!",
          `Your travel plan has been securely recorded on the blockchain.\n\nItinerary ID: ${response.data.itineraryId}`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", response.error || "Failed to anchor itinerary");
      }
    } catch (error) {
      console.error("Error anchoring itinerary:", error);
      Alert.alert("Error", "Failed to anchor itinerary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-white/90 rounded-3xl border-0 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle>
          <View className="flex-row items-center gap-3">
            <LinearGradient
              colors={["#8b5cf6", "#7c3aed"]}
              style={{ padding: 12, borderRadius: 16 }}
            >
              <Calendar color="white" size={20} />
            </LinearGradient>
            <View>
              <Text className="text-lg font-bold text-slate-800">
                Travel Itinerary
              </Text>
              <Text className="text-slate-500 text-xs">
                {itinerary.anchored
                  ? "Blockchain Secured"
                  : "Plan your journey"}
              </Text>
            </View>
          </View>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Dates */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              Travel Dates
            </Text>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-xs text-slate-500 mb-1">Start Date</Text>
                <TextInput
                  value={itinerary.startDate}
                  onChangeText={(text) =>
                    setItinerary((prev) => ({ ...prev, startDate: text }))
                  }
                  placeholder="YYYY-MM-DD"
                  className="bg-slate-50 rounded-lg p-2 text-sm"
                  editable={!itinerary.anchored}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-slate-500 mb-1">End Date</Text>
                <TextInput
                  value={itinerary.endDate}
                  onChangeText={(text) =>
                    setItinerary((prev) => ({ ...prev, endDate: text }))
                  }
                  placeholder="YYYY-MM-DD"
                  className="bg-slate-50 rounded-lg p-2 text-sm"
                  editable={!itinerary.anchored}
                />
              </View>
            </View>
          </View>

          {/* Locations */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              Locations
            </Text>
            {!itinerary.anchored && (
              <View className="flex-row gap-2 mb-2">
                <TextInput
                  value={newLocation}
                  onChangeText={setNewLocation}
                  placeholder="Add location..."
                  className="flex-1 bg-slate-50 rounded-lg p-2 text-sm"
                />
                <TouchableOpacity
                  onPress={addLocation}
                  className="bg-purple-500 p-2 rounded-lg"
                >
                  <Plus color="white" size={16} />
                </TouchableOpacity>
              </View>
            )}
            {itinerary.locations.map((location, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between bg-purple-50 p-2 rounded-lg mb-1"
              >
                <View className="flex-row items-center flex-1">
                  <MapPin color="#8b5cf6" size={14} />
                  <Text className="ml-2 text-sm text-slate-700">
                    {location}
                  </Text>
                </View>
                {!itinerary.anchored && (
                  <TouchableOpacity onPress={() => removeLocation(index)}>
                    <Trash2 color="#ef4444" size={14} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Activities */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              Activities
            </Text>
            {!itinerary.anchored && (
              <View className="flex-row gap-2 mb-2">
                <TextInput
                  value={newActivity}
                  onChangeText={setNewActivity}
                  placeholder="Add activity..."
                  className="flex-1 bg-slate-50 rounded-lg p-2 text-sm"
                />
                <TouchableOpacity
                  onPress={addActivity}
                  className="bg-purple-500 p-2 rounded-lg"
                >
                  <Plus color="white" size={16} />
                </TouchableOpacity>
              </View>
            )}
            {itinerary.activities.map((activity, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between bg-purple-50 p-2 rounded-lg mb-1"
              >
                <Text className="flex-1 text-sm text-slate-700">
                  {activity}
                </Text>
                {!itinerary.anchored && (
                  <TouchableOpacity onPress={() => removeActivity(index)}>
                    <Trash2 color="#ef4444" size={14} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Accommodations */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              Accommodations
            </Text>
            {!itinerary.anchored && (
              <View className="flex-row gap-2 mb-2">
                <TextInput
                  value={newAccommodation}
                  onChangeText={setNewAccommodation}
                  placeholder="Add accommodation..."
                  className="flex-1 bg-slate-50 rounded-lg p-2 text-sm"
                />
                <TouchableOpacity
                  onPress={addAccommodation}
                  className="bg-purple-500 p-2 rounded-lg"
                >
                  <Plus color="white" size={16} />
                </TouchableOpacity>
              </View>
            )}
            {itinerary.accommodations.map((accommodation, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between bg-purple-50 p-2 rounded-lg mb-1"
              >
                <Text className="flex-1 text-sm text-slate-700">
                  {accommodation}
                </Text>
                {!itinerary.anchored && (
                  <TouchableOpacity onPress={() => removeAccommodation(index)}>
                    <Trash2 color="#ef4444" size={14} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Anchor Button */}
          {!itinerary.anchored && (
            <LinearGradient
              colors={
                isLoading ? ["#64748b", "#475569"] : ["#8b5cf6", "#7c3aed"]
              }
              style={{ borderRadius: 12, marginTop: 8 }}
            >
              <TouchableOpacity
                onPress={anchorItinerary}
                disabled={isLoading}
                className="p-3"
              >
                <Text className="text-white font-bold text-center">
                  {isLoading
                    ? "Anchoring to Blockchain..."
                    : "Anchor Itinerary on Blockchain"}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          )}

          {/* Anchored Status */}
          {itinerary.anchored && (
            <View className="bg-green-50 p-3 rounded-lg border border-green-200">
              <Text className="text-green-800 font-semibold text-center mb-1">
                ✅ Itinerary Secured on Blockchain
              </Text>
              {itinerary.id && (
                <Text className="text-green-600 text-xs text-center">
                  ID: {itinerary.id}
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </CardContent>
    </Card>
  );
};

export default ItineraryManager;
