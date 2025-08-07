import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Home, 
  Settings, 
  LogOut, 
  Tag, 
  BarChart
} from 'lucide-react';

export default function AdminNav() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState<string>('Admin');

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      try {
        const userData = JSON.parse(adminUser);
        if (userData.username) {
          setUsername(userData.username);
        }
      } catch (e) {
        console.error('Error parsing admin user data', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setLocation('/admin/login');
  };

  // Hidden admin navigation - this component now just renders a top bar 
  // with the admin welcome and logout button but no navigation links
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">FarmConnect Admin</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Welcome, {username}
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}