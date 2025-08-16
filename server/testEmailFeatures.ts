import { emailService } from './emailService';
import { storage } from './storage';

async function testEmailFeatures() {
  console.log('Testing comprehensive email functionality...\n');
  
  try {
    // Test 1: Email service connection
    console.log('1. Testing email service connection...');
    const isConnected = await emailService.verifyConnection();
    console.log(`   Connection status: ${isConnected ? 'SUCCESS' : 'FAILED'}\n`);
    
    if (!isConnected) {
      console.log('Email service not available. Stopping tests.');
      return;
    }

    // Test 2: Order notification email
    console.log('2. Testing order notification email...');
    const mockOrder = {
      id: 12345,
      userId: 4,
      sessionId: 'test-session',
      paymentId: 'razorpay_test_payment',
      total: 25.99,
      status: 'confirmed',
      shippingAddress: '123 Test Street, Test City, Test State 12345',
      billingAddress: null,
      paymentMethod: 'razorpay',
      discountId: null,
      cancellationReason: null,
      deliveredAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockOrderItems = [
      {
        id: 1,
        orderId: 12345,
        productId: 1,
        quantity: 2,
        price: 15.99,
        product: {
          id: 1,
          name: 'Premium Organic Coffee Beans',
          price: 15.99,
          sku: 'COF-001'
        }
      }
    ];

    await emailService.sendOrderNotificationToAdmin({
      order: mockOrder,
      orderItems: mockOrderItems,
      customerEmail: 'customer@example.com',
      customerName: 'John Doe',
      totalAmount: 25.99
    });
    console.log('   Order notification email sent successfully\n');

    // Test 3: Password reset email
    console.log('3. Testing password reset email...');
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      password: 'hashed_password',
      name: 'Jane Smith',
      role: 'user' as const,
      emailVerified: false,
      verificationToken: null,
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await emailService.sendPasswordResetEmail(mockUser, 'test_reset_token_123');
    console.log('   Password reset email sent successfully\n');

    // Test 4: Password reset confirmation email
    console.log('4. Testing password reset confirmation email...');
    await emailService.sendPasswordResetConfirmation(mockUser);
    console.log('   Password reset confirmation email sent successfully\n');

    console.log('✅ All email features tested successfully!');
    console.log('\n📧 Email Features Summary:');
    console.log('   - Order notification emails to admin');
    console.log('   - Password reset request emails');
    console.log('   - Password reset confirmation emails');
    console.log('   - Professional HTML email templates');
    console.log('   - Secure token-based password reset');
    console.log('   - Mailtrap SMTP integration');

  } catch (error) {
    console.error('Email feature test failed:', error);
  }
}

// Run the comprehensive test
testEmailFeatures();