import { emailService } from './emailService';

async function testEmailService() {
  console.log('Testing email service connection...');
  
  try {
    // Test connection
    const isConnected = await emailService.verifyConnection();
    console.log('Email service connection:', isConnected ? 'SUCCESS' : 'FAILED');
    
    if (isConnected) {
      console.log('✅ Email service is properly configured and ready to send emails');
      console.log('📧 Mailtrap SMTP connection established successfully');
    } else {
      console.log('❌ Email service connection failed');
      console.log('Check your .env file for correct Mailtrap credentials');
    }
    
  } catch (error) {
    console.error('Email service test failed:', error);
  }
}

// Run the test
testEmailService();