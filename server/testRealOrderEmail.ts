import { emailService } from './emailService';
import { storage } from './storage';

async function testRealOrderEmailData() {
  console.log('Testing real order data in email notifications...\n');
  
  try {
    // Get a real order from the database using userId 4 (existing user)
    console.log('1. Fetching real orders from database...');
    const userOrders = await storage.getOrdersByUserId(4); // Using existing user ID
    
    if (userOrders.length === 0) {
      console.log('   No orders found for user. Testing with existing data...');
      return;
    }
    
    const latestOrder = userOrders[userOrders.length - 1];
    console.log(`   Found order #${latestOrder.id} with total: $${latestOrder.total}`);
    
    // Get real order items with product details
    console.log('2. Fetching order items and product details...');
    const orderItems = await storage.getOrderItemsByOrderId(latestOrder.id);
    const orderItemsWithProducts = await Promise.all(
      orderItems.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        console.log(`   - Item: ${product?.name || 'Unknown'} x${item.quantity} @ $${item.price}`);
        return {
          ...item,
          product: product
        };
      })
    );
    
    // Get customer details
    console.log('3. Fetching customer information...');
    const customer = await storage.getUserById(latestOrder.userId);
    console.log(`   Customer: ${customer?.name || 'Unknown'} (${customer?.email || 'No email'})`);
    
    // Send email with real data
    console.log('4. Sending order notification email with real data...');
    await emailService.sendOrderNotificationToAdmin({
      order: latestOrder,
      orderItems: orderItemsWithProducts,
      customerEmail: customer?.email || 'customer@example.com',
      customerName: customer?.name || 'Customer',
      totalAmount: latestOrder.total
    });
    
    console.log('✅ Order notification email sent with real order data!');
    console.log('\nReal Order Details Sent:');
    console.log(`   Order ID: #${latestOrder.id}`);
    console.log(`   Customer: ${customer?.name || 'Unknown'}`);
    console.log(`   Total Amount: $${latestOrder.total}`);
    console.log(`   Payment Method: ${latestOrder.paymentMethod}`);
    console.log(`   Status: ${latestOrder.status}`);
    console.log(`   Items Count: ${orderItemsWithProducts.length}`);
    
    orderItemsWithProducts.forEach((item, index) => {
      console.log(`   Item ${index + 1}: ${item.product?.name} x${item.quantity} = $${(item.quantity * item.price).toFixed(2)}`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the real order email test
testRealOrderEmailData();