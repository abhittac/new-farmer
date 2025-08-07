import { Switch, Route } from "wouter";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";
import AdminLayout from "@/components/admin/AdminLayout";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminEnhancedProducts from "@/pages/admin/enhanced-products";
import AdminOrders from "@/pages/admin/orders";
import AdminUsers from "@/pages/admin/users";
import AdminFarmersPage from "@/pages/admin/farmers";
import AdminInventory from "@/pages/admin/inventory";
import AdminDiscounts from "@/pages/admin/discounts";
import AdminSettings from "@/pages/admin/settings";
import AdminNewsletter from "@/pages/admin/newsletter";
import AdminMessagesWithLayout from "@/pages/admin/messages";
import AdminTeamMembers from "@/pages/admin/team-members";
import AdminCategoryManagement from "@/pages/admin/category-management";
import AdminOrderCancellations from "@/pages/admin/order-cancellations";

export const AdminRoutes = () => {
  return (
    <AdminAuthWrapper>
      <AdminLayout>
        <Switch>
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route
            path="/admin/enhanced-products"
            component={AdminEnhancedProducts}
          />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/farmers" component={AdminFarmersPage} />
          <Route path="/admin/team-members" component={AdminTeamMembers} />
          <Route path="/admin/newsletter" component={AdminNewsletter} />
          <Route path="/admin/messages" component={AdminMessagesWithLayout} />
          <Route path="/admin/inventory" component={AdminInventory} />
          <Route path="/admin/discounts" component={AdminDiscounts} />
          <Route
            path="/admin/category-management"
            component={AdminCategoryManagement}
          />
          <Route
            path="/admin/order-cancellations"
            component={AdminOrderCancellations}
          />
          <Route path="/admin/settings" component={AdminSettings} />
        </Switch>
      </AdminLayout>
    </AdminAuthWrapper>
  );
};
