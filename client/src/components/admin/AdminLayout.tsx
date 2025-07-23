import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  Box,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  XCircle,
  Mail,
  MessageSquare,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  icon: ReactNode;
  label: string;
  path: string;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Check if admin is authenticated using JWT token
    const token = localStorage.getItem("adminToken");
    if (!token && !location.includes("/admin/login")) {
      navigate("/admin/login");
    }
  }, [navigate, location]);

  const handleLogout = () => {
    // Remove all admin authentication tokens
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const menuItems: MenuItem[] = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: "Inventory",
      path: "/admin/inventory",
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: "Enhanced Products",
      path: "/admin/enhanced-products",
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "Orders",
      path: "/admin/orders",
    },
 {
      icon: <XCircle className="h-5 w-5" />,
      label: "Order Cancellations",
      path: "/admin/order-cancellations",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      path: "/admin/users",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Farmers",
      path: "/admin/farmers",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Team Members",
      path: "/admin/team-members",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Newsletter",
      path: "/admin/newsletter",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Messages",
      path: "/admin/messages",
    },
    {
      icon: <Tag className="h-5 w-5" />,
      label: "Discounts",
      path: "/admin/discounts",
    },
    {
      icon: <FolderTree className="h-5 w-5" />,
      label: "Category Management",
      path: "/admin/category-management",
    },

    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      path: "/admin/settings",
    },
  ];

  // For login page, return just the children
  if (location === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Header - Completely independent from main site header */}
      <header className="bg-white border-b px-4 py-3 shadow-sm z-50 fixed w-full">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden bg-transparent"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <h1 className="text-xl font-bold">Farm to Table Admin</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-1 pt-[56px]">
        {/* Desktop Sidebar Navigation - Always visible on md+ screens */}
        <aside className="bg-white border-r w-64 flex-shrink-0 hidden md:block">
          <nav className="space-y-1 px-2 pt-5">
            {menuItems.map((item) => (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${
                  location === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar Navigation - Only visible when menuOpen is true */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r z-40 pt-[56px] md:hidden">
              <nav className="space-y-1 px-2 pt-5">
                {menuItems.map((item) => (
                  <div
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${
                      location === item.path
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Backdrop for mobile menu */}
          {menuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
