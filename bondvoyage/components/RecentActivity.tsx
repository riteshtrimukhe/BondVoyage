import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle, CheckCircle, Clock, MapPin } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const RecentActivity = () => {
  return (
    <Card className="bg-white/90 rounded-3xl border-0 shadow-xl flex-1">
      <CardHeader>
        <CardTitle>
          <View className="flex-row items-center gap-3">
            <LinearGradient
              colors={["#8b5cf6", "#6366f1"]}
              style={{ padding: 12, borderRadius: 16 }}
            >
              <Clock color="white" size={20} />
            </LinearGradient>
            <View>
              <Text className="text-lg font-bold text-slate-800">
                Recent Activity
              </Text>
              <Text className="text-slate-500 text-xs">Live updates</Text>
            </View>
          </View>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <View className="flex-col gap-3">
          {/* Safe Zone */}
          <LinearGradient
            colors={["#ecfdf5", "#d1fae5"]}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderRadius: 16,
              borderLeftWidth: 4,
              borderLeftColor: "#34d399",
            }}
          >
            <View className="bg-emerald-100 p-2 rounded-full mr-3">
              <CheckCircle color="#10B981" size={18} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-800">
                Entered Safe Zone
              </Text>
              <Text className="text-sm text-slate-500">
                Downtown Tourist Area • 2:30 PM
              </Text>
            </View>
          </LinearGradient>

          {/* Location Update */}
          <LinearGradient
            colors={["#eff6ff", "#dbeafe"]}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderRadius: 16,
              borderLeftWidth: 4,
              borderLeftColor: "#60a5fa",
            }}
          >
            <View className="bg-blue-100 p-2 rounded-full mr-3">
              <MapPin color="#3B82F6" size={18} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-800">Location Update</Text>
              <Text className="text-sm text-slate-500">
                City Center • 1:45 PM
              </Text>
            </View>
          </LinearGradient>

          {/* Geo-fence Alert */}
          <LinearGradient
            colors={["#fffbeb", "#fef3c7"]}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderRadius: 16,
              borderLeftWidth: 4,
              borderLeftColor: "#fbbf24",
            }}
          >
            <View className="bg-amber-100 p-2 rounded-full mr-3">
              <AlertCircle color="#F59E0B" size={18} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-800">Geo-fence Alert</Text>
              <Text className="text-sm text-slate-500">
                Restricted area warning • 12:15 PM
              </Text>
            </View>
          </LinearGradient>
        </View>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
