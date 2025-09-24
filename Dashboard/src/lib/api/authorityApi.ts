// Authority API utility functions
const API_BASE_URL = 'http://localhost:3000/api/blockchain';

export interface Tourist {
  touristId: string;
  name: string;
  nationality: string;
  passportNumber: string;
  registrationDate: string;
  status: 'active' | 'expired' | 'suspended';
  safetyScore?: number;
  currentLocation?: {
    lat: number;
    lon: number;
    address: string;
    timestamp: string;
  };
  emergencyContacts?: string[];
}

export interface PanicEvent {
  eventId: string;
  touristId: string;
  touristName?: string;
  location: {
    lat: number;
    lon: number;
  };
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  deviceId: string;
  source: string;
  panicType: string;
  additionalData?: any;
}

export interface EFIRReport {
  efirId: string;
  eventId: string;
  touristId: string;
  policeStation: string;
  officerId: string;
  reportDetails: {
    incidentType: string;
    description: string;
    actionTaken: string;
    status: string;
    witnesses: string[];
    evidenceCollected: string[];
  };
  attachments?: string[];
  timestamp: string;
}

export interface AccessGrant {
  grantId: string;
  touristId: string;
  targetOrg: string;
  scope: string[];
  status: 'active' | 'expired' | 'revoked';
  expiresAt: string;
  createdAt: string;
}

export interface VerificationResult {
  valid: boolean;
  computedHash: string;
  expectedHash: string;
  algorithm: string;
  timestamp?: string;
}

class AuthorityAPI {
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

  // Initialize blockchain system
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

  // Tourist lookup and verification
  async lookupTourist(query: string): Promise<Tourist | null> {
    // This would typically be a GET endpoint, but since it's not in the API doc,
    // we'll simulate it using the verification endpoint
    try {
      // In real implementation, this would be a specific lookup endpoint
      // For now, we'll return mock data for demonstration
      if (query.startsWith('T-DEMO-') || query.includes('passport')) {
        return {
          touristId: 'T-DEMO-12345',
          name: 'Alice Johnson',
          nationality: 'American',
          passportNumber: 'US123456789',
          registrationDate: '2025-09-20T12:34:56.789Z',
          status: 'active',
          safetyScore: 85,
          currentLocation: {
            lat: 26.9124,
            lon: 75.7873,
            address: 'Jaipur, Rajasthan, India',
            timestamp: new Date().toISOString()
          }
        };
      }
      return null;
    } catch (error) {
      console.error('Tourist lookup error:', error);
      return null;
    }
  }

  // File E-FIR for incidents
  async fileEFIR(data: {
    eventId: string;
    touristId: string;
    policeStation: string;
    officerId: string;
    reportDetails: {
      incidentType: string;
      description: string;
      actionTaken: string;
      status: string;
      witnesses?: string[];
      evidenceCollected?: string[];
    };
    attachments?: string[];
  }): Promise<EFIRReport> {
    const response = await fetch(`${this.baseUrl}/efir/file`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`E-FIR filing failed: ${response.status}`);
    }
    
    const result = await response.json();
    return {
      efirId: result.efirId,
      eventId: data.eventId,
      touristId: data.touristId,
      policeStation: data.policeStation,
      officerId: data.officerId,
      reportDetails: {
        ...data.reportDetails,
        witnesses: data.reportDetails.witnesses || [],
        evidenceCollected: data.reportDetails.evidenceCollected || []
      },
      attachments: data.attachments,
      timestamp: new Date().toISOString()
    };
  }

  // Update tourist consent (for authorities with proper permissions)
  async updateTouristConsent(touristId: string, consentType: string, granted: boolean): Promise<any> {
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

  // Grant emergency access to tourist data
  async grantEmergencyAccess(
    touristId: string, 
    authorityId: string, 
    scope: string[], 
    expiryHours: number = 24
  ): Promise<AccessGrant> {
    const response = await fetch(`${this.baseUrl}/access/grant`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        touristId,
        targetOrg: authorityId,
        scope,
        expiryHours,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Access grant failed: ${response.status}`);
    }
    
    const result = await response.json();
    return {
      grantId: result.grantId,
      touristId,
      targetOrg: authorityId,
      scope,
      status: result.accessGrant.status,
      expiresAt: result.accessGrant.expiresAt,
      createdAt: new Date().toISOString()
    };
  }

  // Verify event integrity
  async verifyEventIntegrity(eventId: string, originalPayload: any): Promise<VerificationResult> {
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
    
    const result = await response.json();
    return {
      valid: result.verification.valid,
      computedHash: result.verification.computedHash,
      expectedHash: result.verification.expectedHash,
      algorithm: result.verification.algorithm,
      timestamp: new Date().toISOString()
    };
  }

  // Delete tourist data (GDPR compliance)
  async deleteTouristData(touristId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/tourist/${touristId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Tourist data deletion failed: ${response.status}`);
    }
    
    return response.json();
  }

  // Mock methods for dashboard data (these would be real endpoints in production)
  async getDashboardStats(): Promise<{
    totalTourists: number;
    activeTourists: number;
    activeAlerts: number;
    avgResponseTime: number;
    safeZones: number;
  }> {
    // This would be a real API endpoint in production
    return {
      totalTourists: 1247,
      activeTourists: 892,
      activeAlerts: 3,
      avgResponseTime: 4.2,
      safeZones: 28
    };
  }

  async getActivePanicEvents(): Promise<PanicEvent[]> {
    // This would fetch real panic events from the backend
    return [
      {
        eventId: 'EVT_12345',
        touristId: 'T-DEMO-12345',
        touristName: 'Sarah Chen',
        location: { lat: 26.9124, lon: 75.7873 },
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        status: 'active',
        priority: 'high',
        deviceId: 'D-PHONE-001',
        source: 'phone',
        panicType: 'manual'
      },
      {
        eventId: 'EVT_12346',
        touristId: 'T-DEMO-12346',
        touristName: 'Mike Johnson',
        location: { lat: 26.8467, lon: 75.8064 },
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        status: 'investigating',
        priority: 'medium',
        deviceId: 'D-PHONE-002',
        source: 'phone',
        panicType: 'automatic'
      }
    ];
  }

  async getRecentRegistrations(): Promise<Tourist[]> {
    // This would fetch recent tourist registrations
    return [
      {
        touristId: 'T-DEMO-001234',
        name: 'John Doe',
        nationality: 'American',
        passportNumber: 'US123456789',
        registrationDate: '2024-01-15T10:30:00.000Z',
        status: 'active',
        safetyScore: 85
      },
      {
        touristId: 'T-DEMO-001235',
        name: 'Emma Wilson',
        nationality: 'British',
        passportNumber: 'GB987654321',
        registrationDate: '2024-01-14T14:20:00.000Z',
        status: 'active',
        safetyScore: 92
      },
      {
        touristId: 'T-DEMO-001236',
        name: 'Hans Mueller',
        nationality: 'German',
        passportNumber: 'DE456789123',
        registrationDate: '2024-01-13T09:15:00.000Z',
        status: 'active',
        safetyScore: 78
      }
    ];
  }
}

// Export a singleton instance
export const authorityAPI = new AuthorityAPI();

// Set demo token for authority (replace with actual authentication)
authorityAPI.setAuthToken('authority_demo_token');

export default AuthorityAPI;