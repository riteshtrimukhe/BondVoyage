import { useState } from 'react';
import { 
  MapPin, 
  Shield, 
  AlertTriangle, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User,
  CreditCard,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const TouristPortal = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [safetyScore, setSafetyScore] = useState(85);
  const [currentLocation, setCurrentLocation] = useState('Downtown Tourist Area');
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'Emergency Services', number: '911' },
    { name: 'Tourist Helpline', number: '+1-800-TOURIST' }
  ]);
  const { toast } = useToast();

  const handleRegistration = () => {
    setIsRegistered(true);
    toast({
      title: "Registration Successful!",
      description: "Your digital tourist ID has been created and secured on blockchain.",
    });
  };

  const handleSOS = () => {
    toast({
      title: "🚨 SOS Alert Sent!",
      description: "Emergency services and your contacts have been notified with your location.",
      variant: "destructive",
    });
  };

  if (!isRegistered) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="p-4 bg-gradient-to-r from-primary to-secondary rounded-2xl w-fit mx-auto mb-4">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Digital Tourist Registration</h1>
            <p className="text-xl text-muted-foreground">
              Create your secure digital ID for enhanced safety monitoring
            </p>
          </div>

          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Tourist Information</CardTitle>
              <CardDescription>
                All information is encrypted and stored securely on blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passport">Passport Number</Label>
                <Input id="passport" placeholder="A12345678" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 (555) 123-4567" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkin">Check-in Date</Label>
                  <Input id="checkin" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout">Check-out Date</Label>
                  <Input id="checkout" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency">Emergency Contact</Label>
                <Input id="emergency" placeholder="Emergency contact name and phone" />
              </div>

              <Button onClick={handleRegistration} variant="hero" className="w-full">
                <Shield className="mr-2 h-5 w-5" />
                Create Digital Tourist ID
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Tourist Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, John Doe</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="status-safe">
                <CheckCircle className="mr-1 h-4 w-4" />
                ID Verified
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Safety Score */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Safety Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold text-success mb-2">{safetyScore}</div>
                <div className="text-sm text-muted-foreground mb-4">out of 100</div>
                <Badge className="status-safe">Excellent Safety Rating</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Current Location */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Current Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-xl font-semibold mb-2">{currentLocation}</div>
                <div className="text-sm text-muted-foreground mb-4">Safe Zone</div>
                <Badge className="status-safe">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Safe Area
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Button */}
          <Card className="card-gradient border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-danger">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Emergency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSOS} variant="danger" className="w-full text-lg py-6">
                <Phone className="mr-2 h-6 w-6" />
                SOS - Emergency Alert
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Tap to send location to authorities and emergency contacts
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Activity */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <div className="font-medium">Entered Safe Zone</div>
                    <div className="text-sm text-muted-foreground">Downtown Tourist Area - 2:30 PM</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Location Update</div>
                    <div className="text-sm text-muted-foreground">City Center - 1:45 PM</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-warning/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <div>
                    <div className="font-medium">Geo-fence Alert</div>
                    <div className="text-sm text-muted-foreground">Approached restricted area - 12:15 PM</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-primary" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">{contact.number}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Digital ID Card */}
        <Card className="card-gradient mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-primary" />
              Digital Tourist ID
            </CardTitle>
            <CardDescription>Blockchain-secured digital identity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-6 w-6" />
                  <span className="font-semibold">SAFE TOUR ID</span>
                </div>
                <Badge className="bg-white/20 text-white">VERIFIED</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm opacity-80">Tourist Name</div>
                  <div className="font-semibold">John Doe</div>
                </div>
                <div>
                  <div className="text-sm opacity-80">Nationality</div>
                  <div className="font-semibold">United States</div>
                </div>
                <div>
                  <div className="text-sm opacity-80">Valid Until</div>
                  <div className="font-semibold">Dec 31, 2024</div>
                </div>
                <div>
                  <div className="text-sm opacity-80">ID Number</div>
                  <div className="font-semibold">ST-2024-001234</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TouristPortal;