import { Languages } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const MultiLanguage = () => {
  return (
    <View className="py-2 px-4 border-t border-gray-200">
      <TouchableOpacity className="flex-row items-center justify-start py-3 px-4 rounded-lg gap-2">
        <Languages size={20} />
        <Text className="font-medium">App Language</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MultiLanguage;
