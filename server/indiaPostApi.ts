import fetch from 'node-fetch';

/**
 * India Post API Integration for Shipping Services
 * Features: Rate calculation, COD availability, pincode validation, tracking
 */

export interface ShippingRate {
  service: string;
  deliveryDays: number;
  cost: number;
  codAvailable: boolean;
}

export interface PincodeInfo {
  pincode: string;
  city: string;
  district: string;
  state: string;
  codAvailable: boolean;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: string;
  currentLocation: string;
  deliveryDate?: string;
  events: Array<{
    date: string;
    status: string;
    location: string;
  }>;
}

export class IndiaPostService {
  private baseUrl = 'https://api.postalpincode.in';
  
  /**
   * Validate and get pincode information
   */
  async validatePincode(pincode: string): Promise<PincodeInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/pincode/${pincode}`);
      const data = await response.json() as any;
      
      if (data.Status === 'Success' && data.PostOffice && data.PostOffice.length > 0) {
        const postOffice = data.PostOffice[0];
        return {
          pincode: pincode,
          city: postOffice.Name,
          district: postOffice.District,
          state: postOffice.State,
          codAvailable: this.isCodAvailable(postOffice.State)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error validating pincode:', error);
      // Fallback for common Indian pincodes when API is unavailable
      return this.getFallbackPincodeInfo(pincode);
    }
  }
  
  /**
   * Fallback pincode validation for common Indian cities
   */
  private getFallbackPincodeInfo(pincode: string): PincodeInfo | null {
    const fallbackData: Record<string, Partial<PincodeInfo>> = {
      '560001': { city: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka' },
      '400001': { city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra' },
      '110001': { city: 'Delhi', district: 'Central Delhi', state: 'Delhi' },
      '600001': { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu' },
      '700001': { city: 'Kolkata', district: 'Kolkata', state: 'West Bengal' },
      '500001': { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
      '411001': { city: 'Pune', district: 'Pune', state: 'Maharashtra' },
      '380001': { city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat' },
    };
    
    const info = fallbackData[pincode];
    if (info) {
      return {
        pincode,
        city: info.city!,
        district: info.district!,
        state: info.state!,
        codAvailable: this.isCodAvailable(info.state!)
      };
    }
    
    return null;
  }

  /**
   * Calculate shipping rates based on weight, dimensions and destination pincode
   */
  async calculateShippingRates(
    fromPincode: string,
    toPincode: string,
    weight: number, // in grams
    codAmount?: number
  ): Promise<ShippingRate[]> {
    try {
      // Validate destination pincode first
      let pincodeInfo = await this.validatePincode(toPincode);
      if (!pincodeInfo) {
        // Use fallback for common pincodes
        pincodeInfo = this.getFallbackPincodeInfo(toPincode);
        if (!pincodeInfo) {
          throw new Error('Invalid destination pincode');
        }
      }

      const rates: ShippingRate[] = [];
      
      // Calculate rates based on India Post standard rates
      const baseWeight = Math.max(20, Math.ceil(weight / 50) * 50); // Minimum 20g, round up to next 50g
      
      // Speed Post rates
      const speedPostRate = this.calculateSpeedPostRate(baseWeight, fromPincode, toPincode);
      rates.push({
        service: 'Speed Post',
        deliveryDays: this.getDeliveryDays(fromPincode, toPincode, 'speed'),
        cost: speedPostRate,
        codAvailable: pincodeInfo.codAvailable
      });

      // Registered Post rates
      const registeredPostRate = this.calculateRegisteredPostRate(baseWeight, fromPincode, toPincode);
      rates.push({
        service: 'Registered Post',
        deliveryDays: this.getDeliveryDays(fromPincode, toPincode, 'registered'),
        cost: registeredPostRate,
        codAvailable: pincodeInfo.codAvailable
      });

      // Express Parcel rates (for heavier items)
      if (weight > 500) {
        const expressRate = this.calculateExpressParcelRate(baseWeight, fromPincode, toPincode);
        rates.push({
          service: 'Express Parcel',
          deliveryDays: this.getDeliveryDays(fromPincode, toPincode, 'express'),
          cost: expressRate,
          codAvailable: pincodeInfo.codAvailable
        });
      }

      // Add COD charges if applicable
      if (codAmount && pincodeInfo.codAvailable) {
        rates.forEach(rate => {
          if (rate.codAvailable) {
            rate.cost += this.calculateCodCharges(codAmount);
          }
        });
      }

      return rates.sort((a, b) => a.cost - b.cost);
    } catch (error) {
      console.error('Error calculating shipping rates:', error);
      throw error;
    }
  }

  /**
   * Generate shipping label (mock implementation - actual API integration needed)
   */
  async generateShippingLabel(orderDetails: {
    fromAddress: any;
    toAddress: any;
    weight: number;
    service: string;
    codAmount?: number;
  }): Promise<string> {
    // This would integrate with India Post's actual label generation API
    // For now, return a mock tracking number
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `IP${timestamp.toString().slice(-6)}${randomId}`;
  }

  /**
   * Track shipment (mock implementation)
   */
  async trackShipment(trackingNumber: string): Promise<TrackingInfo | null> {
    // This would integrate with India Post's tracking API
    // For now, return mock tracking data
    return {
      trackingNumber,
      status: 'In Transit',
      currentLocation: 'Mumbai Sorting Office',
      events: [
        {
          date: new Date().toISOString(),
          status: 'Picked up',
          location: 'Origin Post Office'
        },
        {
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'In transit',
          location: 'Mumbai Sorting Office'
        }
      ]
    };
  }

  private calculateSpeedPostRate(weight: number, fromPin: string, toPin: string): number {
    // India Post Speed Post rates (approximate)
    const baseRate = 40; // Base rate for first 50g
    const additionalWeight = Math.max(0, weight - 50);
    const additionalRate = Math.ceil(additionalWeight / 50) * 15;
    
    return baseRate + additionalRate;
  }

  private calculateRegisteredPostRate(weight: number, fromPin: string, toPin: string): number {
    // India Post Registered Post rates (approximate)
    const baseRate = 25; // Base rate for first 50g
    const additionalWeight = Math.max(0, weight - 50);
    const additionalRate = Math.ceil(additionalWeight / 50) * 10;
    
    return baseRate + additionalRate;
  }

  private calculateExpressParcelRate(weight: number, fromPin: string, toPin: string): number {
    // India Post Express Parcel rates (approximate)
    const baseRate = 60; // Base rate for first 500g
    const additionalWeight = Math.max(0, weight - 500);
    const additionalRate = Math.ceil(additionalWeight / 500) * 30;
    
    return baseRate + additionalRate;
  }

  private calculateCodCharges(amount: number): number {
    // COD charges: 2% of order value or minimum ₹30
    return Math.max(30, Math.ceil(amount * 0.02));
  }

  private getDeliveryDays(fromPin: string, toPin: string, service: string): number {
    // Simplified delivery time calculation
    const isSameState = fromPin.charAt(0) === toPin.charAt(0);
    
    switch (service) {
      case 'speed':
        return isSameState ? 2 : 4;
      case 'registered':
        return isSameState ? 4 : 7;
      case 'express':
        return isSameState ? 1 : 3;
      default:
        return 7;
    }
  }

  private isCodAvailable(state: string): boolean {
    // Most states support COD, excluding some remote areas
    const excludedStates = ['Andaman and Nicobar Islands', 'Lakshadweep'];
    return !excludedStates.includes(state);
  }
}

export const indiaPostService = new IndiaPostService();