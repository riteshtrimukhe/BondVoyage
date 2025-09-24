import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, Shield, Users, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: 30px; 
        height: 30px; 
        border-radius: 50%; 
        background-color: ${color}; 
        border: 3px solid white; 
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-size: 12px;
        color: white;
      ">${icon}</div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

interface Tourist {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'safe' | 'caution' | 'emergency';
  lastUpdate: string;
  safetyScore: number;
}

interface RestrictedArea {
  id: string;
  name: string;
  type: 'restricted' | 'caution' | 'safe';
  coordinates: [number, number][];
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface GeofenceZone {
  id: string;
  name: string;
  center: [number, number];
  radius: number; // in meters
  type: 'safe' | 'caution' | 'danger';
  description: string;
}

// Sample data for Jaipur, India (adjust coordinates as needed)
const mockTourists: Tourist[] = [
  {
    id: 'T-DEMO-001',
    name: 'John Doe',
    location: { lat: 26.9124, lng: 75.7873 },
    status: 'safe',
    lastUpdate: '2 min ago',
    safetyScore: 95
  },
  {
    id: 'T-DEMO-002', 
    name: 'Emma Wilson',
    location: { lat: 26.9200, lng: 75.7900 },
    status: 'caution',
    lastUpdate: '5 min ago',
    safetyScore: 78
  },
  {
    id: 'T-DEMO-003',
    name: 'Hans Mueller', 
    location: { lat: 26.9050, lng: 75.7950 },
    status: 'emergency',
    lastUpdate: '1 min ago',
    safetyScore: 45
  },
  {
    id: 'T-DEMO-004',
    name: 'Marie Dubois',
    location: { lat: 26.9180, lng: 75.7800 },
    status: 'safe',
    lastUpdate: '3 min ago',
    safetyScore: 88
  },
  {
    id: 'T-DEMO-005',
    name: 'Carlos Rodriguez',
    location: { lat: 26.9100, lng: 75.7920 },
    status: 'safe',
    lastUpdate: '4 min ago',
    safetyScore: 92
  }
];

const restrictedAreas: RestrictedArea[] = [
  {
    id: 'restricted-1',
    name: 'Construction Zone',
    type: 'restricted',
    coordinates: [
      [26.9080, 75.7820],
      [26.9080, 75.7850],
      [26.9050, 75.7850],
      [26.9050, 75.7820]
    ],
    description: 'Active construction site - tourists prohibited',
    riskLevel: 'high'
  },
  {
    id: 'caution-1',
    name: 'Crowded Market Area',
    type: 'caution',
    coordinates: [
      [26.9150, 75.7880],
      [26.9150, 75.7920],
      [26.9120, 75.7920],
      [26.9120, 75.7880]
    ],
    description: 'High pedestrian traffic - exercise caution',
    riskLevel: 'medium'
  },
  {
    id: 'safe-1',
    name: 'Tourist Information Center',
    type: 'safe',
    coordinates: [
      [26.9200, 75.7860],
      [26.9200, 75.7890],
      [26.9180, 75.7890],
      [26.9180, 75.7860]
    ],
    description: 'Tourist assistance available 24/7',
    riskLevel: 'low'
  }
];

const geofenceZones: GeofenceZone[] = [
  {
    id: 'safe-zone-1',
    name: 'City Palace Safe Zone',
    center: [26.9260, 75.8237],
    radius: 500,
    type: 'safe',
    description: 'Well-monitored tourist area with security presence'
  },
  {
    id: 'caution-zone-1', 
    name: 'Traffic Junction',
    center: [26.9124, 75.7873],
    radius: 200,
    type: 'caution',
    description: 'Heavy traffic area - stay alert'
  },
  {
    id: 'danger-zone-1',
    name: 'Restricted Area',
    center: [26.9065, 75.7835],
    radius: 150,
    type: 'danger',
    description: 'Unauthorized access prohibited'
  }
];

interface InteractiveMapProps {
  tourists?: Tourist[];
  onTouristClick?: (tourist: Tourist) => void;
  showRestrictedAreas?: boolean;
  showGeofences?: boolean;
  showTourists?: boolean;
}

const MapControls: React.FC<{
  showRestrictedAreas: boolean;
  showGeofences: boolean;
  showTourists: boolean;
  onToggleAreas: (show: boolean) => void;
  onToggleGeofences: (show: boolean) => void;
  onToggleTourists: (show: boolean) => void;
}> = ({ 
  showRestrictedAreas, 
  showGeofences, 
  showTourists, 
  onToggleAreas, 
  onToggleGeofences, 
  onToggleTourists 
}) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] space-y-2">
      <Button
        size="sm"
        variant={showTourists ? "default" : "outline"}
        onClick={() => onToggleTourists(!showTourists)}
        className="w-full"
      >
        {showTourists ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
        Tourists
      </Button>
      <Button
        size="sm"
        variant={showGeofences ? "default" : "outline"}
        onClick={() => onToggleGeofences(!showGeofences)}
        className="w-full"
      >
        {showGeofences ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
        Geofences
      </Button>
      <Button
        size="sm"
        variant={showRestrictedAreas ? "default" : "outline"}
        onClick={() => onToggleAreas(!showRestrictedAreas)}
        className="w-full"
      >
        {showRestrictedAreas ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
        Areas
      </Button>
    </div>
  );
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  tourists = mockTourists,
  onTouristClick,
  showRestrictedAreas: initialShowAreas = true,
  showGeofences: initialShowGeofences = true,
  showTourists: initialShowTourists = true,
}) => {
  const { toast } = useToast();
  const [showRestrictedAreas, setShowRestrictedAreas] = useState(initialShowAreas);
  const [showGeofences, setShowGeofences] = useState(initialShowGeofences);
  const [showTourists, setShowTourists] = useState(initialShowTourists);

  const getAreaColor = (type: string) => {
    switch (type) {
      case 'restricted': return '#ef4444'; // red
      case 'caution': return '#f59e0b'; // amber  
      case 'safe': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  };

  const getGeofenceColor = (type: string) => {
    switch (type) {
      case 'safe': return '#10b981'; // green
      case 'caution': return '#f59e0b'; // amber
      case 'danger': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getTouristIcon = (status: string) => {
    switch (status) {
      case 'safe': return createCustomIcon('#10b981', '👤');
      case 'caution': return createCustomIcon('#f59e0b', '⚠️');
      case 'emergency': return createCustomIcon('#ef4444', '🚨');
      default: return createCustomIcon('#6b7280', '👤');
    }
  };

  const handleTouristClick = (tourist: Tourist) => {
    if (onTouristClick) {
      onTouristClick(tourist);
    } else {
      toast({
        title: `Tourist: ${tourist.name}`,
        description: `Status: ${tourist.status.toUpperCase()} | Safety Score: ${tourist.safetyScore} | Last Update: ${tourist.lastUpdate}`,
      });
    }
  };

  // Center map on Jaipur
  const center: [number, number] = [26.9124, 75.7873];

  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={center} 
        zoom={14} 
        className="h-full w-full rounded-lg"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Geofence Zones */}
        {showGeofences && geofenceZones.map(zone => (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            pathOptions={{
              color: getGeofenceColor(zone.type),
              fillColor: getGeofenceColor(zone.type),
              fillOpacity: 0.1,
              weight: 2,
              opacity: 0.6
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{zone.name}</h3>
                <p className="text-sm text-gray-600">{zone.description}</p>
                <Badge 
                  variant={zone.type === 'safe' ? 'default' : zone.type === 'caution' ? 'secondary' : 'destructive'}
                  className="mt-1"
                >
                  {zone.type.toUpperCase()}
                </Badge>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Restricted Areas */}
        {showRestrictedAreas && restrictedAreas.map(area => (
          <Polygon
            key={area.id}
            positions={area.coordinates}
            pathOptions={{
              color: getAreaColor(area.type),
              fillColor: getAreaColor(area.type),
              fillOpacity: 0.2,
              weight: 2
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{area.name}</h3>
                <p className="text-sm text-gray-600">{area.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={area.type === 'safe' ? 'default' : area.type === 'caution' ? 'secondary' : 'destructive'}
                  >
                    {area.type.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    Risk: {area.riskLevel}
                  </Badge>
                </div>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* Tourist Markers */}
        {showTourists && tourists.map(tourist => (
          <Marker
            key={tourist.id}
            position={[tourist.location.lat, tourist.location.lng]}
            icon={getTouristIcon(tourist.status)}
            eventHandlers={{
              click: () => handleTouristClick(tourist)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{tourist.name}</h3>
                <p className="text-sm text-gray-600">ID: {tourist.id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={tourist.status === 'safe' ? 'default' : tourist.status === 'caution' ? 'secondary' : 'destructive'}
                  >
                    {tourist.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    Score: {tourist.safetyScore}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Updated: {tourist.lastUpdate}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Controls */}
      <MapControls
        showRestrictedAreas={showRestrictedAreas}
        showGeofences={showGeofences}
        showTourists={showTourists}
        onToggleAreas={setShowRestrictedAreas}
        onToggleGeofences={setShowGeofences}
        onToggleTourists={setShowTourists}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Card className="p-2">
          <div className="text-xs font-semibold mb-2">Legend</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Safe Zone/Tourist</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Caution Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Danger/Emergency</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveMap;
export type { Tourist, RestrictedArea, GeofenceZone };