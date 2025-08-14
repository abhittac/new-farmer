import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Truck, Clock, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShippingRate {
  service: string;
  deliveryDays: number;
  cost: number;
  codAvailable: boolean;
}

interface ShippingCalculatorProps {
  weight?: number;
  cartTotal?: number;
  onRateSelected?: (rate: ShippingRate) => void;
}

export function ShippingCalculator({ 
  weight = 500, 
  cartTotal = 0, 
  onRateSelected 
}: ShippingCalculatorProps) {
  const [fromPincode, setFromPincode] = useState('560001'); // Default: Bangalore
  const [toPincode, setToPincode] = useState('');
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const { toast } = useToast();

  const calculateRates = async () => {
    if (!toPincode || toPincode.length !== 6) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/shipping/calculate-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromPincode,
          toPincode,
          weight,
          codAmount: cartTotal > 0 ? cartTotal : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setRates(data.rates);
        toast({
          title: "Shipping Rates Calculated",
          description: `Found ${data.rates.length} shipping options`,
        });
      } else {
        toast({
          title: "Calculation Failed",
          description: data.message || "Unable to calculate shipping rates",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate shipping rates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectRate = (rate: ShippingRate) => {
    setSelectedRate(rate);
    onRateSelected?.(rate);
    toast({
      title: "Shipping Method Selected",
      description: `${rate.service} - ₹${rate.cost}`,
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Calculate Shipping Rates
        </CardTitle>
        <CardDescription>
          Get real-time shipping rates from India Post
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">From Pincode</label>
            <Input
              value={fromPincode}
              onChange={(e) => setFromPincode(e.target.value)}
              placeholder="560001"
              maxLength={6}
            />
          </div>
          <div>
            <label className="text-sm font-medium">To Pincode</label>
            <Input
              value={toPincode}
              onChange={(e) => setToPincode(e.target.value)}
              placeholder="400001"
              maxLength={6}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Weight: {weight}g</span>
          {cartTotal > 0 && <span>Order Value: ₹{cartTotal}</span>}
        </div>

        <Button 
          onClick={calculateRates} 
          disabled={loading || !toPincode}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Calculate Shipping Rates
        </Button>

        {rates.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Available Shipping Options:</h3>
            {rates.map((rate, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-colors ${
                  selectedRate?.service === rate.service 
                    ? 'ring-2 ring-primary' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => selectRate(rate)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{rate.service}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{rate.deliveryDays} days</span>
                          {rate.codAvailable && (
                            <Badge variant="secondary" className="text-xs">
                              COD Available
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-semibold text-lg">
                        <IndianRupee className="h-4 w-4" />
                        {rate.cost}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedRate && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Selected:</strong> {selectedRate.service} - ₹{selectedRate.cost} 
              ({selectedRate.deliveryDays} days delivery)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}