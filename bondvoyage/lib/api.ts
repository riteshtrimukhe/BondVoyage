import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration
const API_BASE_URL = "http://localhost:3000/api/blockchain";

// Demo mode checker
const isDemoMode = async (): Promise<boolean> => {
  try {
    const demoStatus = await AsyncStorage.getItem("isDemoUser");
    return demoStatus === "true";
  } catch {
    return false;
  }
};

// Mock data for demo mode
const createMockResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  message: "Demo response (no backend required)",
});

// API Types based on backend documentation
export interface TouristRegistrationData {
  touristId: string;
  name: string;
  nationality: string;
  passportNumber: string;
  kycDocuments: {
    passport: string; // base64 encoded
    visa: string; // base64 encoded
    photo: string; // base64 encoded
  };
}

export interface ItineraryData {
  touristId: string;
  startDate: string;
  endDate: string;
  locations: string[];
  activities: string[];
  accommodations: string[];
}

export interface PanicEventData {
  touristId: string;
  location: {
    lat: number;
    lon: number;
  };
  deviceId: string;
  source: string;
  panicType: string;
  additionalData: {
    batteryLevel: number;
    networkStrength: string;
    nearbyDevices: number;
    lastKnownActivity: string;
  };
}

export interface ConsentData {
  consentType: string;
  granted: boolean;
}

export interface AccessGrantData {
  touristId: string;
  targetOrg: string;
  scope: string[];
  expiryHours: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface TouristRegistrationResponse {
  touristId: string;
  blockchainRecord: { id: string };
  kycStorage: {
    storageKey: string;
    documentHash: string;
    timestamp: string;
  };
}

export interface PanicEventResponse {
  eventId: string;
  blockchainRecord: { id: string };
  eventStorage: {
    storageKey: string;
    payloadHash: string;
    timestamp: string;
  };
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Check if in demo mode
      const demoMode = await isDemoMode();
      if (demoMode) {
        // Return mock responses for demo mode
        return this.getMockResponse<T>(endpoint, options);
      }

      const token = await this.getAuthToken();

      const config: RequestInit = {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private async getMockResponse<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );

    const method = options.method || "GET";

    switch (endpoint) {
      case "/initialize":
        return createMockResponse({
          message: "Demo blockchain initialized",
        } as T);

      case "/tourist/register":
        const mockRegistration = {
          touristId: "T-DEMO-12345",
          blockchainRecord: { id: "demo_tx_" + Date.now() },
          kycStorage: {
            storageKey: "demo/kyc/document.json",
            documentHash: "demo_hash_" + Math.random().toString(36),
            timestamp: new Date().toISOString(),
          },
        } as T;
        return createMockResponse(mockRegistration);

      case "/itinerary/anchor":
        const mockItinerary = {
          itineraryId: "ITIN_DEMO_" + Date.now(),
          blockchainRecord: { id: "demo_itin_tx_" + Date.now() },
          itineraryStorage: {
            storageKey: "demo/itineraries/itinerary.json",
            itineraryHash: "demo_itin_hash_" + Math.random().toString(36),
          },
        } as T;
        return createMockResponse(mockItinerary);

      case "/event/panic":
        const mockPanic = {
          eventId: "EVT_DEMO_" + Date.now(),
          blockchainRecord: { id: "demo_panic_tx_" + Date.now() },
          eventStorage: {
            storageKey: "demo/events/panic_event.json",
            payloadHash: "demo_panic_hash_" + Math.random().toString(36),
            timestamp: new Date().toISOString(),
          },
        } as T;
        return createMockResponse(mockPanic);

      default:
        if (endpoint.includes("/consent")) {
          return createMockResponse({
            success: true,
            message: "Demo consent updated",
          } as T);
        }
        return createMockResponse({
          success: true,
          message: "Demo operation completed",
        } as T);
    }
  }

  // Initialize Blockchain
  async initializeBlockchain(): Promise<ApiResponse> {
    return this.makeRequest("/initialize", {
      method: "POST",
    });
  }

  // Register Tourist (KYC)
  async registerTourist(
    data: TouristRegistrationData
  ): Promise<ApiResponse<TouristRegistrationResponse>> {
    return this.makeRequest<TouristRegistrationResponse>("/tourist/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Anchor Itinerary
  async anchorItinerary(data: ItineraryData): Promise<ApiResponse> {
    return this.makeRequest("/itinerary/anchor", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Panic Event
  async createPanicEvent(
    data: PanicEventData
  ): Promise<ApiResponse<PanicEventResponse>> {
    return this.makeRequest<PanicEventResponse>("/event/panic", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Update Consent
  async updateConsent(
    touristId: string,
    data: ConsentData
  ): Promise<ApiResponse> {
    return this.makeRequest(`/tourist/${touristId}/consent`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Grant Access
  async grantAccess(data: AccessGrantData): Promise<ApiResponse> {
    return this.makeRequest("/access/grant", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Verify Event Integrity
  async verifyEvent(
    eventId: string,
    originalPayload: any
  ): Promise<ApiResponse> {
    return this.makeRequest("/verify/event", {
      method: "POST",
      body: JSON.stringify({ eventId, originalPayload }),
    });
  }

  // Delete Tourist Data (GDPR)
  async deleteTouristData(touristId: string): Promise<ApiResponse> {
    return this.makeRequest(`/tourist/${touristId}`, {
      method: "DELETE",
    });
  }

  // Auth methods
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  }

  async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error clearing auth token:", error);
    }
  }
}

// Create and export singleton instance
export const apiService = new ApiService();

// Helper function to convert file to base64
export const convertToBase64 = (uri: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // This would typically use react-native-fs or expo-file-system
    // For now, return placeholder - you'll need to implement based on your file handling
    resolve("data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."); // Placeholder
  });
};

// Generate unique tourist ID
export const generateTouristId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `T-${timestamp}-${random}`.toUpperCase();
};

// Get device info for panic events
export const getDeviceInfo = async (): Promise<{
  deviceId: string;
  batteryLevel: number;
  networkStrength: string;
}> => {
  try {
    // For production, you would use:
    // import * as Device from 'expo-device';
    // import * as Battery from 'expo-battery';
    // import * as Network from 'expo-network';

    // Generate a consistent device ID based on available info
    const deviceId = `D-PHONE-${Date.now().toString(36).substr(-6).toUpperCase()}`;

    // Mock battery level (in production, use Battery.getBatteryLevelAsync())
    const batteryLevel = Math.floor(Math.random() * 100);

    // Mock network strength (in production, use Network.getNetworkStateAsync())
    const networkStrengths = ["excellent", "good", "fair", "poor"];
    const networkStrength =
      networkStrengths[Math.floor(Math.random() * networkStrengths.length)];

    return {
      deviceId,
      batteryLevel,
      networkStrength,
    };
  } catch (error) {
    console.error("Error getting device info:", error);
    return {
      deviceId: "D-UNKNOWN",
      batteryLevel: 50,
      networkStrength: "unknown",
    };
  }
};
