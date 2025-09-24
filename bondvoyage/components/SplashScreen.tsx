import React from "react";
import { Image, Text, View } from "react-native";

const CustomSplashScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={require("../assets/images/bondvoyage1024.png")}
        style={{ width: 120, height: 120, marginBottom: 20 }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontFamily: "PlayfairDisplay_700Bold",
          fontSize: 32,
          color: "#13472e",
        }}
      >
        BondVoyage
      </Text>
    </View>
  );
};

export default CustomSplashScreen;
