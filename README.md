# 🌾 Harvest Direct - E-commerce Platform

A comprehensive e-commerce platform connecting farmers and consumers through an innovative, technology-driven marketplace with robust admin management capabilities.

## 🚀 Features

- **Product Catalog** - Browse premium agricultural products
- **Farmer Profiles** - Meet the farmers behind the products
- **Shopping Cart** - Seamless shopping experience
- **Payment Processing** - Secure Razorpay integration + Cash on Delivery
- **User Authentication** - JWT-based secure login system
- **Admin Panel** - Complete management dashboard
- **Review System** - Product reviews after delivery
- **Contact Management** - Customer inquiry handling

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT + bcrypt
- **Payments**: Razorpay integration
- **Deployment**: Render (free tier)

## 🏃‍♂️ Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Razorpay keys and database URL

# Push database schema
npm run db:push

# Start development server
npm run dev
```

## 🌐 Environment Variables

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

## 📱 Admin Access

- **URL**: `/admin`
- **Default Credentials**: admin@example.com / admin123

## 🎯 Live Demo

Visit the live application: [Your App URL will be here after deployment]

---

Built with ❤️ for sustainable agriculture and local farmers.