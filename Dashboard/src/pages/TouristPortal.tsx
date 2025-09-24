import { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  Loader2,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { touristAPI, type TouristRegistrationResponse } from '@/lib/api/touristApi';

// Form data interface
interface TouristFormData {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  phoneNumber: string;
  checkinDate: string;
  checkoutDate: string;
  emergencyContact: string;
}

const TouristPortal = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState<TouristRegistrationResponse & {
    touristInfo: {
      touristId: string;
      name: string;
      nationality: string;
      passportNumber: string;
    };
  } | null>(null);
  const [formData, setFormData] = useState<TouristFormData>({
    firstName: '',
    lastName: '',
    passportNumber: '',
    nationality: '',
    phoneNumber: '',
    checkinDate: '',
    checkoutDate: '',
    emergencyContact: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof TouristFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateTouristId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `T-DEMO-${timestamp}-${random}`;
  };

  const handleRegistration = async () => {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'passportNumber', 'nationality', 'phoneNumber'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof TouristFormData]);
    
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
      const touristId = generateTouristId();
      const registrationPayload = {
        touristId,
        name: `${formData.firstName} ${formData.lastName}`,
        nationality: formData.nationality,
        passportNumber: formData.passportNumber,
        phoneNumber: formData.phoneNumber,
        checkinDate: formData.checkinDate,
        checkoutDate: formData.checkoutDate,
        emergencyContact: formData.emergencyContact,
        kycDocuments: {
          passport: "demo_passport_base64",
          visa: "demo_visa_base64", 
          photo: "demo_photo_base64"
        }
      };

      // Call backend API using the utility
      const result = await touristAPI.registerTourist(registrationPayload);
      
      setRegistrationData({
        ...result,
        touristInfo: {
          touristId,
          name: registrationPayload.name,
          nationality: formData.nationality,
          passportNumber: formData.passportNumber
        }
      });
      setIsRegistered(true);
      
      toast({
        title: "Registration Successful!",
        description: "Your digital tourist ID has been created and secured on blockchain.",
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "There was an error creating your digital ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Success page after registration
  if (isRegistered && registrationData) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl w-fit mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-green-600">Registration Successful!</h1>
            <p className="text-xl text-muted-foreground">
              Your digital tourist ID has been created and secured on blockchain
            </p>
          </div>

          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Shield className="mr-2 h-6 w-6" />
                Digital Tourist ID Created
              </CardTitle>
              <CardDescription>
                Blockchain-secured digital identity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                      <div className="font-semibold">{registrationData.touristInfo.name}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Nationality</div>
                      <div className="font-semibold">{registrationData.touristInfo.nationality}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Tourist ID</div>
                      <div className="font-semibold">{registrationData.touristInfo.touristId}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Status</div>
                      <div className="font-semibold">Active</div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Blockchain Registration Details</h3>
                  <div className="bg-accent p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Transaction ID:</span>
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {registrationData.blockchainRecord?.id || 'N/A'}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Storage Key:</span>
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {registrationData.kycStorage?.storageKey || 'N/A'}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Document Hash:</span>
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {registrationData.kycStorage?.documentHash?.slice(0, 16) || 'N/A'}...
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Timestamp:</span>
                      <span className="text-xs">
                        {registrationData.kycStorage?.timestamp ? 
                          new Date(registrationData.kycStorage.timestamp).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Important:</strong> Your digital ID is now active and secured on blockchain. 
                    Keep your tourist ID number safe as you'll need it for accessing safety services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Registration form
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
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName" 
                  placeholder="John" 
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe" 
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passport">Passport Number *</Label>
              <Input 
                id="passport" 
                placeholder="A12345678" 
                value={formData.passportNumber}
                onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="American">United States</SelectItem>
                    <SelectItem value="British">United Kingdom</SelectItem>
                    <SelectItem value="Canadian">Canada</SelectItem>
                    <SelectItem value="Australian">Australia</SelectItem>
                    <SelectItem value="German">Germany</SelectItem>
                    <SelectItem value="French">France</SelectItem>
                    <SelectItem value="Italian">Italy</SelectItem>
                    <SelectItem value="Spanish">Spain</SelectItem>
                    <SelectItem value="Indian">India</SelectItem>
                    <SelectItem value="Chinese">China</SelectItem>
                    <SelectItem value="Japanese">Japan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  placeholder="+1 (555) 123-4567" 
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkin">Check-in Date</Label>
                <Input 
                  id="checkin" 
                  type="date" 
                  value={formData.checkinDate}
                  onChange={(e) => handleInputChange('checkinDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout">Check-out Date</Label>
                <Input 
                  id="checkout" 
                  type="date" 
                  value={formData.checkoutDate}
                  onChange={(e) => handleInputChange('checkoutDate', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency">Emergency Contact</Label>
              <Input 
                id="emergency" 
                placeholder="Emergency contact name and phone" 
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              />
            </div>

            <Button 
              onClick={handleRegistration} 
              variant="hero" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Digital Tourist ID...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Create Digital Tourist ID
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TouristPortal;