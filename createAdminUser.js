// Script to create an admin user
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from 'ws';

// Configure neon for WebSocket support
neonConfig.webSocketConstructor = ws;

// Admin user details
const adminUser = {
  email: 'admin@example.com',
  password: '$2b$10$hvkzrOAfimB9M5aUNpU/uuji3HZqFp43nmygaYZBpa1o8fir60/OK', // hashed 'admin123'
  name: 'Admin User',
  role: 'admin',
  emailVerified: true
};

async function createAdminUser() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not set");
    }
    
    console.log('Connecting to database...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Execute raw SQL since we can't import TypeScript schema
    console.log('Checking if admin user exists...');
    const { rows: existingUsers } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [adminUser.email]
    );
    
    if (existingUsers.length > 0) {
      console.log('Admin user already exists');
      await pool.end();
      return;
    }
    
    console.log('Creating admin user...');
    const { rows: users } = await pool.query(
      'INSERT INTO users (email, password, name, role, email_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [adminUser.email, adminUser.password, adminUser.name, adminUser.role, adminUser.emailVerified]
    );
    
    console.log('Admin user created successfully:', users[0]);
    
    await pool.end();
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();