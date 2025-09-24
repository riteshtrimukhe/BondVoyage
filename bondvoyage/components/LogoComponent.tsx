import React from "react";
import { Image, Text, View } from "react-native";

const LogoComponent = () => {
  return (
    <View className="flex flex-row items-center justify-center">
      <Image
        source={require("../assets/images/bondvoyage1024.png")}
        className="w-12 h-12"
        resizeMode="contain"
      />
      <Text
        className="text-3xl text-[#13472e] -ml-1"
        style={{ fontFamily: "PlayfairDisplay_700Bold" }}
      >
        BondVoyage
      </Text>
    </View>
  );
};

export default LogoComponent;
