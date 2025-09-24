import { useAuth } from "@/lib/auth";
import { LinearGradient } from "expo-linear-gradient";
import {
  CircleCheckBig,
  CreditCard,
  Globe,
  QrCode,
  ShieldCheck,
  UserX,
} from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const DigitalCard = () => {
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);

  // Generate QR code data based on user info
  const generateQRData = () => {
    if (!user) return "GUEST|NO_ID|NO_NATIONALITY";
    return `${user.touristId}|${user.name}|${user.isDemoUser ? "DEMO" : "VERIFIED"}`;
  };

  const generateValidUntil = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1); // Valid for 1 year
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // If no user, show guest card
  if (!user) {
    return (
      <Card className="rounded-none border-none shadow-none py-4">
        <CardHeader className="px-4">
          <CardTitle>
            <View className="flex-row items-center gap-3">
              <LinearGradient
                colors={["#64748b", "#475569"]}
                style={{ padding: 12, borderRadius: 16 }}
              >
                <UserX color="white" size={20} />
              </LinearGradient>
              <View>
                <Text className="text-lg font-bold text-slate-800">
                  Guest Access
                </Text>
                <Text className="text-slate-500 text-xs">
                  Please register for full features
                </Text>
              </View>
            </View>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-0">
          <LinearGradient
            colors={["#64748b", "#475569"]}
            style={{ padding: 24, borderRadius: 24 }}
          >
            <View className="items-center py-4">
              <Text className="text-white text-center text-sm">
                Complete registration to get your Digital Tourist ID
              </Text>
            </View>
          </LinearGradient>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-none border-none  shadow-none py-4">
        <CardHeader className="px-4">
          <CardTitle>
            <View className="flex-row items-center gap-3">
              <LinearGradient
                colors={["#6366f1", "#8b5cf6"]}
                style={{ padding: 12, borderRadius: 16 }}
              >
                <CreditCard color="white" size={20} />
              </LinearGradient>
              <View>
                <Text className="text-lg font-bold text-slate-800">
                  Digital Tourist ID
                </Text>
                <View className="text-slate-500 text-xs flex items-center gap-0.5 flex-row">
                  <ShieldCheck size={16} />
                  <Text>
                    {user.isDemoUser ? "Demo Mode" : "Blockchain secured"}
                  </Text>
                </View>
              </View>
            </View>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-0">
          <LinearGradient
            colors={["#4f46e5", "#7c3aed", "#2563eb"]}
            style={{ padding: 24, borderRadius: 24 }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <LinearGradient
                  colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.3)"]}
                  style={{ padding: 12, borderRadius: 16, marginRight: 12 }}
                >
                  <Globe color="white" size={24} />
                </LinearGradient>

                <View className="flex-col">
                  <Text className="font-bold text-center text-white text-base">
                    Tourist ID
                  </Text>

                  <LinearGradient
                    colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.3)"]}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 9999,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                    className="flex justify-center items-center"
                  >
                    <View className="flex items-center gap-1 flex-row">
                      <CircleCheckBig size={16} color="white" />
                      <Text className="text-white text-xs font-bold">
                        {user.isDemoUser ? "DEMO" : "VERIFIED"}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>
            </View>

            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.2)"]}
              style={{
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <View className="flex-col gap-3">
                <View>
                  <Text className="text-xs text-white/70">Tourist Name</Text>
                  <Text
                    className="font-bold text-white"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {user.name}
                  </Text>
                </View>

                <View className="min-w-[120px]">
                  <Text className="text-xs text-white/70">Status</Text>
                  <Text
                    className="font-bold text-white"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {user.isDemoUser ? "Demo User" : "Active Tourist"}
                  </Text>
                </View>

                <View className="min-w-[120px]">
                  <Text className="text-xs text-white/70">Valid Until</Text>
                  <Text
                    className="font-bold text-white"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {generateValidUntil()}
                  </Text>
                </View>

                <View className="min-w-[120px]">
                  <Text className="text-xs text-white/70">ID Number</Text>
                  <Text
                    className="font-bold text-white"
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {user.touristId}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.2)"]}
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowQR(true)}
                style={{
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: "transparent",
                  alignItems: "center",
                }}
              >
                <View className="flex items-center gap-1 flex-row">
                  <QrCode size={16} color="white" />
                  <Text className="text-sm font-bold text-white">
                    Show QR Code
                  </Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </LinearGradient>
        </CardContent>
      </Card>

      <Modal
        visible={showQR}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQR(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 20,
              alignItems: "center",
            }}
          >
            <QRCode value={generateQRData()} size={200} />

            <TouchableOpacity
              onPress={() => setShowQR(false)}
              style={{
                marginTop: 24,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: "#4f46e5",
              }}
            >
              <Text className="text-white font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DigitalCard;
