/**
 * Anomaly Detection API Service
 * Interfaces with the FastAPI anomaly detection service
 */

export interface TelemetryData {
  touristId: string;
  ts: string;
  lat: number;
  lng: number;
  speed?: number;
  deviationMeters?: number;
  in_alert_zone?: number;
  dt_s?: number;
  points_last_5m?: number;
  location_risk_score?: number;
  accelerometer_magnitude?: number;
  battery_level?: number;
  panic_button_pressed?: boolean;
}

export interface AnomalyResponse {
  touristId: string;
  timestamp: string;
  is_anomaly: boolean;
  anomaly_type: string;
  severity: number;
  confidence: number;
  anomaly_score: number;
  rule_based_score: number;
  ml_based_score: number;
  details: Record<string, any>;
  recommendations: string[];
  actions_taken: string[];
}

export interface AnomalyStatistics {
  total_tourists_monitored: number;
  total_records_processed: number;
  model_loaded: boolean;
  timestamp: string;
}

export interface HealthCheck {
  status: string;
  timestamp: string;
  model_loaded: boolean;
  version: string;
}

export interface TouristHistory {
  touristId: string;
  history: AnomalyResponse[];
  count: number;
}

const ANOMALY_SERVICE_URL = process.env.VITE_ANOMALY_SERVICE_URL || 'http://localhost:8001';

export class AnomalyAPI {
  private baseUrl: string;

  constructor(baseUrl: string = ANOMALY_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  async checkHealth(): Promise<HealthCheck> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  async predictAnomaly(telemetry: TelemetryData): Promise<AnomalyResponse> {
    const response = await fetch(`${this.baseUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telemetry),
    });

    if (!response.ok) {
      throw new Error(`Prediction failed: ${response.statusText}`);
    }

    return response.json();
  }

  async batchPredict(telemetryBatch: TelemetryData[]): Promise<{ results: AnomalyResponse[]; processed: number }> {
    const response = await fetch(`${this.baseUrl}/batch-predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telemetryBatch),
    });

    if (!response.ok) {
      throw new Error(`Batch prediction failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getTouristHistory(touristId: string): Promise<TouristHistory> {
    const response = await fetch(`${this.baseUrl}/tourist/${touristId}/history`);
    
    if (!response.ok) {
      throw new Error(`Failed to get tourist history: ${response.statusText}`);
    }

    return response.json();
  }

  async getStatistics(): Promise<AnomalyStatistics> {
    const response = await fetch(`${this.baseUrl}/statistics`);
    
    if (!response.ok) {
      throw new Error(`Failed to get statistics: ${response.statusText}`);
    }

    return response.json();
  }

  async simulateAnomaly(scenario: string = 'route_deviation'): Promise<AnomalyResponse> {
    const response = await fetch(`${this.baseUrl}/demo/simulate-anomaly?scenario=${scenario}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Simulation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async trainModel(trainingData: { data: Record<string, any>[]; contamination?: number }): Promise<{ status: string; message: string; contamination: number; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trainingData),
    });

    if (!response.ok) {
      throw new Error(`Training failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const anomalyAPI = new AnomalyAPI();

// Severity level mapping
export const SEVERITY_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium', 
  3: 'High',
  4: 'Critical'
};

export const SEVERITY_COLORS: Record<number, string> = {
  1: 'text-yellow-600 bg-yellow-100',
  2: 'text-orange-600 bg-orange-100',
  3: 'text-red-600 bg-red-100',
  4: 'text-red-800 bg-red-200'
};

export const ANOMALY_TYPE_LABELS: Record<string, string> = {
  'none': 'No Anomaly',
  'route_deviation': 'Route Deviation',
  'inactivity': 'Inactivity',
  'stopped': 'Stopped',
  'erratic_movement': 'Erratic Movement',
  'geofence_violation': 'Geofence Violation',
  'speed_anomaly': 'Speed Anomaly',
  'fall_detected': 'Fall Detected',
  'distress_pattern': 'Distress Pattern'
};