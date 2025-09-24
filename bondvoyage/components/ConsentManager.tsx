import { apiService, ConsentData } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, MapPin, Settings, Shield, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Switch, Text, TouchableOpacity, View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ConsentSettings {
  locationSharing: boolean;
  dataAccess: boolean;
  emergencyContacts: boolean;
  analyticsOptIn: boolean;
}

const ConsentManager = () => {
  const [touristId, setTouristId] = useState<string | null>(null);
  const [consents, setConsents] = useState<ConsentSettings>({
    locationSharing: false,
    dataAccess: false,
    emergencyContacts: false,
    analyticsOptIn: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTouristData();
    loadStoredConsents();
  }, []);

  const loadTouristData = async () => {
    try {
      const storedTouristId = await AsyncStorage.getItem("authToken");
      setTouristId(storedTouristId);
    } catch (error) {
      console.error("Error loading tourist data:", error);
    }
  };

  const loadStoredConsents = async () => {
    try {
      const storedConsents = await AsyncStorage.getItem("userConsents");
      if (storedConsents) {
        setConsents(JSON.parse(storedConsents));
      }
    } catch (error) {
      console.error("Error loading stored consents:", error);
    }
  };

  const saveConsentsLocally = async (newConsents: ConsentSettings) => {
    try {
      await AsyncStorage.setItem("userConsents", JSON.stringify(newConsents));
    } catch (error) {
      console.error("Error saving consents locally:", error);
    }
  };

  const updateConsent = async (
    consentType: keyof ConsentSettings,
    granted: boolean
  ) => {
    if (!touristId) {
      Alert.alert(
        "Error",
        "Tourist registration not found. Please register first."
      );
      return;
    }

    setIsLoading(true);
    try {
      // Map frontend consent types to backend consent types
      const backendConsentMap: { [key: string]: string } = {
        locationSharing: "location_sharing",
        dataAccess: "data_access",
        emergencyContacts: "emergency_contacts",
        analyticsOptIn: "analytics_opt_in",
      };

      const backendConsentType = backendConsentMap[consentType];
      if (!backendConsentType) {
        throw new Error("Invalid consent type");
      }

      // Update backend
      const consentData: ConsentData = {
        consentType: backendConsentType,
        granted,
      };

      const response = await apiService.updateConsent(touristId, consentData);

      if (response.success) {
        // Update local state
        const newConsents = { ...consents, [consentType]: granted };
        setConsents(newConsents);
        await saveConsentsLocally(newConsents);

        // Show confirmation for important consents
        if (consentType === "locationSharing" && granted) {
          Alert.alert(
            "Location Sharing Enabled",
            "Your location will be shared for safety features and emergency response."
          );
        } else if (consentType === "locationSharing" && !granted) {
          Alert.alert(
            "Location Sharing Disabled",
            "Some safety features may be limited without location access."
          );
        }
      } else {
        Alert.alert("Error", response.error || "Failed to update consent");
        // Revert the change if backend update failed
      }
    } catch (error) {
      console.error("Error updating consent:", error);
      Alert.alert("Error", "Failed to update consent. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllConsents = () => {
    Alert.alert(
      "Reset All Consents",
      "This will revoke all permissions and consents. You can re-enable them individually later.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset All",
          style: "destructive",
          onPress: async () => {
            const resetConsents = {
              locationSharing: false,
              dataAccess: false,
              emergencyContacts: false,
              analyticsOptIn: false,
            };

            // Update each consent with backend
            for (const [key, value] of Object.entries(resetConsents)) {
              await updateConsent(key as keyof ConsentSettings, value);
            }
          },
        },
      ]
    );
  };

  if (!touristId) {
    return (
      <Card className="bg-white/90 rounded-3xl border-0 shadow-xl">
        <CardContent className="pt-6">
          <View className="items-center py-4">
            <Shield color="#64748b" size={48} />
            <Text className="text-lg font-bold text-slate-800 mt-2 mb-1">
              Privacy & Consent
            </Text>
            <Text className="text-sm text-slate-500 text-center">
              Please complete registration to manage your privacy settings
            </Text>
          </View>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 rounded-3xl border-0 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle>
          <View className="flex-row items-center gap-3">
            <LinearGradient
              colors={["#059669", "#10b981"]}
              style={{ padding: 12, borderRadius: 16 }}
            >
              <Shield color="white" size={20} />
            </LinearGradient>
            <View>
              <Text className="text-lg font-bold text-slate-800">
                Privacy & Consent
              </Text>
              <Text className="text-slate-500 text-xs">
                Manage your data permissions
              </Text>
            </View>
          </View>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <View className="space-y-4">
          {/* Location Sharing */}
          <View className="flex-row items-center justify-between p-3 bg-blue-50 rounded-xl">
            <View className="flex-row items-center flex-1">
              <MapPin color="#3b82f6" size={20} />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-slate-800">
                  Location Sharing
                </Text>
                <Text className="text-xs text-slate-500">
                  Share location for safety and emergency features
                </Text>
              </View>
            </View>
            <Switch
              value={consents.locationSharing}
              onValueChange={(value) => updateConsent("locationSharing", value)}
              disabled={isLoading}
              trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
              thumbColor={consents.locationSharing ? "#ffffff" : "#9ca3af"}
            />
          </View>

          {/* Data Access */}
          <View className="flex-row items-center justify-between p-3 bg-purple-50 rounded-xl">
            <View className="flex-row items-center flex-1">
              <Eye color="#8b5cf6" size={20} />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-slate-800">
                  Data Access
                </Text>
                <Text className="text-xs text-slate-500">
                  Allow access to travel data for enhanced services
                </Text>
              </View>
            </View>
            <Switch
              value={consents.dataAccess}
              onValueChange={(value) => updateConsent("dataAccess", value)}
              disabled={isLoading}
              trackColor={{ false: "#d1d5db", true: "#8b5cf6" }}
              thumbColor={consents.dataAccess ? "#ffffff" : "#9ca3af"}
            />
          </View>

          {/* Emergency Contacts */}
          <View className="flex-row items-center justify-between p-3 bg-red-50 rounded-xl">
            <View className="flex-row items-center flex-1">
              <Users color="#ef4444" size={20} />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-slate-800">
                  Emergency Contacts
                </Text>
                <Text className="text-xs text-slate-500">
                  Allow emergency contact notifications
                </Text>
              </View>
            </View>
            <Switch
              value={consents.emergencyContacts}
              onValueChange={(value) =>
                updateConsent("emergencyContacts", value)
              }
              disabled={isLoading}
              trackColor={{ false: "#d1d5db", true: "#ef4444" }}
              thumbColor={consents.emergencyContacts ? "#ffffff" : "#9ca3af"}
            />
          </View>

          {/* Analytics Opt-in */}
          <View className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl">
            <View className="flex-row items-center flex-1">
              <Settings color="#64748b" size={20} />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-slate-800">
                  Analytics & Insights
                </Text>
                <Text className="text-xs text-slate-500">
                  Help improve services with anonymous usage data
                </Text>
              </View>
            </View>
            <Switch
              value={consents.analyticsOptIn}
              onValueChange={(value) => updateConsent("analyticsOptIn", value)}
              disabled={isLoading}
              trackColor={{ false: "#d1d5db", true: "#64748b" }}
              thumbColor={consents.analyticsOptIn ? "#ffffff" : "#9ca3af"}
            />
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            onPress={resetAllConsents}
            disabled={isLoading}
            className="mt-4 p-3 bg-slate-100 rounded-xl"
          >
            <Text className="text-slate-600 text-center text-sm font-medium">
              Reset All Consents
            </Text>
          </TouchableOpacity>

          {/* Privacy Notice */}
          <View className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <Text className="text-blue-800 text-xs text-center">
              🛡️ Your privacy is protected by blockchain encryption. You can
              modify these settings anytime.
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
};

export default ConsentManager;
