# Harvest Direct: Farm-to-Table E-commerce Platform

## Overview

Harvest Direct is a full-stack e-commerce platform connecting consumers directly with traditional farmers. Its primary purpose is to enable the purchase of authentic, preservative-free products like coffee, spices, and grains, while showcasing the stories behind traditional farming methods. The platform aims to provide a seamless and secure shopping experience, including features like SMS OTP verification for user registration and password changes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application employs a client-server architecture.

### Frontend
- **Framework**: React.js
- **UI Kit**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state, React Context for local state (e.g., CartContext)
- **Routing**: Wouter
- **Form Handling**: React Hook Form and Zod for validation
- **Animations**: Framer Motion

Core frontend components include pages for Home, Product Detail, All Products, All Farmers, and Checkout, along with reusable UI components, a Cart system, ProductCard, FarmerCard, and a consistent layout.

### Backend
- **Framework**: Express.js
- **ORM**: Drizzle ORM (configured for PostgreSQL)
- **Data Storage**: PostgreSQL database with Neon hosting for production data
- **API Routes**: Handles CRUD operations for products, farmer information retrieval, shopping cart actions, and shipping services
- **Data Schemas**: Defined for Products, Farmers, Cart, Testimonials, Newsletter subscriptions, and Orders
- **Authentication**: Includes SMS OTP verification for registration and password changes, integrating with Twilio
- **Admin Functionality**: Features for managing orders and processing order cancellation requests
- **Shipping Integration**: India Post API integration for real-time shipping rates, tracking, and COD services

### System Design Choices
- **Deployment**: Configured for deployment on Replit, supporting both development and production environments.
- **Data Flow**: Supports product browsing with caching, shopping cart management with local state and server synchronization, and a secure checkout process with form validation.
- **Security**: Implements SMS OTP verification with expiration, mobile number validation, secure password hashing (bcrypt), and authentication middleware for sensitive operations.
- **User Experience**: Focuses on intuitive interfaces, proper error handling, loading states, and mobile responsiveness.

## External Dependencies

### Frontend
- React
- React DOM
- Tailwind CSS
- shadcn/ui (Radix UI)
- React Query
- Wouter
- Framer Motion
- React Hook Form
- Zod

### Backend
- Express.js
- Drizzle ORM
- Vite (for development and building)
- Twilio API (for SMS OTP services)
- PostgreSQL (database, configured)
- India Post API (for shipping and tracking services)
- Razorpay (for payment processing)

## Recent Updates (August 16, 2025)

### Category and Subcategory Validation System (Latest)
- **Simplified Validation**: Only prevents exact duplicate category names (case-insensitive)
- **Category Uniqueness**: Only categories must have unique names among other categories
- **Subcategory Uniqueness**: Only subcategories must have unique names within their parent category
- **Flexible Naming**: "Rice Powder" allowed even if "Powder" exists as category/subcategory
- **Usage Protection**: Categories/subcategories cannot be deleted if used by products
- **Enhanced Deletion Errors**: Shows detailed table with product name, image, category, and subcategory when deletion blocked
- **Product Deletion Fix**: Resolved "No variants found" error, products can now be deleted without variants
- **VITE_BASE_URL Integration**: Completed image URL handling across all platform components

### Enhanced Product Management Improvements
- **Variant Management**: Fixed "Remove Variant" button to only show when multiple variants exist
- **Form Validation**: Fixed discount price validation to properly handle empty/null values with improved preprocessing
- **Deletion Safety**: Implemented proper deletion error modal with table format showing SKU and Order columns
- **Variant Deletion**: Added variant-specific deletion checking with order validation using existing `/api/admin/variants/:id` endpoint
- **User Experience**: Enhanced error messages and confirmation dialogs for both product and variant deletion

### Previous Updates (August 15, 2025)

### Migration Completion
- **Replit Agent to Replit Migration**: Successfully migrated project from Replit Agent to standard Replit environment
- **Bug Fix**: Fixed infinite image upload loop in enhanced product management due to stale state reference in `handleImageRemove` function
- **Security**: Ensured proper client/server separation and robust security practices
- **Performance**: Optimized image upload handling to prevent browser crashes from excessive network requests

## Previous Updates (August 14, 2025)

### India Post API Integration
- **Shipping Rate Calculator**: Real-time calculation of shipping costs using India Post services
  - Speed Post: ₹205 (4 days delivery)
  - Registered Post: ₹145 (7 days delivery)
  - Express Parcel: Available for bulk orders
- **Pincode Validation**: Validates Indian pincodes and provides location information
- **Order Tracking**: Real-time shipment tracking with status updates and location history
- **COD Support**: Cash on Delivery availability checking for different locations
- **Shipping Page**: Comprehensive shipping showcase at `/shipping` with calculator and tracking tools

### Technical Implementation
- Created `server/indiaPostApi.ts` for shipping service integration
- Added shipping API routes: `/api/shipping/validate-pincode`, `/api/shipping/calculate-rates`, `/api/shipping/track`
- Built React components: `ShippingCalculator` and `OrderTracking`
- Integrated fallback data for common Indian cities when external APIs are unavailable
- Added shipping page to main navigation