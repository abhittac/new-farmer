# Harvest Direct: Farm-to-Table E-commerce Platform

## Overview

Harvest Direct is a full-stack e-commerce application that connects consumers directly with traditional farmers, enabling them to purchase authentic, preservative-free products like coffee, spices, and grains. The platform focuses on showcasing the stories behind traditional farming methods and providing a seamless shopping experience. The application now includes SMS OTP verification for enhanced security during user registration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a client-server architecture:

1. **Frontend**: React-based SPA (Single Page Application) using modern UI components from shadcn/ui and styled with Tailwind CSS.

2. **Backend**: Express.js server handling API requests and serving the frontend.

3. **Data Layer**: Drizzle ORM with a PostgreSQL database (configured but not fully implemented).

4. **State Management**: Combination of React Query for server state and React Context for local state.

5. **Routing**: Uses Wouter for client-side routing.

The application is designed to be deployed on Replit with configurations for both development and production environments.

## Key Components

### Frontend

1. **Pages**:
   - Home (`client/src/pages/home.tsx`): Landing page showcasing featured products and farmers
   - Product Detail (`client/src/pages/product-detail.tsx`): Detailed view of a specific product
   - All Products (`client/src/pages/all-products.tsx`): Product catalog with filtering capabilities
   - All Farmers (`client/src/pages/all-farmers.tsx`): Directory of farmers with their stories
   - Checkout (`client/src/pages/checkout.tsx`): Order processing and payment

2. **Components**:
   - UI Components: Extensive collection of reusable UI components using shadcn
   - Cart: Shopping cart functionality with add/remove/update capabilities
   - ProductCard: Card displaying product information
   - FarmerCard: Card displaying farmer information
   - Layout: Common layout wrapper for consistent header and footer

3. **Context**:
   - CartContext (`client/src/context/CartContext.tsx`): Manages cart state and operations

### Backend

1. **API Routes** (`server/routes.ts`):
   - Product routes: CRUD operations for products
   - Farmer routes: Retrieve farmer information
   - Cart routes: Manage shopping cart actions

2. **Data Storage** (`server/storage.ts`):
   - In-memory storage implementation for development
   - Interface prepared for database integration

3. **Data Schemas** (`shared/schema.ts`):
   - Product schema
   - Farmer schema
   - Cart schema
   - Testimonial schema
   - Newsletter subscription schema

## Data Flow

1. **Product Browsing**:
   - Frontend makes API requests to fetch products/farmers
   - React Query caches the results
   - User interacts with products (filtering, viewing details)

2. **Shopping Cart**:
   - User adds items to cart
   - CartContext manages local cart state
   - Cart data is synchronized with server via API calls
   - Cart persists using session ID stored in localStorage

3. **Checkout Process**:
   - Form data validation using React Hook Form and Zod
   - Order submission via API
   - Success/failure handling

## External Dependencies

### Frontend
- React and React DOM for UI
- Tailwind CSS for styling
- shadcn/ui components (based on Radix UI)
- React Query for data fetching
- Wouter for routing
- Framer Motion for animations
- React Hook Form and Zod for form validation

### Backend
- Express.js for API server
- Drizzle ORM for database operations
- Vite for development and building

## Deployment Strategy

The application is configured for deployment on Replit:

1. **Development Mode**:
   - `npm run dev` starts both backend and frontend in development mode
   - Vite provides hot module reloading

2. **Production Mode**:
   - `npm run build` builds both frontend and backend
   - Frontend assets are built to `dist/public`
   - Backend is bundled to `dist/index.js`
   - `npm run start` serves the production build

3. **Database**:
   - Configured to use PostgreSQL, but currently using in-memory storage
   - Database URL is expected in environment variables

The deployment is configured via `.replit` file, which specifies the necessary Replit modules (Node.js, PostgreSQL) and deployment settings.

## Recent Changes

### SMS OTP Verification Implementation (July 2, 2025)

Added comprehensive SMS OTP verification system for enhanced security:

**Backend Implementation:**
- Created Twilio SMS service (`server/smsService.ts`) for sending and verifying OTP codes
- Added SMS verification database table for tracking OTP codes with expiration
- Updated user schema to include mobile number and mobile verification status
- Implemented OTP verification API endpoints (`/api/auth/send-otp`, `/api/auth/verify-otp`)
- Enhanced registration process to require mobile number and OTP verification

**Frontend Implementation:**
- Added mobile number field to registration form (positioned between email and password)
- Created reusable OTP input component (`client/src/components/ui/otp-input.tsx`)
- Enhanced registration flow with two-step process: form submission → OTP verification
- Added proper validation for 10-digit Indian mobile numbers (starting with 6-9)
- Implemented user-friendly OTP verification UI with resend functionality

**Security Features:**
- OTP codes expire after 10 minutes
- Mobile number format validation (Indian mobile numbers)
- Proper error handling for invalid/expired OTP codes
- Secure OTP generation and verification process

**External Dependencies:**
- Twilio API integration for SMS services
- Required environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

### Password Change with SMS OTP Feature (July 2, 2025)

Added secure password change functionality to user profile section:

**Backend Implementation:**
- Created `/api/auth/change-password` endpoint with authentication required
- Integrated with existing SMS OTP verification system
- Added current password verification before allowing change
- Secure password hashing using bcrypt

**Frontend Implementation:**
- Enhanced profile page with dedicated password change card
- Two-step process: password form → SMS OTP verification
- Reusable OTP input component integration
- User-friendly interface with proper error handling and loading states
- Cancel functionality to abort password change process

**Security Features:**
- Current password verification required
- SMS OTP verification for additional security
- Proper error messaging for invalid attempts
- Secure password validation and confirmation matching

