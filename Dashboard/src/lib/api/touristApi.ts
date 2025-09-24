// Tourist API utility functions
const API_BASE_URL = 'http://localhost:3000/api/blockchain';

export interface TouristRegistrationData {
  touristId: string;
  name: string;
  nationality: string;
  passportNumber: string;
  phoneNumber: string;
  checkinDate?: string;
  checkoutDate?: string;
  emergencyContact?: string;
  kycDocuments: {
    passport: string;
    visa: string;
    photo: string;
  };
}

export interface TouristRegistrationResponse {
  touristId: string;
  blockchainRecord: {
    id: string;
  };
  kycStorage: {
    storageKey: string;
    documentHash: string;
    timestamp: string;
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
  additionalData?: {
    batteryLevel?: number;
    networkStrength?: string;
    nearbyDevices?: number;
    lastKnownActivity?: string;
  };
}

class TouristAPI {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async initializeBlockchain(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/initialize`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to initialize blockchain: ${response.status}`);
    }
    
    return response.json();
  }

  async registerTourist(data: TouristRegistrationData): Promise<TouristRegistrationResponse> {
    const response = await fetch(`${this.baseUrl}/tourist/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Tourist registration failed: ${response.status}`);
    }
    
    return response.json();
  }

  async anchorItinerary(data: ItineraryData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/itinerary/anchor`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Itinerary anchoring failed: ${response.status}`);
    }
    
    return response.json();
  }

  async reportPanicEvent(data: PanicEventData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/event/panic`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Panic event reporting failed: ${response.status}`);
    }
    
    return response.json();
  }

  async updateConsent(touristId: string, consentType: string, granted: boolean): Promise<any> {
    const response = await fetch(`${this.baseUrl}/tourist/${touristId}/consent`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        consentType,
        granted,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Consent update failed: ${response.status}`);
    }
    
    return response.json();
  }

  async grantAccess(touristId: string, targetOrg: string, scope: string[], expiryHours: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/access/grant`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        touristId,
        targetOrg,
        scope,
        expiryHours,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Access grant failed: ${response.status}`);
    }
    
    return response.json();
  }

  async verifyEventIntegrity(eventId: string, originalPayload: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/verify/event`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        eventId,
        originalPayload,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Event verification failed: ${response.status}`);
    }
    
    return response.json();
  }

  async deleteTouristData(touristId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/tourist/${touristId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Tourist data deletion failed: ${response.status}`);
    }
    
    return response.json();
  }
}

// Export a singleton instance
export const touristAPI = new TouristAPI();

// Set demo token (replace with actual authentication logic)
touristAPI.setAuthToken('demo_token');

export default TouristAPI;