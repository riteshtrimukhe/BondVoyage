import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  AlertTriangle,
  Zap,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  anomalyAPI, 
  type TelemetryData, 
  type AnomalyResponse,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  ANOMALY_TYPE_LABELS
} from '@/lib/api/anomalyApi';

interface RealTimeMonitorProps {
  touristId: string;
  onAnomalyDetected?: (anomaly: AnomalyResponse) => void;
}

const RealTimeAnomalyMonitor = ({ touristId, onAnomalyDetected }: RealTimeMonitorProps) => {
  const { toast } = useToast();
  const intervalRef = useRef<number | null>(null);
  
  // Monitoring state
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [interval, setInterval] = useState(5000); // 5 seconds default
  const [autoNotify, setAutoNotify] = useState(true);
  
  // Current data
  const [currentTelemetry, setCurrentTelemetry] = useState<TelemetryData | null>(null);
  const [latestAnomaly, setLatestAnomaly] = useState<AnomalyResponse | null>(null);
  const [monitoringStats, setMonitoringStats] = useState({
    totalChecks: 0,
    anomaliesDetected: 0,
    lastCheck: null as Date | null,
    uptime: 0
  });

  // Generate mock telemetry data for demonstration
  const generateMockTelemetry = (): TelemetryData => {
    const baseLocation = { lat: 26.9124, lng: 75.7873 }; // Jaipur coordinates
    
    // Add some random variation to simulate movement
    const latVariation = (Math.random() - 0.5) * 0.01; // ~1km variation
    const lngVariation = (Math.random() - 0.5) * 0.01;
    
    return {
      touristId,
      ts: new Date().toISOString(),
      lat: baseLocation.lat + latVariation,
      lng: baseLocation.lng + lngVariation,
      speed: Math.random() * 10 + 2, // 2-12 km/h
      deviationMeters: Math.random() * 50, // 0-50m deviation
      in_alert_zone: Math.random() > 0.9 ? 1 : 0, // 10% chance of being in alert zone
      dt_s: interval / 1000,
      points_last_5m: Math.floor(Math.random() * 5) + 1,
      location_risk_score: Math.random() * 3, // 0-3 risk score
      accelerometer_magnitude: Math.random() * 1.5 + 0.8, // 0.8-2.3 g-force
      battery_level: Math.random() * 100,
      panic_button_pressed: false
    };
  };

  // Perform anomaly check
  const performAnomalyCheck = async () => {
    try {
      const telemetry = generateMockTelemetry();
      setCurrentTelemetry(telemetry);

      const result = await anomalyAPI.predictAnomaly(telemetry);
      setLatestAnomaly(result);

      // Update stats
      setMonitoringStats(prev => ({
        ...prev,
        totalChecks: prev.totalChecks + 1,
        anomaliesDetected: prev.anomaliesDetected + (result.is_anomaly ? 1 : 0),
        lastCheck: new Date()
      }));

      // Handle anomaly detection
      if (result.is_anomaly) {
        if (autoNotify) {
          toast({
            title: "🚨 Anomaly Detected!",
            description: `${ANOMALY_TYPE_LABELS[result.anomaly_type]} - ${SEVERITY_LABELS[result.severity]} severity`,
            variant: result.severity >= 3 ? "destructive" : "default",
          });
        }
        
        onAnomalyDetected?.(result);
      }

    } catch (error) {
      console.error('Anomaly check failed:', error);
      toast({
        title: "Monitoring Error",
        description: "Failed to perform anomaly check",
        variant: "destructive",
      });
    }
  };

  // Start monitoring
  const startMonitoring = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    setIsMonitoring(true);
    setMonitoringStats(prev => ({ ...prev, uptime: Date.now() }));
    
    // Perform initial check
    performAnomalyCheck();
    
    // Set up interval
    intervalRef.current = window.setInterval(performAnomalyCheck, interval);
  };

  // Stop monitoring
  const stopMonitoring = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMonitoring(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update uptime
  useEffect(() => {
    if (!isMonitoring) return;

    const uptimeInterval = window.setInterval(() => {
      setMonitoringStats(prev => ({
        ...prev,
        uptime: prev.uptime
      }));
    }, 1000);

    return () => window.clearInterval(uptimeInterval);
  }, [isMonitoring]);

  const getUptimeString = () => {
    if (!isMonitoring || !monitoringStats.uptime) return '00:00:00';
    
    const elapsed = Math.floor((Date.now() - monitoringStats.uptime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSeverityBadgeColor = (severity: number) => {
    return SEVERITY_COLORS[severity] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Anomaly Monitor
          </CardTitle>
          <CardDescription>
            Live monitoring for tourist {touristId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {!isMonitoring ? (
                <Button onClick={startMonitoring}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Monitoring
                </Button>
              ) : (
                <Button onClick={stopMonitoring} variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Monitoring
                </Button>
              )}
            </div>
            
            <Badge variant={isMonitoring ? "default" : "secondary"}>
              {isMonitoring ? "ACTIVE" : "STOPPED"}
            </Badge>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="interval">Check Interval (ms)</Label>
              <Input
                id="interval"
                type="number"
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                disabled={isMonitoring}
                min="1000"
                max="60000"
                step="1000"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-notify"
                checked={autoNotify}
                onCheckedChange={setAutoNotify}
              />
              <Label htmlFor="auto-notify">Auto Notifications</Label>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div>Uptime: {getUptimeString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringStats.totalChecks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{monitoringStats.anomaliesDetected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitoringStats.totalChecks > 0 
                ? `${Math.round((monitoringStats.anomaliesDetected / monitoringStats.totalChecks) * 100)}%`
                : '0%'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {monitoringStats.lastCheck 
                ? monitoringStats.lastCheck.toLocaleTimeString()
                : 'Never'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Status */}
      {currentTelemetry && (
        <Card>
          <CardHeader>
            <CardTitle>Current Telemetry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Location:</span>
                <br />
                {currentTelemetry.lat.toFixed(4)}, {currentTelemetry.lng.toFixed(4)}
              </div>
              <div>
                <span className="font-medium">Speed:</span>
                <br />
                {currentTelemetry.speed?.toFixed(1)} km/h
              </div>
              <div>
                <span className="font-medium">Deviation:</span>
                <br />
                {currentTelemetry.deviationMeters?.toFixed(1)}m
              </div>
              <div>
                <span className="font-medium">Risk Score:</span>
                <br />
                {currentTelemetry.location_risk_score?.toFixed(1)}/10
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest Anomaly */}
      {latestAnomaly && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {latestAnomaly.is_anomaly ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <Zap className="h-5 w-5 text-green-500" />
              )}
              Latest Detection Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestAnomaly.is_anomaly ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityBadgeColor(latestAnomaly.severity)}>
                    {SEVERITY_LABELS[latestAnomaly.severity]}
                  </Badge>
                  <span className="font-medium">
                    {ANOMALY_TYPE_LABELS[latestAnomaly.anomaly_type]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Confidence: {Math.round(latestAnomaly.confidence * 100)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Anomaly Score:</span>
                    <br />
                    {latestAnomaly.anomaly_score.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Rule-based:</span>
                    <br />
                    {latestAnomaly.rule_based_score.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">ML-based:</span>
                    <br />
                    {latestAnomaly.ml_based_score.toFixed(2)}
                  </div>
                </div>

                {latestAnomaly.recommendations.length > 0 && (
                  <div>
                    <span className="font-medium">Recommendations:</span>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-muted-foreground">
                      {latestAnomaly.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <Zap className="h-4 w-4" />
                No anomaly detected - All systems normal
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeAnomalyMonitor;