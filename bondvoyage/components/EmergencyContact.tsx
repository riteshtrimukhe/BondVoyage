import { LinearGradient } from "expo-linear-gradient";
import { Phone } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const EmergencyContact = () => {
  return (
    <Card className="bg-white/90 rounded-3xl border-0 shadow-xl flex-1 mb-6">
      <CardHeader>
        <CardTitle>
          <View className="flex-row items-center gap-3">
            <LinearGradient
              colors={["#f43f5e", "#dc2626"]}
              style={{ padding: 12, borderRadius: 16 }}
            >
              <Phone color="white" size={20} />
            </LinearGradient>
            <View>
              <Text className="text-lg font-bold text-slate-800">
                Emergency Contacts
              </Text>
              <Text className="text-slate-500 text-xs">Quick access</Text>
            </View>
          </View>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <View className="flex-col gap-3">
          <LinearGradient
            colors={["#f8fafc", "#f1f5f9"]}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#e2e8f0",
            }}
          >
            <View className="flex-1">
              <Text className="font-bold text-slate-800">
                Emergency Services
              </Text>
              <Text className="text-sm text-slate-500">+1 911</Text>
            </View>
            <LinearGradient
              colors={["#f43f5e", "#dc2626"]}
              style={{
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 16,
              }}
            >
              <TouchableOpacity className="bg-transparent">
                <Phone color="white" size={16} />
              </TouchableOpacity>
            </LinearGradient>
          </LinearGradient>

          <LinearGradient
            colors={["#f8fafc", "#f1f5f9"]}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#e2e8f0",
            }}
          >
            <View className="flex-1">
              <Text className="font-bold text-slate-800">Family Contact</Text>
              <Text className="text-sm text-slate-500">+1 234 567 8901</Text>
            </View>
            <LinearGradient
              colors={["#3b82f6", "#1e40af"]}
              style={{
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 16,
              }}
            >
              <TouchableOpacity className="bg-transparent">
                <Phone color="white" size={16} />
              </TouchableOpacity>
            </LinearGradient>
          </LinearGradient>

          <LinearGradient
            colors={["#f8fafc", "#f1f5f9"]}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#e2e8f0",
            }}
          >
            <View className="flex-1">
              <Text className="font-bold text-slate-800">Hotel Concierge</Text>
              <Text className="text-sm text-slate-500">+1 234 567 8902</Text>
            </View>
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={{
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 16,
              }}
            >
              <TouchableOpacity className="bg-transparent">
                <Phone color="white" size={16} />
              </TouchableOpacity>
            </LinearGradient>
          </LinearGradient>
        </View>
      </CardContent>
    </Card>
  );
};

export default EmergencyContact;
