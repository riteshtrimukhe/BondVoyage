import {
  apiService,
  generateTouristId,
  TouristRegistrationData,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Camera, Shield, Upload, User } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const TouristRegistration = () => {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Refs for input navigation
  const nameRef = useRef<TextInput>(null);
  const nationalityRef = useRef<TextInput>(null);
  const passportRef = useRef<TextInput>(null);

  // Form data - only backend required fields
  const [formData, setFormData] = useState({
    name: "",
    nationality: "",
    passportNumber: "",
  });

  // KYC Documents
  const [kycDocuments, setKycDocuments] = useState({
    passport: null as string | null,
    visa: null as string | null,
    photo: null as string | null,
  });

  const [documentStatus, setDocumentStatus] = useState({
    passport: false,
    visa: false,
    photo: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Convert file to base64
  const convertToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
      return base64;
    } catch (error) {
      console.error("Error converting to base64:", error);
      throw error;
    }
  };

  // Handle document picking
  const pickDocument = async (docType: "passport" | "visa") => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64 = await convertToBase64(result.assets[0].uri);
        setKycDocuments((prev) => ({ ...prev, [docType]: base64 }));
        setDocumentStatus((prev) => ({ ...prev, [docType]: true }));
        Alert.alert(
          "Success",
          `${docType.charAt(0).toUpperCase() + docType.slice(1)} document uploaded successfully`
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  // Handle photo capture
  const capturePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Camera permission is required");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const base64 = await convertToBase64(result.assets[0].uri);
        setKycDocuments((prev) => ({ ...prev, photo: base64 }));
        setDocumentStatus((prev) => ({ ...prev, photo: true }));
        Alert.alert("Success", "Photo captured successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture photo");
    }
  };

  // Form validation - only required backend fields
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Basic validation - only required backend fields
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.nationality.trim())
      newErrors.nationality = "Nationality is required";
    if (!formData.passportNumber.trim())
      newErrors.passportNumber = "Passport number is required";

    // KYC documents validation
    if (!kycDocuments.passport)
      newErrors.passport = "Passport document is required";
    if (!kycDocuments.visa) newErrors.visa = "Visa document is required";
    if (!kycDocuments.photo) newErrors.photo = "Photo is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegistration = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields and upload all documents"
      );
      return;
    }

    setIsLoading(true);

    try {
      // Generate unique tourist ID
      const touristId = generateTouristId();

      // Prepare registration data according to backend API
      const registrationData: TouristRegistrationData = {
        touristId,
        name: formData.name,
        nationality: formData.nationality,
        passportNumber: formData.passportNumber,
        kycDocuments: {
          passport: kycDocuments.passport!,
          visa: kycDocuments.visa!,
          photo: kycDocuments.photo!,
        },
      };

      // Call backend API
      const response = await apiService.registerTourist(registrationData);

      if (response.success && response.data) {
        // Store tourist ID and name locally for future use
        await apiService.setAuthToken(response.data.touristId);
        await AsyncStorage.setItem("touristName", formData.name);

        // Update auth context
        setUser({
          touristId: response.data.touristId,
          name: formData.name,
          isRegistered: true,
          isDemoUser: false,
        });

        Alert.alert(
          "Registration Successful!",
          `Tourist ID: ${response.data.touristId}\\nYour registration has been recorded on the blockchain.`,
          [
            {
              text: "Continue to Dashboard",
              onPress: () => router.push("/"),
            },
          ]
        );
      } else {
        Alert.alert("Registration Failed", response.error || "Unknown error");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-12">
          {/* Header */}
          <View className="items-center mb-8">
            <LinearGradient
              colors={["#4f46e5", "#7c3aed"]}
              style={{ padding: 16, borderRadius: 24, marginBottom: 16 }}
            >
              <User color="white" size={32} />
            </LinearGradient>
            <Text className="text-2xl font-bold text-slate-800 mb-2">
              Tourist Registration
            </Text>
            <Text className="text-slate-600 text-center text-sm px-4">
              Complete KYC verification to access blockchain-secured travel
              services
            </Text>
          </View>

          {/* Personal Information Section */}
          <LinearGradient
            colors={["#f0fdf4", "#dcfce7"]}
            style={{
              borderRadius: 12,
              padding: 24,
              marginBottom: 16,
              marginTop: 24,
              borderColor: "#22c55e",
            }}
            className="border"
          >
            <View className="flex-row items-center mb-4">
              <LinearGradient
                colors={["#22c55e", "#16a34a"]}
                style={{ padding: 6, borderRadius: 8, marginRight: 8 }}
              >
                <User color="white" size={16} />
              </LinearGradient>
              <Text className="text-base font-bold text-slate-800">
                Personal Information
              </Text>
            </View>

            {/* Full Name */}
            <View className="mb-3">
              <Text className="text-xs font-semibold text-slate-600 mb-1">
                Full Name *
              </Text>
              <View className="bg-white rounded-xl border border-slate-200 px-3 py-2">
                <TextInput
                  ref={nameRef}
                  placeholder="John Doe"
                  value={formData.name}
                  returnKeyType="next"
                  className="text-sm text-slate-800"
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  onSubmitEditing={() => nationalityRef.current?.focus()}
                />
              </View>
              {errors.name && (
                <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>
              )}
            </View>

            {/* Nationality */}
            <View className="mb-3">
              <Text className="text-xs font-semibold text-slate-600 mb-1">
                Nationality *
              </Text>
              <View className="bg-white rounded-xl border border-slate-200 px-3 py-2">
                <TextInput
                  ref={nationalityRef}
                  placeholder="United States"
                  value={formData.nationality}
                  returnKeyType="next"
                  className="text-sm text-slate-800"
                  onChangeText={(text) =>
                    setFormData({ ...formData, nationality: text })
                  }
                  onSubmitEditing={() => passportRef.current?.focus()}
                />
              </View>
              {errors.nationality && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.nationality}
                </Text>
              )}
            </View>

            {/* Passport Number */}
            <View className="mb-3">
              <Text className="text-xs font-semibold text-slate-600 mb-1">
                Passport Number *
              </Text>
              <View className="bg-white rounded-xl border border-slate-200 px-3 py-2">
                <TextInput
                  ref={passportRef}
                  placeholder="A12345678"
                  value={formData.passportNumber}
                  returnKeyType="done"
                  className="text-sm text-slate-800"
                  onChangeText={(text) =>
                    setFormData({ ...formData, passportNumber: text })
                  }
                />
              </View>
              {errors.passportNumber && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.passportNumber}
                </Text>
              )}
            </View>
          </LinearGradient>

          {/* KYC Documents Section */}
          <LinearGradient
            colors={["#fef3c7", "#fde68a"]}
            style={{
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              marginTop: 24,
              borderColor: "#f59e0b",
            }}
            className="border"
          >
            <View className="flex-row items-center mb-4">
              <LinearGradient
                colors={["#f59e0b", "#d97706"]}
                style={{ padding: 6, borderRadius: 8, marginRight: 8 }}
              >
                <Shield color="white" size={16} />
              </LinearGradient>
              <Text className="text-base font-bold text-slate-800">
                KYC Documents (Required)
              </Text>
            </View>

            {/* Passport Document */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-slate-600 mb-2">
                Passport Document *
              </Text>
              <TouchableOpacity
                onPress={() => pickDocument("passport")}
                className={`bg-white rounded-xl border-2 ${
                  documentStatus.passport
                    ? "border-green-500"
                    : "border-slate-200"
                } p-4`}
              >
                <View className="flex-row items-center justify-center">
                  <Upload
                    color={documentStatus.passport ? "#10b981" : "#64748b"}
                    size={20}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      documentStatus.passport
                        ? "text-green-600"
                        : "text-slate-600"
                    }`}
                  >
                    {documentStatus.passport
                      ? "✓ Passport Uploaded"
                      : "Upload Passport"}
                  </Text>
                </View>
              </TouchableOpacity>
              {errors.passport && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.passport}
                </Text>
              )}
            </View>

            {/* Visa Document */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-slate-600 mb-2">
                Visa Document *
              </Text>
              <TouchableOpacity
                onPress={() => pickDocument("visa")}
                className={`bg-white rounded-xl border-2 ${
                  documentStatus.visa ? "border-green-500" : "border-slate-200"
                } p-4`}
              >
                <View className="flex-row items-center justify-center">
                  <Upload
                    color={documentStatus.visa ? "#10b981" : "#64748b"}
                    size={20}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      documentStatus.visa ? "text-green-600" : "text-slate-600"
                    }`}
                  >
                    {documentStatus.visa ? "✓ Visa Uploaded" : "Upload Visa"}
                  </Text>
                </View>
              </TouchableOpacity>
              {errors.visa && (
                <Text className="text-red-500 text-xs mt-1">{errors.visa}</Text>
              )}
            </View>

            {/* Identity Photo */}
            <View className="mb-2">
              <Text className="text-xs font-semibold text-slate-600 mb-2">
                Identity Photo *
              </Text>
              <TouchableOpacity
                onPress={capturePhoto}
                className={`bg-white rounded-xl border-2 ${
                  documentStatus.photo ? "border-green-500" : "border-slate-200"
                } p-4`}
              >
                <View className="flex-row items-center justify-center">
                  <Camera
                    color={documentStatus.photo ? "#10b981" : "#64748b"}
                    size={20}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      documentStatus.photo ? "text-green-600" : "text-slate-600"
                    }`}
                  >
                    {documentStatus.photo
                      ? "✓ Photo Captured"
                      : "Capture Photo"}
                  </Text>
                </View>
              </TouchableOpacity>
              {errors.photo && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.photo}
                </Text>
              )}
            </View>
          </LinearGradient>

          {/* Submit Button */}
          <LinearGradient
            colors={isLoading ? ["#64748b", "#475569"] : ["#4f46e5", "#7c3aed"]}
            style={{ borderRadius: 16, marginBottom: 20, marginTop: 24 }}
          >
            <TouchableOpacity
              onPress={handleRegistration}
              disabled={isLoading}
              className="py-4 px-6"
            >
              <Text className="text-white font-bold text-center text-base">
                {isLoading ? "Registering..." : "Complete Registration"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default TouristRegistration;
