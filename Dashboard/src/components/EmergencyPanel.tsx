import { useState } from 'react';
import { Phone, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { touristAPI, type PanicEventData } from '@/lib/api/touristApi';

interface EmergencyPanelProps {
  touristId: string;
  touristName?: string;
}

const EmergencyPanel = ({ touristId, touristName }: EmergencyPanelProps) => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lon: number } | null>(null);
  const { toast } = useToast();

  const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setLastLocation(location);
          resolve(location);
        },
        (error) => {
          // Fallback to demo coordinates (Jaipur, India)
          const fallbackLocation = { lat: 26.9124, lon: 75.7873 };
          setLastLocation(fallbackLocation);
          resolve(fallbackLocation);
        }
      );
    });
  };

  const handleSOS = async () => {
    setIsLoading(true);
    setIsEmergency(true);

    try {
      const location = await getCurrentLocation();
      
      const panicData: PanicEventData = {
        touristId,
        location,
        deviceId: `D-WEB-${Date.now()}`,
        source: 'web',
        panicType: 'manual',
        additionalData: {
          batteryLevel: 100, // Web browser doesn't have battery info
          networkStrength: 'good',
          nearbyDevices: 0,
          lastKnownActivity: 'web_browsing'
        }
      };

      const result = await touristAPI.reportPanicEvent(panicData);
      
      toast({
        title: "🚨 SOS Alert Sent!",
        description: `Emergency services have been notified. Event ID: ${result.eventId}`,
        variant: "destructive",
      });

      // Auto-reset emergency state after 30 seconds
      setTimeout(() => {
        setIsEmergency(false);
      }, 30000);

    } catch (error) {
      console.error('SOS error:', error);
      toast({
        title: "SOS Failed",
        description: error instanceof Error ? error.message : "Failed to send emergency alert. Please try again.",
        variant: "destructive",
      });
      setIsEmergency(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEmergency(false);
    toast({
      title: "Emergency Cancelled",
      description: "Emergency alert has been cancelled.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Emergency SOS Button */}
      <Card className={`card-gradient ${isEmergency ? 'border-red-500 bg-red-50' : 'border-red-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Emergency SOS
          </CardTitle>
          <CardDescription>
            {isEmergency 
              ? "Emergency alert is active. Authorities have been notified."
              : "Tap to send immediate location to authorities and emergency contacts"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEmergency ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-red-600 animate-pulse">
                <AlertTriangle className="h-6 w-6" />
                <span className="font-semibold text-lg">EMERGENCY ACTIVE</span>
                <AlertTriangle className="h-6 w-6" />
              </div>
              
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Help is on the way!</strong><br />
                  Emergency services have been contacted with your location.
                  {touristName && ` Tourist: ${touristName}`}
                </p>
                {lastLocation && (
                  <div className="mt-2 text-xs text-red-700">
                    <MapPin className="inline h-3 w-3 mr-1" />
                    Location sent: {lastLocation.lat.toFixed(4)}, {lastLocation.lon.toFixed(4)}
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
              >
                Cancel Emergency
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleSOS} 
              variant="destructive" 
              className="w-full text-lg py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-6 w-6 animate-spin" />
                  Sending SOS...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-6 w-6" />
                  SOS - Emergency Alert
                </>
              )}
            </Button>
          )}
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
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div>
                <div className="font-medium">Emergency Services</div>
                <div className="text-sm text-muted-foreground">National Emergency</div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="destructive">911</Badge>
                <Button variant="outline" size="sm" onClick={() => window.open('tel:911')}>
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div>
                <div className="font-medium">Tourist Helpline</div>
                <div className="text-sm text-muted-foreground">24/7 Tourist Support</div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">+1-800-TOURIST</Badge>
                <Button variant="outline" size="sm" onClick={() => window.open('tel:+18008687478')}>
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyPanel;