import DrawerLayout from "@/components/DrawerLayout";
import { useAuth } from "@/lib/auth";
import TouristDashboard from "@/screens/TouristDashboard";
import TouristRegistration from "@/screens/TouristRegistration";
import { LinearGradient } from "expo-linear-gradient";
import { Play } from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const { user, isLoading, loginDemoUser } = useAuth();

  const handleDemoLogin = () => {
    Alert.alert(
      "Demo Mode",
      "This will create a demo user account with sample data for testing all features without a backend connection.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue with Demo",
          onPress: async () => {
            await loginDemoUser();
            Alert.alert(
              "Demo User Created!",
              "You can now explore all features with sample data. Demo features include:\n\n• Sample location data\n• Mock emergency alerts\n• Pre-filled consent settings\n• Example itinerary data",
              [{ text: "Get Started" }]
            );
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <DrawerLayout>
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="text-slate-600 mt-4">Loading...</Text>
        </View>
      </DrawerLayout>
    );
  }

  // If user is registered, show dashboard
  if (user && user.isRegistered) {
    return (
      <DrawerLayout>
        <View className="flex-1 bg-background">
          <TouristDashboard />
        </View>
      </DrawerLayout>
    );
  }

  // If user is not registered, show registration with demo option
  return (
    <DrawerLayout>
      <View className="flex-1 bg-background">
        {/* Demo User Option Banner */}
        <View className="px-4 pt-4">
          <LinearGradient
            colors={["#dbeafe", "#bfdbfe"]} // light → softer blue gradient
            style={{ borderRadius: 16, padding: 16, marginBottom: 16 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-blue-500 p-2 rounded-full mr-3">
                  <Play color="white" size={16} />
                </View>
                <View className="flex-1">
                  <Text className="text-blue-800 font-bold text-sm">
                    Try Demo Mode
                  </Text>
                  <Text className="text-blue-700 text-xs mt-1">
                    Test all features without {"\n"}
                    backend setup
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleDemoLogin}
                className="bg-blue-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold text-xs">Demo</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Registration Form */}
        <TouristRegistration />
      </View>
    </DrawerLayout>
  );
}
