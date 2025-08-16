import { Request, Response } from 'express';
import { db } from '../db';
import { users, orders, payments } from '@shared/schema';
import { eq, like, desc, asc, count, and, gte, lte, sql, isNull, isNotNull } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

// GET all users with pagination, sorting and filtering
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      sort = 'id', 
      order = 'asc',
      search = '',
      role = '',
      status = '',
      codAccess = ''
    } = req.query as Record<string, string>;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    let query = db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      mobileVerified: users.mobileVerified,
      codEnabled: users.codEnabled,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users);

    // Apply search filter if provided
    if (search) {
      query = query.where(
        like(users.name, `%${search}%`)
      );
    }

    // Apply role filter if provided
    if (role) {
      query = query.where(eq(users.role, role));
    }

    // Apply verification status filter if provided
    if (status === 'verified') {
      query = query.where(eq(users.emailVerified, true));
    } else if (status === 'unverified') {
      query = query.where(eq(users.emailVerified, false));
    }

    // Apply COD access filter if provided
    if (codAccess === 'enabled') {
      query = query.where(eq(users.codEnabled, true));
    } else if (codAccess === 'disabled') {
      query = query.where(eq(users.codEnabled, false));
    }

    // Count total records for pagination
    const totalQuery = db.select({ count: sql<number>`count(*)` }).from(users);
    
    // Apply the same filters to the count query
    if (search) {
      totalQuery.where(like(users.name, `%${search}%`));
    }
    if (role) {
      totalQuery.where(eq(users.role, role));
    }
    if (status === 'verified') {
      totalQuery.where(eq(users.emailVerified, true));
    } else if (status === 'unverified') {
      totalQuery.where(eq(users.emailVerified, false));
    }
    
    const [countResult] = await totalQuery;
    const count = countResult?.count || 0;

    // Apply sorting
    if (order === 'asc') {
      query = query.orderBy(asc(users[sort as keyof typeof users]));
    } else {
      query = query.orderBy(desc(users[sort as keyof typeof users]));
    }

    // Apply pagination
    query = query.limit(limitNumber).offset(offset);

    // Execute query
    const usersList = await query;

    // Fetch additional user stats
    const userIds = usersList.map(user => user.id);
    
    // Get order counts for each user
    const orderCounts = await Promise.all(
      userIds.map(async (userId) => {
        const [result] = await db
          .select({ count: sql<number>`count(*)` })
          .from(orders)
          .where(eq(orders.userId, userId));
        return { userId, count: result?.count || 0 };
      })
    );
    
    // Get payment totals for each user
    const paymentTotals = await Promise.all(
      userIds.map(async (userId) => {
        const userPayments = await db
          .select({ amount: payments.amount })
          .from(payments)
          .where(eq(payments.userId, userId));
        
        const total = userPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        return { userId, total };
      })
    );
    
    // Combine user data with stats
    const usersWithStats = usersList.map(user => {
      const orderCount = orderCounts.find(o => o.userId === user.id)?.count || 0;
      const totalSpent = paymentTotals.find(p => p.userId === user.id)?.total || 0;
      
      return {
        ...user,
        orders: orderCount,
        totalSpent
      };
    });

    // Return users with pagination metadata
    res.json({
      users: usersWithStats,
      pagination: {
        total: Number(count),
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(Number(count) / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: String(error) });
  }
};

// GET a single user by ID with their activity
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get user details (excluding password)
    const [userData] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.id, parseInt(id)));

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt
      })
      .from(orders)
      .where(eq(orders.userId, parseInt(id)))
      .orderBy(desc(orders.createdAt))
      .limit(5);

    // Get total orders and spent
    const [orderCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.userId, parseInt(id)));
    
    const userPayments = await db
      .select({ amount: payments.amount })
      .from(payments)
      .where(eq(payments.userId, parseInt(id)));
    
    const totalSpent = userPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    // Return user with activity data
    res.json({
      ...userData,
      recentOrders,
      stats: {
        totalOrders: orderCount?.count || 0,
        totalSpent
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: String(error) });
  }
};

// Create a new user (admin function)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    
    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: role as 'user' | 'admin',
        emailVerified: true, // Admin-created users are verified by default
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt
      });

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user', error: String(error) });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, emailVerified } = req.body;
    
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)));
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    
    // If updating email, check it's not already in use
    if (email && email !== existingUser.email) {
      const [emailExists] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use by another user' });
      }
    }
    
    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        updatedAt: users.updatedAt
      });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user', error: String(error) });
  }
};

// Change user password (admin function)
export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)));
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, parseInt(id)));

    res.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password', error: String(error) });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)));
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting the last admin
    if (existingUser.role === 'admin') {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.role, 'admin'));
      
      if (count <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }
    
    // Delete user
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email
      });

    res.json({
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: String(error) });
  }
};

// Get user statistics data without sending response
export const getUserStatisticsData = async (): Promise<any> => {
  try {
    // Count total users
    const [{ count: totalUsers }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    // Count verified users
    const [{ count: verifiedUsers }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.emailVerified, true));
    
    // Count admin users
    const [{ count: adminUsers }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'admin'));
    
    // Count recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [{ count: recentUsers }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));
    
    return {
      totalUsers,
      verifiedUsers,
      adminUsers,
      recentUsers
    };
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw error;
  }
};

// Get user statistics with response
export const getUserStatistics = async (req: Request, res: Response) => {
  try {
    const statistics = await getUserStatisticsData();
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Failed to fetch user statistics', error: String(error) });
  }
};

// Toggle COD access for a user
export const toggleCodAccess = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { codEnabled } = req.body;
    
    // Validate input
    if (typeof codEnabled !== 'boolean') {
      return res.status(400).json({ message: 'codEnabled must be a boolean value' });
    }
    
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)));
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update COD access
    const [updatedUser] = await db
      .update(users)
      .set({
        codEnabled,
        updatedAt: new Date()
      })
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        codEnabled: users.codEnabled
      });

    res.json({
      message: `COD access ${codEnabled ? 'enabled' : 'disabled'} for user`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error toggling COD access:', error);
    res.status(500).json({ message: 'Failed to toggle COD access', error: String(error) });
  }
};