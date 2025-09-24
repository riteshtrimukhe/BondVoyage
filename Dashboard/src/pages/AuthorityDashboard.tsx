import { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  Clock, 
  TrendingUp,
  Search,
  Filter,
  Eye,
  Phone,
  CheckCircle,
  XCircle,
  FileText,
  Key,
  Trash2,
  Loader2,
  RefreshCw,
  Building,
  Activity,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { authorityAPI, type Tourist, type PanicEvent, type EFIRReport } from '@/lib/api/authorityApi';
import InteractiveMap, { type Tourist as MapTourist } from '@/components/InteractiveMap';

const AuthorityDashboard = () => {
  // Dashboard stats
  const [stats, setStats] = useState({
    totalTourists: 0,
    activeTourists: 0,
    activeAlerts: 0,
    avgResponseTime: 0,
    safeZones: 0
  });

  // Data states
  const [panicEvents, setPanicEvents] = useState<PanicEvent[]>([]);
  const [recentTourists, setRecentTourists] = useState<Tourist[]>([]);
  const [lookupResult, setLookupResult] = useState<Tourist | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<PanicEvent | null>(null);
  const [showEFIRForm, setShowEFIRForm] = useState(false);
  const [selectedTouristForMonitoring, setSelectedTouristForMonitoring] = useState<string>('');
  const [selectedMapTourist, setSelectedMapTourist] = useState<MapTourist | null>(null);
  
  // E-FIR form state
  const [efirForm, setEFIRForm] = useState({
    policeStation: '',
    officerId: '',
    incidentType: '',
    description: '',
    actionTaken: '',
    status: 'investigating'
  });

  const { toast } = useToast();

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [dashboardStats, events, tourists] = await Promise.all([
        authorityAPI.getDashboardStats(),
        authorityAPI.getActivePanicEvents(),
        authorityAPI.getRecentRegistrations()
      ]);

      setStats(dashboardStats);
      setPanicEvents(events);
      setRecentTourists(tourists);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Data Load Error",
        description: "Failed to load dashboard data. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTouristLookup = async () => {
    if (!lookupQuery.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a Tourist ID or Passport Number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authorityAPI.lookupTourist(lookupQuery);
      setLookupResult(result);
      
      if (result) {
        toast({
          title: "Tourist Found",
          description: `Digital ID verified for ${result.name}`,
        });
      } else {
        toast({
          title: "Tourist Not Found",
          description: "No tourist found with the provided ID or passport number",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Lookup error:', error);
      toast({
        title: "Lookup Failed",
        description: "Failed to lookup tourist information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyResponse = async (event: PanicEvent) => {
    try {
      // Grant emergency access to tourist data
      await authorityAPI.grantEmergencyAccess(
        event.touristId,
        'EMERGENCY_AUTHORITY_001',
        ['location', 'identity', 'emergency_contacts'],
        24
      );

      // Update event status
      setPanicEvents(prev => 
        prev.map(e => 
          e.eventId === event.eventId 
            ? { ...e, status: 'investigating' as const }
            : e
        )
      );

      toast({
        title: "Emergency Response Initiated",
        description: `Response team dispatched for ${event.touristName}. Emergency access granted.`,
      });

      setSelectedEvent(event);
    } catch (error) {
      console.error('Emergency response error:', error);
      toast({
        title: "Response Failed",
        description: "Failed to initiate emergency response",
        variant: "destructive",
      });
    }
  };

  const handleFileEFIR = async () => {
    if (!selectedEvent) return;

    const requiredFields = ['policeStation', 'officerId', 'incidentType', 'description'];
    const missingFields = requiredFields.filter(field => !efirForm[field as keyof typeof efirForm]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const efirData = {
        eventId: selectedEvent.eventId,
        touristId: selectedEvent.touristId,
        policeStation: efirForm.policeStation,
        officerId: efirForm.officerId,
        reportDetails: {
          incidentType: efirForm.incidentType,
          description: efirForm.description,
          actionTaken: efirForm.actionTaken,
          status: efirForm.status,
          witnesses: [],
          evidenceCollected: ['GPS location', 'Panic event log']
        }
      };

      const efirResult = await authorityAPI.fileEFIR(efirData);
      
      // Update event status to resolved
      setPanicEvents(prev => 
        prev.map(e => 
          e.eventId === selectedEvent.eventId 
            ? { ...e, status: 'resolved' as const }
            : e
        )
      );

      toast({
        title: "E-FIR Filed Successfully",
        description: `E-FIR ${efirResult.efirId} has been filed and recorded on blockchain.`,
      });

      setShowEFIRForm(false);
      setSelectedEvent(null);
      setEFIRForm({
        policeStation: '',
        officerId: '',
        incidentType: '',
        description: '',
        actionTaken: '',
        status: 'investigating'
      });
    } catch (error) {
      console.error('E-FIR filing error:', error);
      toast({
        title: "E-FIR Filing Failed",
        description: "Failed to file E-FIR report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEvent = async (event: PanicEvent) => {
    try {
      const originalPayload = {
        type: 'panic',
        touristId: event.touristId,
        location: event.location,
        panicType: event.panicType,
        timestamp: event.timestamp
      };

      const verification = await authorityAPI.verifyEventIntegrity(event.eventId, originalPayload);
      
      toast({
        title: verification.valid ? "Event Verified ✓" : "Verification Failed ✗",
        description: verification.valid 
          ? "Event integrity confirmed on blockchain"
          : "Event data integrity check failed",
        variant: verification.valid ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify event integrity",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTouristData = async (touristId: string) => {
    if (!confirm(`Are you sure you want to delete all data for tourist ${touristId}? This action cannot be undone.`)) {
      return;
    }

    try {
      await authorityAPI.deleteTouristData(touristId);
      
      // Remove from recent tourists list
      setRecentTourists(prev => prev.filter(t => t.touristId !== touristId));
      
      toast({
        title: "Data Deleted",
        description: "Tourist data has been deleted (GDPR compliance). Blockchain hashes preserved.",
      });
    } catch (error) {
      console.error('Deletion error:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete tourist data",
        variant: "destructive",
      });
    }
  };

  const handleMapTouristClick = (tourist: MapTourist) => {
    setSelectedMapTourist(tourist);
    toast({
      title: `Tourist Selected: ${tourist.name}`,
      description: `ID: ${tourist.id} | Status: ${tourist.status.toUpperCase()} | Safety Score: ${tourist.safetyScore}`,
      variant: tourist.status === 'emergency' ? 'destructive' : 'default',
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Authority Dashboard</h1>
              <p className="text-muted-foreground">Real-time tourist safety monitoring & blockchain verification</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={loadDashboardData} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Badge variant="secondary" className="status-safe">
                <Shield className="mr-1 h-4 w-4" />
                Blockchain Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="anomaly-detection" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Anomaly Detection
            </TabsTrigger>
            <TabsTrigger value="real-time-monitor" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Real-Time Monitor
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="card-gradient">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Tourists</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.totalTourists.toLocaleString()}</div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Users className="h-4 w-4 mr-1" />
                    Registered
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">{stats.activeTourists.toLocaleString()}</div>
                  <div className="flex items-center text-sm text-success mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Online
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning">{stats.activeAlerts}</div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Panic events
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">{stats.avgResponseTime} min</div>
                  <div className="flex items-center text-sm text-success mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    Average
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Safe Zones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.safeZones}</div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    Monitored
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Panic Events */}
              <Card className="card-gradient">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-warning" />
                      Active Panic Events
                    </CardTitle>
                    <Badge variant="outline">{panicEvents.length} events</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {panicEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No active panic events</p>
                  </div>
                ) : (
                  panicEvents.map((event) => (
                    <div key={event.eventId} className={`p-4 rounded-lg border-l-4 ${
                      event.priority === 'high' ? 'border-l-danger bg-danger/5' :
                      event.priority === 'medium' ? 'border-l-warning bg-warning/5' :
                      'border-l-muted bg-muted/5'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            event.status === 'active' ? 'destructive' : 
                            event.status === 'investigating' ? 'secondary' : 'default'
                          }>
                            {event.panicType}
                          </Badge>
                          <span className="font-medium">{event.touristName}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatTimeAgo(event.timestamp)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location.lat.toFixed(4)}, {event.location.lon.toFixed(4)}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleVerifyEvent(event)}>
                            <Shield className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                          {event.status === 'active' && (
                            <Button size="sm" onClick={() => handleEmergencyResponse(event)} variant="destructive">
                              <Phone className="h-4 w-4 mr-1" />
                              Respond
                            </Button>
                          )}
                          {event.status === 'investigating' && (
                            <Button size="sm" onClick={() => { setSelectedEvent(event); setShowEFIRForm(true); }} variant="success">
                              <FileText className="h-4 w-4 mr-1" />
                              File E-FIR
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tourist ID Lookup */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5 text-primary" />
                Tourist ID Lookup
              </CardTitle>
              <CardDescription>
                Search and verify tourist digital IDs from blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter Tourist ID (T-DEMO-...) or Passport Number" 
                  className="flex-1"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTouristLookup()}
                />
                <Button onClick={handleTouristLookup} variant="hero" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {lookupResult && (
                <div className="border rounded-lg p-4 bg-accent/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">Tourist Found: {lookupResult.touristId}</div>
                    <Badge className="status-safe">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-medium">{lookupResult.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nationality:</span>
                      <span className="ml-2 font-medium">{lookupResult.nationality}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2 font-medium text-success capitalize">{lookupResult.status}</span>
                    </div>
                    {lookupResult.safetyScore && (
                      <div>
                        <span className="text-muted-foreground">Safety Score:</span>
                        <span className="ml-2 font-medium text-success">{lookupResult.safetyScore}/100</span>
                      </div>
                    )}
                  </div>
                  {lookupResult.currentLocation && (
                    <div className="mt-3 pt-3 border-t text-sm">
                      <div className="flex items-center text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        Current Location
                      </div>
                      <div>{lookupResult.currentLocation.address}</div>
                      <div className="text-xs text-muted-foreground">
                        Updated: {formatTimeAgo(lookupResult.currentLocation.timestamp)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Map View and Recent Tourists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Map Placeholder */}
          <Card className="lg:col-span-2 card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Live Tourist Tracking Map
              </CardTitle>
              <CardDescription>
                Real-time locations of active tourists (privacy-compliant view)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <InteractiveMap onTouristClick={handleMapTouristClick} />
              </div>
              {selectedMapTourist && (
                <div className="mt-4 p-3 border rounded-lg bg-accent/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{selectedMapTourist.name}</h4>
                    <Badge variant={selectedMapTourist.status === 'safe' ? 'secondary' : 
                                  selectedMapTourist.status === 'caution' ? 'outline' : 'destructive'}>
                      {selectedMapTourist.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>ID: {selectedMapTourist.id}</div>
                    <div>Safety Score: {selectedMapTourist.safetyScore}/100</div>
                    <div>Last Update: {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Tourist Registrations */}
          <Card className="card-gradient">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Recent Registrations
                </CardTitle>
                <Badge variant="outline">{recentTourists.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTourists.map((tourist) => (
                  <div key={tourist.touristId} className="p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{tourist.name}</div>
                      <Badge variant={tourist.status === 'active' ? 'secondary' : 'outline'}>
                        {tourist.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>ID: {tourist.touristId}</div>
                      <div>{tourist.nationality} • Score: {tourist.safetyScore || 'N/A'}</div>
                      <div>Registered: {new Date(tourist.registrationDate).toLocaleDateString()}</div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteTouristData(tourist.touristId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        GDPR Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        </TabsContent>

        {/* Anomaly Detection Tab */}
        <TabsContent value="anomaly-detection" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Anomaly Detection System
              </CardTitle>
              <CardDescription>
                Real-time anomaly monitoring and detection system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Anomaly Detection Service</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced AI-powered anomaly detection for tourist safety monitoring
                </p>
                <Button className="mr-2">
                  <Zap className="h-4 w-4 mr-2" />
                  Check Service Health
                </Button>
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Statistics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-Time Monitor Tab */}
        <TabsContent value="real-time-monitor" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tourist Selection for Monitoring</CardTitle>
              <CardDescription>
                Select a tourist ID to start real-time anomaly monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="tourist-id">Tourist ID</Label>
                  <Input
                    id="tourist-id"
                    placeholder="Enter Tourist ID (e.g., T-DEMO-001)"
                    value={selectedTouristForMonitoring}
                    onChange={(e) => setSelectedTouristForMonitoring(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => {
                    if (!selectedTouristForMonitoring.trim()) {
                      toast({
                        title: "Validation Error",
                        description: "Please enter a Tourist ID",
                        variant: "destructive",
                      });
                      return;
                    }
                  }}
                  disabled={!selectedTouristForMonitoring.trim()}
                >
                  Start Monitoring
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {selectedTouristForMonitoring.trim() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Monitoring: {selectedTouristForMonitoring}
                </CardTitle>
                <CardDescription>
                  Real-time anomaly monitoring session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Zap className="h-8 w-8 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium mb-2">Monitoring Active</p>
                  <p className="text-muted-foreground mb-4">
                    Real-time anomaly detection is running for {selectedTouristForMonitoring}
                  </p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="default">Anomaly Service: Connected</Badge>
                    <Badge variant="outline">Monitoring Interval: 5s</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        </Tabs>

        {/* E-FIR Filing Modal */}
        {showEFIRForm && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  File E-FIR Report
                </CardTitle>
                <CardDescription>
                  Electronic First Information Report for Event ID: {selectedEvent.eventId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent p-3 rounded-lg text-sm">
                  <strong>Event Details:</strong><br />
                  Tourist: {selectedEvent.touristName} ({selectedEvent.touristId})<br />
                  Location: {selectedEvent.location.lat.toFixed(6)}, {selectedEvent.location.lon.toFixed(6)}<br />
                  Time: {new Date(selectedEvent.timestamp).toLocaleString()}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="policeStation">Police Station *</Label>
                    <Input
                      id="policeStation"
                      placeholder="e.g., Jaipur City Police Station"
                      value={efirForm.policeStation}
                      onChange={(e) => setEFIRForm(prev => ({ ...prev, policeStation: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="officerId">Officer ID *</Label>
                    <Input
                      id="officerId"
                      placeholder="e.g., OFF-JP-001"
                      value={efirForm.officerId}
                      onChange={(e) => setEFIRForm(prev => ({ ...prev, officerId: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incidentType">Incident Type *</Label>
                  <Select value={efirForm.incidentType} onValueChange={(value) => setEFIRForm(prev => ({ ...prev, incidentType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tourist in distress">Tourist in distress</SelectItem>
                      <SelectItem value="Medical emergency">Medical emergency</SelectItem>
                      <SelectItem value="Lost tourist">Lost tourist</SelectItem>
                      <SelectItem value="Accident">Accident</SelectItem>
                      <SelectItem value="Theft/Robbery">Theft/Robbery</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the incident..."
                    value={efirForm.description}
                    onChange={(e) => setEFIRForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actionTaken">Action Taken</Label>
                  <Textarea
                    id="actionTaken"
                    placeholder="Describe the actions taken..."
                    value={efirForm.actionTaken}
                    onChange={(e) => setEFIRForm(prev => ({ ...prev, actionTaken: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={efirForm.status} onValueChange={(value) => setEFIRForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investigating">Under Investigation</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowEFIRForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleFileEFIR} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Filing E-FIR...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        File E-FIR
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;