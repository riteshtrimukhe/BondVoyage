import { LinearGradient } from "expo-linear-gradient";
import { Shield } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const SafetyScore = () => {
  return (
    <Card className="bg-white/90 rounded-3xl border-0 shadow-xl flex-1">
      <CardHeader className="pb-2">
        <CardTitle>
          <View className="flex-row items-center gap-3">
            <LinearGradient
              colors={["#3b82f6", "#1e40af"]}
              style={{ padding: 12, borderRadius: 16 }}
            >
              <Shield color="white" size={20} />
            </LinearGradient>
            <View>
              <Text className="text-lg font-bold text-slate-800">
                Safety Score
              </Text>
              <Text className="text-slate-500 text-xs">Real-time analysis</Text>
            </View>
          </View>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <View className="items-center py-4">
          <View className="items-center mb-2 justify-center">
            <LinearGradient
              colors={["#34d399", "#10b981"]}
              style={{
                width: 96,
                height: 96,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={80} color="white" strokeWidth={2} />
            </LinearGradient>

            <Text
              style={{
                position: "absolute",
                fontSize: 28,
                fontWeight: "900",
                color: "white",
              }}
            >
              85
            </Text>
          </View>
          <Text className="text-sm text-slate-500 mb-3">out of 100</Text>
          <LinearGradient
            colors={["#10b981", "#059669"]}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 9999,
            }}
          >
            <Text className="text-white text-xs font-bold">
              Excellent Safety Rating
            </Text>
          </LinearGradient>
        </View>
      </CardContent>
    </Card>
  );
};

export default SafetyScore;
