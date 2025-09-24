import Navbar from "@/components/Navbar";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";

interface DrawerLayoutProps {
  children: React.ReactNode;
}

export default function DrawerLayout({ children }: DrawerLayoutProps) {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View className="flex-1">
      <Navbar onMenuPress={openDrawer} />
      <View className="flex-1">{children}</View>
    </View>
  );
}
