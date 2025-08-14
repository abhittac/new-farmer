import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductDetail from "@/pages/product-detail";
import Checkout from "@/pages/checkout";
import AllProducts from "@/pages/all-products";
import AllFarmers from "@/pages/all-farmers";
import OurStory from "@/pages/our-story";
import OurProcess from "@/pages/our-process";
import Contact from "@/pages/Contact";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Account from "@/pages/account";
import OrderHistory from "@/pages/order-history";
import OrderCancellation from "@/pages/order-cancellation";
import Payment from "@/pages/payment";
import PaymentSuccess from "@/pages/payment-success";
import FAQs from "@/pages/faqs";
import ShippingReturns from "@/pages/shipping-returns";
import TrackOrder from "@/pages/track-order";
import PrivacyPolicy from "@/pages/privacy-policy";
import Shipping from "@/pages/shipping";

// Admin Pages
import AdminLogin from "@/pages/admin/login";

import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { SiteProvider } from "@/context/SiteContext";


import Layout from "@/components/Layout";
import { AdminRoutes } from "./AdminRoutes";

function App() {
  return (
    <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Switch>
              {/* Admin Routes - Without Main Layout */}
              <Route path="/admin/login" component={AdminLogin} />
              <Route path="/admin/*" component={AdminRoutes} />
              {/* Main Store Routes - Wrapped in Layout */}
              <Route>
                {() => (
                  <SiteProvider>
                    <Layout>
                      <Switch>
                        <Route path="/" component={Home} />
                        <Route path="/products" component={AllProducts} />
                        <Route path="/products/:id" component={ProductDetail} />
                        <Route path="/farmers" component={AllFarmers} />
                        <Route path="/checkout" component={Checkout} />
                        <Route path="/our-story" component={OurStory} />
                        <Route path="/our-process" component={OurProcess} />
                        <Route path="/contact" component={Contact} />
                        <Route path="/login" component={Login} />
                        <Route path="/register" component={Register} />
                        <Route
                          path="/forgot-password"
                          component={ForgotPassword}
                        />
                        <Route
                          path="/reset-password"
                          component={ResetPassword}
                        />
                        <Route path="/account" component={Account} />
                        <Route path="/order-history" component={OrderHistory} />
                        <Route path="/cancel-order" component={OrderCancellation} />
                        <Route path="/payment" component={Payment} />
                        <Route
                          path="/payment-success"
                          component={PaymentSuccess}
                        />

                        {/* Customer Care Pages */}
                        <Route path="/faqs" component={FAQs} />
                        <Route
                          path="/shipping-returns"
                          component={ShippingReturns}
                        />
                        <Route path="/shipping" component={Shipping} />
                        <Route path="/track-order" component={TrackOrder} />
                        <Route
                          path="/privacy-policy"
                          component={PrivacyPolicy}
                        />

                        {/* 404 Route */}
                        <Route component={NotFound} />
                      </Switch>
                    </Layout>
                  </SiteProvider>
                )}
              </Route>
            </Switch>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
  );
}

export default App;