### Migration to Replit Environment (July 23, 2025)

Successfully migrated the project from Replit Agent to the standard Replit environment:

**Backend Configuration Changes:**
- Updated CORS configuration to support Replit domains (.replit.dev, .repl.co, .replit.app)
- Configured server to bind to 0.0.0.0:5000 for Replit compatibility
- Added proper TypeScript types for Express middleware (@types/cors, @types/morgan)
- Fixed environment variable handling for Replit deployment

**Frontend Configuration Changes:**
- Updated VITE_API_URL to use empty string for same-origin requests
- Fixed API communication issues by removing localhost dependencies
- Resolved TypeScript type issues in components

**Key Accomplishments:**
- All API endpoints working correctly (products, farmers, categories, cart, etc.)
- Database connection and seed data initialization successful
- Vite development server with hot module reloading functional
- React application loading and displaying data properly
- Full e-commerce functionality maintained including SMS OTP features

**Application Status:**
- Server running successfully on port 5000
- Frontend React application loading components
- API communication working (200 responses from all endpoints)
- Database operations functional with existing seed data
- Unit display system working correctly with proper quantity formatting
- Ready for deployment and further development

### Unit Display Fix (July 23, 2025)

**Issue Resolved:** Product unit display inconsistency where some products weren't showing units properly on detail pages.

**Solution Implemented:**
- Created centralized `formatUnit` utility function in `client/src/utils/formatUnit.ts`
- Updated function to include quantity in unit display (e.g., "3 L", "500 Gram", "2 Pcs")
- Modified ProductCard and ProductDetail components to show complete unit information
- Removed duplicate quantity display since it's now integrated into the unit

**Unit Formatting Rules:**
- "l" → "3 L" (shows quantity + formatted unit)
- "kg" → "1 KG" 
- "gram" → "500 Gram"
- "pcs" → "2 Pcs" or "1 Piece" (singular for quantity 1)

**Result:** Products now display prices as stored in database without conversion:
- "₹6.95/500 Gram" instead of "₹0.01/Gram"  
- "₹10.50/3 L" instead of "₹3.50/L"
- "₹12.50/2 Pcs" instead of "₹6.25/Piece"

### Order Cancellation Request System (July 23, 2025)

Implemented a comprehensive order cancellation request system allowing customers to request order cancellations directly from their order history and admins to process them:

**Database Implementation:**
- Created database migration (0005_order_cancellation_requests.sql) extending orders table
- Added cancellation tracking fields: cancellationRequestedAt, cancellationReason, cancellationApprovedAt, cancellationApprovedBy, adminNotes
- Extended customer information fields: customerName, customerEmail, customerPhone for better tracking

**Backend API Implementation:**
- Created customer cancellation request endpoint: POST /api/orders/:id/request-cancellation
- Implemented admin endpoints: GET /api/admin/orders/pending/cancellation and POST /api/admin/orders/:id/process-cancellation
- Added comprehensive order cancellation handlers in server/admin/orders.ts
- Integrated proper authentication middleware for secure access

**Frontend Implementation:**
- **Order History Integration:** Added cancellation button directly in order history page for eligible orders
- **Customer Cancellation Modal:** Modal dialog with reason input and validation for seamless cancellation requests
- **Admin Management Dashboard:** Built admin interface (/admin/order-cancellations) for processing requests
- **Admin Navigation:** Added admin navigation menu item with XCircle icon for order cancellations
- Implemented proper error handling and user feedback throughout the workflow

**Complete Workflow:**
1. Customer views order history and sees "Cancel Order" button for eligible orders (pending/confirmed/processing)
2. Customer clicks button, fills cancellation reason in modal dialog, and submits request
3. Request appears in admin panel cancellation section with order details and customer reason
4. Admin can approve or reject with notes through dedicated admin interface
5. Order status updates accordingly with complete audit trail

**Security Features:**
- Only orders with status 'processing', 'confirmed', or 'pending' can be cancelled
- Comprehensive validation of cancellation requests (minimum 10 characters for reason)
- Admin authentication required for processing requests
- Detailed audit trail with timestamps and admin notes

**User Experience:**
- **Seamless Integration:** Cancellation button appears contextually in order history
- **Intuitive Interface:** Modal dialog with clear instructions and validation
- **Admin Efficiency:** Clean admin interface with request review and approval/rejection workflow
- **Real-time Updates:** Proper status indicators and user feedback messages
- **Mobile-responsive:** Design consistent with existing application across all devices

### Migration to Replit Environment (August 13, 2025)

Successfully completed migration from Replit Agent to the standard Replit environment:

**Infrastructure Changes:**
- Fixed CORS configuration to support Replit domains (.replit.dev, .repl.co, .replit.app)
- Configured server to bind to 0.0.0.0:5000 for proper Replit compatibility
- Resolved CORS middleware errors by simplifying origin validation logic
- Enhanced same-origin request handling for better compatibility
- Added proper TypeScript types for cors and morgan packages

**Compatibility Improvements:**
- Enhanced CORS to allow localhost development and Replit domains
- Proper port configuration for Replit deployment
- Fixed server startup configuration for both development and production modes
- Maintained existing database connections and API functionality
- Resolved 500 Internal Server Errors caused by CORS configuration

**Migration Results:**
- All packages installed and configured correctly
- Server running successfully on port 5000 with database connectivity
- All API endpoints responding correctly (products, farmers, cart, auth, admin)
- Frontend-backend communication working perfectly
- Vite development server connected and operational
- Complete e-commerce functionality verified including SMS OTP and admin features
- Project ready for deployment and further development