import { InsertDiscount } from '@shared/schema';

export const discountData: InsertDiscount[] = [
  {
    code: 'WELCOME20',
    type: 'percentage',
    value: 20,
    description: 'Welcome discount for new customers - 20% off first order',
    minPurchase: 50,
    usageLimit: 100,
    perUser: true,
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-12-31'),
    status: 'active',
    applicableProducts: 'all',
    applicableCategories: 'all'
  },
  {
    code: 'SUMMER15',
    type: 'percentage',
    value: 15,
    description: 'Summer sale - 15% off on all products',
    minPurchase: 0,
    usageLimit: 0, // unlimited
    perUser: false,
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-08-31'),
    status: 'active',
    applicableProducts: 'all',
    applicableCategories: 'all'
  },
  {
    code: 'FREESHIP',
    type: 'shipping',
    value: 100, // covers shipping cost
    description: 'Free shipping on orders above ₹75',
    minPurchase: 75,
    usageLimit: 0, // unlimited
    perUser: false,
    startDate: new Date('2025-05-15'),
    endDate: new Date('2025-12-15'),
    status: 'active',
    applicableProducts: 'all',
    applicableCategories: 'all'
  },
  {
    code: 'COFFEELOV',
    type: 'percentage',
    value: 25,
    description: 'Coffee lovers special - 25% off on coffee products',
    minPurchase: 30,
    usageLimit: 50,
    perUser: false,
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-07-31'),
    status: 'active',
    applicableProducts: 'selected',
    applicableCategories: 'Coffee & Tea'
  },
  {
    code: 'FLAT50',
    type: 'fixed',
    value: 50,
    description: 'Flat ₹50 off on orders above ₹200',
    minPurchase: 200,
    usageLimit: 200,
    perUser: true,
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-09-30'),
    status: 'active',
    applicableProducts: 'all',
    applicableCategories: 'all'
  },
  {
    code: 'HARVEST10',
    type: 'percentage',
    value: 10,
    description: 'Harvest season special - 10% off all products',
    minPurchase: 0,
    usageLimit: 0,
    perUser: false,
    startDate: new Date('2025-07-01'),
    endDate: new Date('2025-09-30'),
    status: 'scheduled',
    applicableProducts: 'all',
    applicableCategories: 'all'
  },
  {
    code: 'SPRING25',
    type: 'percentage',
    value: 25,
    description: 'Spring festival discount - 25% off',
    minPurchase: 100,
    usageLimit: 75,
    perUser: true,
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-04-30'),
    status: 'expired',
    applicableProducts: 'all',
    applicableCategories: 'all'
  },
  {
    code: 'BIGORDER',
    type: 'fixed',
    value: 100,
    description: 'Big order discount - ₹100 off on orders above ₹500',
    minPurchase: 500,
    usageLimit: 0,
    perUser: false,
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-12-31'),
    status: 'active',
    applicableProducts: 'all',
    applicableCategories: 'all'
  }
];