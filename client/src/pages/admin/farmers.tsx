import { useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import FarmerManagement from "@/components/admin/FarmerManagement";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function AdminFarmersPage() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the admin area",
        variant: "destructive",
      });
      navigate("/admin/login");
    }
  }, [toast, navigate]);

  return (
    <div className="space-y-8">
      <FarmerManagement />
    </div>
  );
}
