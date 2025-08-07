import type { InsertSiteSetting } from "@shared/schema";

export const storeSettingsData: InsertSiteSetting[] = [
  // Store Information
  {
    key: "site_name",
    value: "HarvestDirect",
    type: "text",
    description: "Website name"
  },
  {
    key: "site_tagline", 
    value: "Fresh from Farm to Your Table",
    type: "text",
    description: "Website tagline"
  },
  {
    key: "site_logo",
    value: null,
    type: "image",
    description: "Website logo URL"
  },
  {
    key: "store_email",
    value: "contact@harvestdirect.com",
    type: "text",
    description: "Store contact email"
  },
  {
    key: "store_phone",
    value: "+1 (555) 123-4567",
    type: "text",
    description: "Store contact phone"
  },
  {
    key: "store_address",
    value: "123 Harvest Lane",
    type: "text",
    description: "Store address"
  },
  {
    key: "store_city",
    value: "Farmington",
    type: "text",
    description: "Store city"
  },
  {
    key: "store_state",
    value: "California",
    type: "text",
    description: "Store state"
  },
  {
    key: "store_zip",
    value: "90210",
    type: "text",
    description: "Store zip code"
  },
  {
    key: "store_country",
    value: "United States",
    type: "text",
    description: "Store country"
  },
  // Social Media Links
  {
    key: "social_facebook",
    value: "https://facebook.com/harvestdirect",
    type: "text",
    description: "Facebook page URL"
  },
  {
    key: "social_instagram",
    value: "https://instagram.com/harvestdirect",
    type: "text",
    description: "Instagram profile URL"
  },
  {
    key: "social_twitter",
    value: "https://twitter.com/harvestdirect",
    type: "text",
    description: "Twitter profile URL"
  },
  {
    key: "social_linkedin",
    value: "https://linkedin.com/company/harvestdirect",
    type: "text",
    description: "LinkedIn company page URL"
  },
  {
    key: "social_youtube",
    value: "https://youtube.com/@harvestdirect",
    type: "text",
    description: "YouTube channel URL"
  },
  {
    key: "social_website",
    value: "https://harvestdirect.com",
    type: "text",
    description: "Official website URL"
  }
];