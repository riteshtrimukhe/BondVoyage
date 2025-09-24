import { Shield, Globe, CheckCircle, Calendar, User, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TouristCardProps {
  touristId: string;
  name: string;
  nationality: string;
  passportNumber?: string;
  registrationDate?: string;
  status?: 'active' | 'expired' | 'suspended';
  blockchainHash?: string;
  storageKey?: string;
}

const TouristCard = ({
  touristId,
  name,
  nationality,
  passportNumber,
  registrationDate,
  status = 'active',
  blockchainHash,
  storageKey
}: TouristCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-safe';
      case 'expired':
        return 'status-warning';
      case 'suspended':
        return 'status-danger';
      default:
        return 'status-safe';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'suspended':
        return 'Suspended';
      default:
        return 'Active';
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Digital Tourist ID
        </CardTitle>
        <CardDescription>
          Blockchain-secured digital identity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Digital ID Card */}
          <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-6 w-6" />
                <span className="font-semibold">SAFE TOUR ID</span>
              </div>
              <Badge className={`bg-white/20 text-white ${getStatusColor(status)}`}>
                {getStatusText(status)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm opacity-80">Tourist Name</div>
                <div className="font-semibold text-lg">{name}</div>
              </div>
              <div>
                <div className="text-sm opacity-80">Nationality</div>
                <div className="font-semibold">{nationality}</div>
              </div>
              <div>
                <div className="text-sm opacity-80">Tourist ID</div>
                <div className="font-semibold font-mono">{touristId}</div>
              </div>
              <div>
                <div className="text-sm opacity-80">Status</div>
                <div className="font-semibold">{getStatusText(status)}</div>
              </div>
            </div>

            {passportNumber && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-sm opacity-80">Passport Number</div>
                <div className="font-semibold font-mono">{passportNumber.replace(/(.{2})(.{6})(.*)/, '$1****$3')}</div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {registrationDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Registered</div>
                  <div className="text-muted-foreground">
                    {new Date(registrationDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="font-medium">Verification</div>
                <div className="text-green-600">Blockchain Verified</div>
              </div>
            </div>
          </div>

          {/* Blockchain Details (Collapsible) */}
          {(blockchainHash || storageKey) && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Blockchain Details
              </summary>
              <div className="mt-2 space-y-2 text-xs">
                {blockchainHash && (
                  <div className="flex justify-between items-center p-2 bg-accent rounded">
                    <span className="text-muted-foreground">Document Hash:</span>
                    <code className="bg-background px-2 py-1 rounded">
                      {blockchainHash.slice(0, 16)}...
                    </code>
                  </div>
                )}
                {storageKey && (
                  <div className="flex justify-between items-center p-2 bg-accent rounded">
                    <span className="text-muted-foreground">Storage Key:</span>
                    <code className="bg-background px-2 py-1 rounded text-xs">
                      {storageKey.length > 20 ? `${storageKey.slice(0, 20)}...` : storageKey}
                    </code>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Verification Badge */}
          <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Identity Verified & Secured</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TouristCard;