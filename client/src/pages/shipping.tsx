import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShippingCalculator } from '@/components/shipping/ShippingCalculator';
import { OrderTracking } from '@/components/shipping/OrderTracking';
import { Package, Truck, MapPin, Clock, Shield, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shipping & Delivery Services
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Powered by India Post - Reliable, affordable, and nationwide delivery 
            for all your farm-fresh products from Harvest Direct.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Shipping Calculator */}
          <div className="space-y-6">
            <ShippingCalculator weight={500} cartTotal={1000} />
          </div>

          {/* Order Tracking */}
          <div className="space-y-6">
            <OrderTracking />
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Multiple Services</h3>
              <p className="text-sm text-gray-600">
                Speed Post, Registered Post, and Express Parcel options
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Pan-India Delivery</h3>
              <p className="text-sm text-gray-600">
                Delivery to all Indian pincodes with India Post network
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <IndianRupee className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">COD Available</h3>
              <p className="text-sm text-gray-600">
                Cash on Delivery option for most locations across India
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Secure & Insured</h3>
              <p className="text-sm text-gray-600">
                India Post's reliable tracking and insurance coverage
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Service Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Speed Post
              </CardTitle>
              <CardDescription>
                Fast delivery for urgent shipments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">2-4 days delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">COD Available</Badge>
                  <Badge variant="outline">Tracking Included</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Premium service with faster delivery and comprehensive tracking.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Registered Post
              </CardTitle>
              <CardDescription>
                Economical option with tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">4-7 days delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">COD Available</Badge>
                  <Badge variant="outline">Tracking Included</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Cost-effective shipping with proof of delivery and tracking.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Express Parcel
              </CardTitle>
              <CardDescription>
                For heavier items and bulk orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">1-3 days delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">COD Available</Badge>
                  <Badge variant="outline">Premium Handling</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Express service for large orders with priority handling.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipping Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Policy & Information</CardTitle>
            <CardDescription>
              Important details about our shipping and delivery process
            </CardDescription>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Shipping Charges</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Calculated based on weight and destination</li>
                  <li>• COD charges: 2% of order value (min ₹30)</li>
                  <li>• Free shipping on orders above ₹999</li>
                  <li>• Express delivery available for premium</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Delivery Timeline</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Same state: 1-2 days faster delivery</li>
                  <li>• Metro cities: Priority processing</li>
                  <li>• Remote areas: Additional 1-2 days</li>
                  <li>• Tracking updates every 24 hours</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cash on Delivery</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Available for most Indian pincodes</li>
                  <li>• Maximum COD limit: ₹50,000</li>
                  <li>• Valid ID required at delivery</li>
                  <li>• Exact change appreciated</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Packaging</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Eco-friendly packaging materials</li>
                  <li>• Vacuum sealed for freshness</li>
                  <li>• Temperature controlled for sensitive items</li>
                  <li>• Damage protection included</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}