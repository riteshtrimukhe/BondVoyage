import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Alert, Platform } from "react-native";

// Demo locations for testing
const DEMO_LOCATIONS = [
  {
    latitude: 26.9124,
    longitude: 75.7873,
    address: "Jaipur City Palace, Rajasthan, India",
    isSafe: true,
  },
  {
    latitude: 24.5854,
    longitude: 73.7125,
    address: "Lake Palace, Udaipur, Rajasthan, India",
    isSafe: true,
  },
  {
    latitude: 27.1767,
    longitude: 78.0081,
    address: "Taj Mahal, Agra, Uttar Pradesh, India",
    isSafe: true,
  },
  {
    latitude: 28.6139,
    longitude: 77.209,
    address: "Red Fort, Delhi, India",
    isSafe: false, // Example of non-safe zone
  },
];

// Check if in demo mode
const isDemoMode = async (): Promise<boolean> => {
  try {
    const demoStatus = await AsyncStorage.getItem("isDemoUser");
    return demoStatus === "true";
  } catch {
    return false;
  }
};

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

class LocationService {
  private currentLocation: LocationData | null = null;
  private watchSubscription: Location.LocationSubscription | null = null;
  private locationListeners: ((location: LocationData) => void)[] = [];
  private demoLocationIndex = 0;
  private demoLocationInterval: any = null;

  // Request location permissions
  async requestLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "This app needs access to your location for safety features like emergency alerts and location tracking.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Location.requestForegroundPermissionsAsync();
                }
              },
            },
          ]
        );
        return { granted: false, canAskAgain: status === "undetermined" };
      }

      // Also request background location if needed for emergency features
      const backgroundStatus =
        await Location.requestBackgroundPermissionsAsync();

      return { granted: true, canAskAgain: true };
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return { granted: false, canAskAgain: false };
    }
  }

  // Check current permission status
  async checkLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return {
        granted: status === "granted",
        canAskAgain: status === "undetermined",
      };
    } catch (error) {
      console.error("Error checking location permission:", error);
      return { granted: false, canAskAgain: false };
    }
  }

  // Get current location (one-time)
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      // Check if in demo mode
      if (await isDemoMode()) {
        return this.getDemoLocation();
      }

      const permission = await this.checkLocationPermission();
      if (!permission.granted) {
        const newPermission = await this.requestLocationPermission();
        if (!newPermission.granted) {
          return null;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        altitude: location.coords.altitude ?? undefined,
        speed: location.coords.speed ?? undefined,
        timestamp: location.timestamp,
      };

      this.currentLocation = locationData;
      return locationData;
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  }

  // Get demo location for testing
  private getDemoLocation(): LocationData {
    const demoLoc = DEMO_LOCATIONS[this.demoLocationIndex];
    return {
      latitude: demoLoc.latitude,
      longitude: demoLoc.longitude,
      accuracy: 10,
      timestamp: Date.now(),
    };
  }

  // Start demo location cycling
  private startDemoLocationCycling(): void {
    if (this.demoLocationInterval) {
      clearInterval(this.demoLocationInterval);
    }

    this.demoLocationInterval = setInterval(() => {
      this.demoLocationIndex =
        (this.demoLocationIndex + 1) % DEMO_LOCATIONS.length;
      const newLocation = this.getDemoLocation();
      this.currentLocation = newLocation;

      // Notify listeners
      this.locationListeners.forEach((listener) => {
        try {
          listener(newLocation);
        } catch (error) {
          console.error("Error in demo location listener:", error);
        }
      });
    }, 15000); // Change location every 15 seconds in demo mode
  }

  // Start watching location changes
  async startLocationTracking(): Promise<boolean> {
    try {
      // Check if in demo mode
      if (await isDemoMode()) {
        this.startDemoLocationCycling();
        return true;
      }

      const permission = await this.checkLocationPermission();
      if (!permission.granted) {
        const newPermission = await this.requestLocationPermission();
        if (!newPermission.granted) {
          return false;
        }
      }

      if (this.watchSubscription) {
        this.watchSubscription.remove();
      }

      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Update when moved 50 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy ?? undefined,
            altitude: location.coords.altitude ?? undefined,
            speed: location.coords.speed ?? undefined,
            timestamp: location.timestamp,
          };

          this.currentLocation = locationData;

          // Notify all listeners
          this.locationListeners.forEach((listener) => {
            try {
              listener(locationData);
            } catch (error) {
              console.error("Error in location listener:", error);
            }
          });
        }
      );

      return true;
    } catch (error) {
      console.error("Error starting location tracking:", error);
      return false;
    }
  }

  // Stop location tracking
  stopLocationTracking(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
    if (this.demoLocationInterval) {
      clearInterval(this.demoLocationInterval);
      this.demoLocationInterval = null;
    }
  }

  // Add location change listener
  addLocationListener(callback: (location: LocationData) => void): () => void {
    this.locationListeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.locationListeners.indexOf(callback);
      if (index > -1) {
        this.locationListeners.splice(index, 1);
      }
    };
  }

  // Get cached location
  getCachedLocation(): LocationData | null {
    return this.currentLocation;
  }

  // Get address from coordinates (reverse geocoding)
  async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<string> {
    try {
      // Check if in demo mode
      if (await isDemoMode()) {
        const demoLoc = DEMO_LOCATIONS.find(
          (loc) =>
            Math.abs(loc.latitude - latitude) < 0.001 &&
            Math.abs(loc.longitude - longitude) < 0.001
        );
        return demoLoc
          ? demoLoc.address
          : `Demo Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      }

      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const parts = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean);

        return parts.join(", ");
      }

      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error("Error getting address:", error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  // Check if location is in safe zone (placeholder - would be enhanced with backend data)
  isInSafeZone(location: LocationData): boolean {
    // In demo mode, use predefined safe zones
    const demoLoc = DEMO_LOCATIONS.find(
      (loc) =>
        Math.abs(loc.latitude - location.latitude) < 0.001 &&
        Math.abs(loc.longitude - location.longitude) < 0.001
    );

    if (demoLoc) {
      return demoLoc.isSafe;
    }

    // Default to true for real locations (would be enhanced with backend data)
    return true;
  }

  // Calculate distance between two points
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }
}

// Create and export singleton instance
export const locationService = new LocationService();

// Export types
export { LocationService };
