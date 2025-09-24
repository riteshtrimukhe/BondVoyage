import { useState } from 'react';
import { Calendar, MapPin, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { touristAPI, type ItineraryData } from '@/lib/api/touristApi';

interface ItineraryManagerProps {
  touristId: string;
}

interface ItineraryItem {
  id: string;
  location: string;
  activity: string;
  accommodation: string;
}

const ItineraryManager = ({ touristId }: ItineraryManagerProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnchored, setIsAnchored] = useState(false);
  const { toast } = useToast();

  const addItineraryItem = () => {
    const newItem: ItineraryItem = {
      id: Date.now().toString(),
      location: '',
      activity: '',
      accommodation: ''
    };
    setItems([...items, newItem]);
  };

  const updateItineraryItem = (id: string, field: keyof Omit<ItineraryItem, 'id'>, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItineraryItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleAnchorItinerary = async () => {
    if (!startDate || !endDate || items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in dates and add at least one itinerary item.",
        variant: "destructive",
      });
      return;
    }

    const incompleteItems = items.filter(item => !item.location || !item.activity);
    if (incompleteItems.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in location and activity for all items.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const itineraryData: ItineraryData = {
        touristId,
        startDate,
        endDate,
        locations: items.map(item => item.location),
        activities: items.map(item => item.activity),
        accommodations: items.map(item => item.accommodation).filter(Boolean)
      };

      const result = await touristAPI.anchorItinerary(itineraryData);
      
      setIsAnchored(true);
      toast({
        title: "Itinerary Anchored Successfully!",
        description: `Your travel plan has been secured on blockchain. ID: ${result.itineraryId}`,
      });

    } catch (error) {
      console.error('Itinerary anchor error:', error);
      toast({
        title: "Anchoring Failed",
        description: error instanceof Error ? error.message : "Failed to anchor itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
          Itinerary Manager
        </CardTitle>
        <CardDescription>
          Plan and secure your travel itinerary on blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isAnchored}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isAnchored}
            />
          </div>
        </div>

        {/* Itinerary Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Itinerary Items</h3>
            {!isAnchored && (
              <Button onClick={addItineraryItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No itinerary items added yet</p>
              {!isAnchored && (
                <Button onClick={addItineraryItem} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Day {index + 1}</h4>
                    {!isAnchored && (
                      <Button
                        onClick={() => removeItineraryItem(item.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Location *</Label>
                      <Input
                        placeholder="e.g., Jaipur"
                        value={item.location}
                        onChange={(e) => updateItineraryItem(item.id, 'location', e.target.value)}
                        disabled={isAnchored}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Activity *</Label>
                      <Input
                        placeholder="e.g., City Palace tour"
                        value={item.activity}
                        onChange={(e) => updateItineraryItem(item.id, 'activity', e.target.value)}
                        disabled={isAnchored}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Accommodation</Label>
                    <Input
                      placeholder="e.g., Hotel Raj Palace"
                      value={item.accommodation}
                      onChange={(e) => updateItineraryItem(item.id, 'accommodation', e.target.value)}
                      disabled={isAnchored}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Anchor Button */}
        {!isAnchored && items.length > 0 && (
          <Button
            onClick={handleAnchorItinerary}
            variant="hero"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Calendar className="mr-2 h-5 w-5 animate-spin" />
                Anchoring Itinerary...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Anchor Itinerary on Blockchain
              </>
            )}
          </Button>
        )}

        {/* Success Message */}
        {isAnchored && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Badge className="status-safe">Anchored</Badge>
              <span className="text-sm font-medium text-green-800">
                Itinerary successfully secured on blockchain
              </span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              Your travel plan is now immutably recorded and can be verified by authorities if needed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItineraryManager;