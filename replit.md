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
- **Data Storage**: Currently uses in-memory storage for development, designed for PostgreSQL integration.
- **API Routes**: Handles CRUD operations for products, farmer information retrieval, and shopping cart actions.
- **Data Schemas**: Defined for Products, Farmers, Cart, Testimonials, and Newsletter subscriptions.
- **Authentication**: Includes SMS OTP verification for registration and password changes, integrating with Twilio.
- **Admin Functionality**: Features for managing orders and processing order cancellation requests.

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