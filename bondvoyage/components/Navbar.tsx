import { Menu } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import LogoComponent from "./LogoComponent";

interface NavbarProps {
  onMenuPress?: () => void;
}

const Navbar = ({ onMenuPress }: NavbarProps) => {
  return (
    <View className="flex flex-row py-1 pb-2 px-4 bg-white justify-between items-center border-b border-gray-400/50">
      <LogoComponent />
      <TouchableOpacity onPress={onMenuPress} className="p-2">
        <Menu size={26} color="#13472e" />
      </TouchableOpacity>
    </View>
  );
};

export default Navbar;
