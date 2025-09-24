import { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  RefreshCw,
  Eye,
  Clock,
  MapPin,
  Zap,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  anomalyAPI, 
  type AnomalyResponse, 
  type AnomalyStatistics, 
  type HealthCheck,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  ANOMALY_TYPE_LABELS
} from '@/lib/api/anomalyApi';
import { formatDistanceToNow } from 'date-fns';

interface AnomalyDashboardProps {
  touristId?: string;
  showGlobalStats?: boolean;
}

const AnomalyDashboard = ({ touristId, showGlobalStats = true }: AnomalyDashboardProps) => {
  const { toast } = useToast();
  
  // State
  const [healthStatus, setHealthStatus] = useState<HealthCheck | null>(null);
  const [statistics, setStatistics] = useState<AnomalyStatistics | null>(null);
  const [recentAnomalies, setRecentAnomalies] = useState<AnomalyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch health status
  const fetchHealthStatus = async () => {
    try {
      const health = await anomalyAPI.checkHealth();
      setHealthStatus(health);
    } catch (error) {
      console.error('Failed to fetch health status:', error);
      toast({
        title: "Service Unavailable",
        description: "Anomaly detection service is not responding",
        variant: "destructive",
      });
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await anomalyAPI.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  // Fetch tourist history if touristId provided
  const fetchTouristHistory = async (id: string) => {
    try {
      setIsLoading(true);
      const history = await anomalyAPI.getTouristHistory(id);
      setRecentAnomalies(history.history.slice(0, 10)); // Show last 10
    } catch (error) {
      console.error('Failed to fetch tourist history:', error);
      toast({
        title: "Error",
        description: "Failed to load tourist anomaly history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate anomaly for demo purposes
  const simulateAnomaly = async (scenario: string) => {
    try {
      setIsLoading(true);
      const result = await anomalyAPI.simulateAnomaly(scenario);
      setRecentAnomalies(prev => [result, ...prev.slice(0, 9)]);
      
      toast({
        title: "Anomaly Simulated",
        description: `${ANOMALY_TYPE_LABELS[result.anomaly_type]} detected with ${SEVERITY_LABELS[result.severity]} severity`,
        variant: result.severity >= 3 ? "destructive" : "default",
      });
    } catch (error) {
      console.error('Failed to simulate anomaly:', error);
      toast({
        title: "Simulation Failed",
        description: "Could not simulate anomaly",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchHealthStatus(),
      showGlobalStats && fetchStatistics(),
      touristId && fetchTouristHistory(touristId)
    ]);
    setIsRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    refreshData();
  }, [touristId, showGlobalStats]);

  const getSeverityBadgeColor = (severity: number) => {
    return SEVERITY_COLORS[severity] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Anomaly Detection</h2>
          <p className="text-muted-foreground">
            {touristId ? `Monitoring tourist ${touristId}` : 'Real-time anomaly monitoring system'}
          </p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Health Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Service Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthStatus ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge 
                  variant={healthStatus.status === 'healthy' ? 'default' : 'destructive'}
                  className="flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  {healthStatus.status.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Version {healthStatus.version}
                </span>
                <span className="text-sm text-muted-foreground">
                  Model: {healthStatus.model_loaded ? '✅ Loaded' : '❌ Not Loaded'}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                Last checked: {formatDistanceToNow(new Date(healthStatus.timestamp), { addSuffix: true })}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Service unavailable
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {showGlobalStats && statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monitored Tourists</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_tourists_monitored}</div>
              <p className="text-xs text-muted-foreground">
                Active monitoring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_records_processed}</div>
              <p className="text-xs text-muted-foreground">
                Total data points
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Model Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.model_loaded ? '✅' : '❌'}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.model_loaded ? 'Model loaded' : 'Model not loaded'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Update</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDistanceToNow(new Date(statistics.timestamp), { addSuffix: true })}
              </div>
              <p className="text-xs text-muted-foreground">
                System timestamp
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Demo Controls */}
      {!touristId && (
        <Card>
          <CardHeader>
            <CardTitle>Demo & Testing</CardTitle>
            <CardDescription>
              Simulate different anomaly scenarios for testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => simulateAnomaly('route_deviation')} 
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Route Deviation
              </Button>
              <Button 
                onClick={() => simulateAnomaly('inactivity')} 
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Inactivity
              </Button>
              <Button 
                onClick={() => simulateAnomaly('fall_detection')} 
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                Fall Detection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Anomalies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {touristId ? `Anomaly History - ${touristId}` : 'Recent Anomalies'}
          </CardTitle>
          <CardDescription>
            {touristId ? 'Latest anomalies detected for this tourist' : 'Latest anomalies detected across all tourists'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recentAnomalies.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No anomalies detected yet
            </div>
          ) : (
            <div className="space-y-4">
              {recentAnomalies.map((anomaly, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityBadgeColor(anomaly.severity)}>
                        {SEVERITY_LABELS[anomaly.severity]}
                      </Badge>
                      <span className="font-medium">
                        {ANOMALY_TYPE_LABELS[anomaly.anomaly_type] || anomaly.anomaly_type}
                      </span>
                      {!touristId && (
                        <span className="text-sm text-muted-foreground">
                          Tourist: {anomaly.touristId}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(anomaly.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Confidence: {Math.round(anomaly.confidence * 100)}%</span>
                    <span>Score: {anomaly.anomaly_score.toFixed(2)}</span>
                  </div>
                  
                  {anomaly.recommendations.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Recommendations:</span>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {anomaly.recommendations.map((rec, i) => (
                          <li key={i} className="text-muted-foreground">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyDashboard;