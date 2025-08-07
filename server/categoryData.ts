import { InsertCategory } from '@shared/schema';

export const categoryData: InsertCategory[] = [
  // Main Categories
  {
    name: "Coffee & Tea",
    slug: "coffee-tea",
    description: "Premium coffee beans and tea leaves from local farmers",
    parentId: null,
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Spices",
    slug: "spices",
    description: "Fresh and aromatic spices grown organically",
    parentId: null,
    isActive: true,
    sortOrder: 2
  },
  {
    name: "Grains",
    slug: "grains",
    description: "Nutritious grains and cereals",
    parentId: null,
    isActive: true,
    sortOrder: 3
  },
  {
    name: "Others",
    slug: "others",
    description: "Other agricultural products and specialties",
    parentId: null,
    isActive: true,
    sortOrder: 4
  }
];

export const subcategoryData: Omit<InsertCategory, 'parentId'>[] = [
  // Coffee & Tea Subcategories
  {
    name: "Arabica Coffee",
    slug: "arabica-coffee",
    description: "Premium arabica coffee beans",
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Robusta Coffee",
    slug: "robusta-coffee",
    description: "Strong robusta coffee beans",
    isActive: true,
    sortOrder: 2
  },
  {
    name: "Green Tea",
    slug: "green-tea",
    description: "Fresh green tea leaves",
    isActive: true,
    sortOrder: 3
  },
  {
    name: "Black Tea",
    slug: "black-tea",
    description: "Rich black tea varieties",
    isActive: true,
    sortOrder: 4
  },
  {
    name: "Herbal Tea",
    slug: "herbal-tea",
    description: "Natural herbal tea blends",
    isActive: true,
    sortOrder: 5
  },

  // Spices Subcategories
  {
    name: "Whole Spices",
    slug: "whole-spices",
    description: "Whole spices for grinding fresh",
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Ground Spices",
    slug: "ground-spices",
    description: "Freshly ground spice powders",
    isActive: true,
    sortOrder: 2
  },
  {
    name: "Spice Blends",
    slug: "spice-blends",
    description: "Traditional spice mix blends",
    isActive: true,
    sortOrder: 3
  },
  {
    name: "Medicinal Spices",
    slug: "medicinal-spices",
    description: "Spices with health benefits",
    isActive: true,
    sortOrder: 4
  },

  // Grains Subcategories
  {
    name: "Rice Varieties",
    slug: "rice-varieties",
    description: "Different types of rice",
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Wheat Products",
    slug: "wheat-products",
    description: "Wheat and wheat-based products",
    isActive: true,
    sortOrder: 2
  },
  {
    name: "Millets",
    slug: "millets",
    description: "Nutritious millet varieties",
    isActive: true,
    sortOrder: 3
  },
  {
    name: "Pulses & Lentils",
    slug: "pulses-lentils",
    description: "Protein-rich pulses and lentils",
    isActive: true,
    sortOrder: 4
  },

  // Others Subcategories
  {
    name: "Honey & Sweeteners",
    slug: "honey-sweeteners",
    description: "Natural honey and sweeteners",
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Oils & Ghee",
    slug: "oils-ghee",
    description: "Cold-pressed oils and pure ghee",
    isActive: true,
    sortOrder: 2
  },
  {
    name: "Dry Fruits & Nuts",
    slug: "dry-fruits-nuts",
    description: "Premium dry fruits and nuts",
    isActive: true,
    sortOrder: 3
  },
  {
    name: "Pickles & Preserves",
    slug: "pickles-preserves",
    description: "Traditional pickles and preserves",
    isActive: true,
    sortOrder: 4
  }
];