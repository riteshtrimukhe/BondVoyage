import { LocationData, locationService } from "@/lib/location";
import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle, CheckCircle, MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const CurrentLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState<string>("Getting location...");
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSafeZone, setIsSafeZone] = useState(true);

  useEffect(() => {
    initializeLocation();

    // Start location tracking
    const startTracking = async () => {
      const success = await locationService.startLocationTracking();
      if (success) {
        // Add listener for location updates
        const unsubscribe =
          locationService.addLocationListener(handleLocationUpdate);
        return unsubscribe;
      }
    };

    const trackingPromise = startTracking();

    return () => {
      // Cleanup
      trackingPromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  const initializeLocation = async () => {
    try {
      // Check permissions first
      const permissionStatus = await locationService.checkLocationPermission();
      setHasPermission(permissionStatus.granted);

      if (permissionStatus.granted) {
        // Get current location
        const currentLocation = await locationService.getCurrentLocation();
        if (currentLocation) {
          setLocation(currentLocation);
          setIsSafeZone(locationService.isInSafeZone(currentLocation));

          // Get address
          const locationAddress =
            await locationService.getAddressFromCoordinates(
              currentLocation.latitude,
              currentLocation.longitude
            );
          setAddress(locationAddress);
        } else {
          setAddress("Unable to get location");
        }
      } else {
        setAddress("Location permission required");
      }
    } catch (error) {
      console.error("Error initializing location:", error);
      setAddress("Location error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationUpdate = async (newLocation: LocationData) => {
    setLocation(newLocation);
    setIsSafeZone(locationService.isInSafeZone(newLocation));

    try {
      const locationAddress = await locationService.getAddressFromCoordinates(
        newLocation.latitude,
        newLocation.longitude
      );
      setAddress(locationAddress);
    } catch (error) {
      console.error("Error updating address:", error);
    }
  };

  const requestLocationPermission = async () => {
    setIsLoading(true);
    const permission = await locationService.requestLocationPermission();
    if (permission.granted) {
      setHasPermission(true);
      await initializeLocation();
    }
    setIsLoading(false);
  };

  const refreshLocation = async () => {
    if (!hasPermission) {
      await requestLocationPermission();
      return;
    }

    setIsLoading(true);
    try {
      const currentLocation = await locationService.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        setIsSafeZone(locationService.isInSafeZone(currentLocation));

        const locationAddress = await locationService.getAddressFromCoordinates(
          currentLocation.latitude,
          currentLocation.longitude
        );
        setAddress(locationAddress);
      }
    } catch (error) {
      console.error("Error refreshing location:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card className="bg-white/90 rounded-3xl border-0 shadow-xl flex-1">
      <CardHeader className="pb-2">
        <CardTitle>
          <View className="flex-row items-center gap-3">
            <LinearGradient
              colors={["#3b82f6", "#1e40af"]}
              style={{ padding: 12, borderRadius: 16 }}
            >
              <MapPin color="white" size={20} />
            </LinearGradient>
            <View>
              <Text className="text-lg font-bold text-slate-800">
                Current Location
              </Text>
              <Text className="text-slate-500 text-xs">GPS tracking</Text>
            </View>
          </View>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TouchableOpacity onPress={refreshLocation} disabled={isLoading}>
          <View className="items-center py-4">
            {!hasPermission ? (
              <View className="items-center">
                <Text className="text-lg font-bold text-slate-800 mb-1">
                  Location Access Required
                </Text>
                <Text className="text-sm text-slate-500 mb-4 text-center">
                  Tap to enable location services for safety features
                </Text>
                <LinearGradient
                  colors={["#3b82f6", "#1e40af"]}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 9999,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MapPin color="white" size={14} />
                  <Text className="text-white ml-2 text-xs font-bold">
                    Enable Location
                  </Text>
                </LinearGradient>
              </View>
            ) : isLoading ? (
              <View className="items-center">
                <Text className="text-lg font-bold text-slate-800 mb-1">
                  Getting Location...
                </Text>
                <Text className="text-sm text-slate-500 mb-4">
                  Please wait while we fetch your location
                </Text>
              </View>
            ) : location ? (
              <View className="items-center">
                <Text className="text-lg font-bold text-slate-800 mb-1 text-center">
                  {address}
                </Text>
                <Text className="text-xs text-slate-400 mb-4">
                  {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                  {location.accuracy && ` (±${Math.round(location.accuracy)}m)`}
                </Text>
                <LinearGradient
                  colors={
                    isSafeZone ? ["#10b981", "#059669"] : ["#ef4444", "#dc2626"]
                  }
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 9999,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {isSafeZone ? (
                    <CheckCircle color="white" size={14} />
                  ) : (
                    <AlertCircle color="white" size={14} />
                  )}
                  <Text className="text-white ml-2 text-xs font-bold">
                    {isSafeZone ? "Safe Area" : "Caution Area"}
                  </Text>
                </LinearGradient>
                <Text className="text-xs text-slate-400 mt-2">
                  Tap to refresh location
                </Text>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-lg font-bold text-slate-800 mb-1">
                  Location Unavailable
                </Text>
                <Text className="text-sm text-slate-500 mb-4 text-center">
                  Unable to get your current location
                </Text>
                <LinearGradient
                  colors={["#64748b", "#475569"]}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 9999,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <AlertCircle color="white" size={14} />
                  <Text className="text-white ml-2 text-xs font-bold">
                    Tap to Retry
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </CardContent>
    </Card>
  );
};

export default CurrentLocation;
