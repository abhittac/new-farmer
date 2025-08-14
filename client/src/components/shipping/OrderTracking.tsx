import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, MapPin, Calendar, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TrackingEvent {
  date: string;
  status: string;
  location: string;
}

interface TrackingInfo {
  trackingNumber: string;
  status: string;
  currentLocation: string;
  deliveryDate?: string;
  events: TrackingEvent[];
}

interface OrderTrackingProps {
  initialTrackingNumber?: string;
  className?: string;
}

export function OrderTracking({ initialTrackingNumber, className }: OrderTrackingProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const trackOrder = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Missing Tracking Number",
        description: "Please enter a tracking number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/shipping/track/${trackingNumber.trim()}`);
      const data = await response.json();

      if (data.success) {
        setTrackingInfo(data.data);
        toast({
          title: "Tracking Information Retrieved",
          description: `Status: ${data.data.status}`,
        });
      } else {
        setError(data.message || "Tracking information not found");
        setTrackingInfo(null);
      }
    } catch (error) {
      setError("Failed to retrieve tracking information");
      setTrackingInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingNumber) {
      trackOrder();
    }
  }, [initialTrackingNumber]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in transit':
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'picked up':
      case 'booked':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed':
      case 'returned':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Track Your Order
        </CardTitle>
        <CardDescription>
          Enter your tracking number to get real-time delivery updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number (e.g., IP123456789)"
            className="flex-1"
          />
          <Button 
            onClick={trackOrder} 
            disabled={loading || !trackingNumber.trim()}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Track
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {trackingInfo && (
          <div className="space-y-4">
            {/* Current Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Current Status</h3>
                  <Badge className={getStatusColor(trackingInfo.status)}>
                    {trackingInfo.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{trackingInfo.currentLocation}</span>
                </div>
                {trackingInfo.deliveryDate && (
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <Calendar className="h-4 w-4" />
                    <span>Expected Delivery: {formatDate(trackingInfo.deliveryDate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracking History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tracking History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingInfo.events.map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                        }`} />
                        {index < trackingInfo.events.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{event.status}</span>
                          <Badge variant="outline" className="text-xs">
                            {event.location}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(event.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tracking Number */}
            <div className="text-center text-sm text-gray-600">
              Tracking Number: <span className="font-mono">{trackingInfo.trackingNumber}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}