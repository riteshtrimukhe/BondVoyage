import { useAuth } from "@/lib/auth";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { LogOut } from "lucide-react-native";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import DigitalCard from "./DigitalCard";
import MultiLanguage from "./MultiLanguage";

export default function CustomDrawerContent(props: any) {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const closeDrawer = () => {
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const navigateToSettings = () => {
    navigation.navigate("settings" as never);
    closeDrawer();
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? You will need to register again to access the dashboard.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            // Don't call closeDrawer here as logout changes navigation context
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 justify-between">
      {/* User Card */}
      <DigitalCard />

      {/* Bottom Actions */}
      <View className="pb-4">
        {/* Logout Button - Only show if user is registered */}
        {user && user.isRegistered && (
          <View className="px-4 mb-4">
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-50 border border-red-200 rounded-xl p-3"
            >
              <View className="flex-row items-center justify-center">
                <LogOut color="#dc2626" size={16} />
                <Text className="ml-2 text-red-600 font-semibold text-sm">
                  {user.isDemoUser ? "Exit Demo Mode" : "Logout"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <MultiLanguage />
      </View>
    </View>
  );
}
