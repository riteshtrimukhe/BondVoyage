import { useState } from 'react';
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
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const AuthorityDashboard = () => {
  const [activeAlerts, setActiveAlerts] = useState(3);
  const [totalTourists, setTotalTourists] = useState(1247);
  const [responseTime, setResponseTime] = useState(4.2);
  const { toast } = useToast();

  const alerts = [
    {
      id: 1,
      type: 'SOS',
      tourist: 'Sarah Chen',
      location: 'Harbor District, Pier 15',
      time: '2 min ago',
      status: 'active',
      priority: 'high'
    },
    {
      id: 2,
      type: 'Geo-fence',
      tourist: 'Mike Johnson',
      location: 'Industrial Zone, Block C',
      time: '8 min ago',
      status: 'investigating',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'Inactivity',
      tourist: 'Ana Rodriguez',
      location: 'Old Town Square',
      time: '15 min ago',
      status: 'resolved',
      priority: 'low'
    }
  ];

  const recentTourists = [
    {
      id: 'ST-2024-001234',
      name: 'John Doe',
      nationality: 'USA',
      checkin: '2024-01-15',
      safetyScore: 85,
      status: 'safe'
    },
    {
      id: 'ST-2024-001235',
      name: 'Emma Wilson',
      nationality: 'UK',
      checkin: '2024-01-14',
      safetyScore: 92,
      status: 'safe'
    },
    {
      id: 'ST-2024-001236',
      name: 'Hans Mueller',
      nationality: 'Germany',
      checkin: '2024-01-13',
      safetyScore: 78,
      status: 'caution'
    }
  ];

  const handleAlertResponse = (alertId: number) => {
    toast({
      title: "Response Team Dispatched",
      description: `Emergency response team has been notified for Alert #${alertId}`,
    });
  };

  const handleTouristLookup = () => {
    toast({
      title: "Tourist Information Retrieved",
      description: "Digital ID verified and location data accessed from blockchain.",
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Authority Dashboard</h1>
              <p className="text-muted-foreground">Real-time tourist safety monitoring & response</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="status-safe">
                <Shield className="mr-1 h-4 w-4" />
                System Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Tourists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalTourists.toLocaleString()}</div>
              <div className="flex items-center text-sm text-success mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{activeAlerts}</div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <AlertTriangle className="h-4 w-4 mr-1" />
                2 high priority
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{responseTime} min</div>
              <div className="flex items-center text-sm text-success mt-1">
                <Clock className="h-4 w-4 mr-1" />
                -1.3 min improvement
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Safe Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">28</div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                Geo-fenced areas
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Alerts */}
          <Card className="card-gradient">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-warning" />
                  Active Alerts
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                    alert.priority === 'high' ? 'border-l-danger bg-danger/5' :
                    alert.priority === 'medium' ? 'border-l-warning bg-warning/5' :
                    'border-l-muted bg-muted/5'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={alert.status === 'active' ? 'destructive' : 
                                     alert.status === 'investigating' ? 'secondary' : 'default'}>
                          {alert.type}
                        </Badge>
                        <span className="font-medium">{alert.tourist}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{alert.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {alert.location}
                      </div>
                      {alert.status === 'active' && (
                        <Button size="sm" onClick={() => handleAlertResponse(alert.id)} variant="success">
                          <Phone className="h-4 w-4 mr-1" />
                          Respond
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tourist Lookup */}
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
                <Input placeholder="Enter Tourist ID or Passport Number" className="flex-1" />
                <Button onClick={handleTouristLookup} variant="hero">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="border rounded-lg p-4 bg-accent/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium">Recent Lookup: ST-2024-001234</div>
                  <Badge className="status-safe">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">John Doe</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nationality:</span>
                    <span className="ml-2 font-medium">USA</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Safety Score:</span>
                    <span className="ml-2 font-medium text-success">85/100</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2 font-medium text-success">Safe</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Placeholder and Recent Tourists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map View */}
          <Card className="lg:col-span-2 card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Live Tourist Map
              </CardTitle>
              <CardDescription>
                Real-time locations of active tourists (anonymized view)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="map-container h-80 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">Interactive Map</p>
                  <p className="text-sm text-muted-foreground">
                    Showing {totalTourists} active tourists across 28 monitored zones
                  </p>
                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-success rounded-full mr-2"></div>
                      <span className="text-sm">Safe Zones</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-warning rounded-full mr-2"></div>
                      <span className="text-sm">Caution Areas</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-danger rounded-full mr-2"></div>
                      <span className="text-sm">Restricted</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tourists */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Recent Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTourists.map((tourist) => (
                  <div key={tourist.id} className="p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{tourist.name}</div>
                      <Badge variant={tourist.status === 'safe' ? 'secondary' : 'outline'}>
                        {tourist.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>ID: {tourist.id}</div>
                      <div>{tourist.nationality} • Score: {tourist.safetyScore}</div>
                      <div>Registered: {tourist.checkin}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;