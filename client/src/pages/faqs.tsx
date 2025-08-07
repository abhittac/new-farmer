import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQs() {
  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-forest text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-olive text-lg max-w-2xl mx-auto">
              Find answers to common questions about our products, ordering process, shipping, and more.
            </p>
          </div>

          {/* FAQs */}
          <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
            <Accordion type="single" collapsible className="space-y-4">
              {/* Products */}
              <div className="mb-8">
                <h2 className="font-heading text-forest text-2xl font-bold mb-4">Products</h2>
                <AccordionItem value="item-1" className="border rounded-md px-4">
                  <AccordionTrigger className="text-forest font-medium py-4">How do you ensure product quality?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    We work directly with carefully selected farmers who follow traditional growing methods. All products undergo multiple quality checks before reaching you, ensuring exceptional flavor and purity. Our team regularly visits farms to verify practices and maintain our high standards.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">Are your products certified organic?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    Many of our partner farms follow organic practices but don't always have formal certification due to cost constraints. We personally verify all farming methods to ensure they meet our standards for preservatives-free production. Products with official organic certification are clearly labeled on our website.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">How fresh are your products?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    Our products are harvested to order whenever possible, meaning many items are picked just days before shipping to you. We work with a carefully managed supply chain to ensure minimal time between harvest and delivery, preserving optimal freshness, flavor, and nutritional value.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">How should I store my products?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    Storage instructions vary by product type. Fresh produce is best kept refrigerated, while dried goods should be stored in cool, dry places away from direct sunlight. Each product page provides specific storage recommendations, and we include storage guidance with your delivery.
                  </AccordionContent>
                </AccordionItem>
              </div>

              {/* Ordering & Payments */}
              <div className="mb-8">
                <h2 className="font-heading text-forest text-2xl font-bold mb-4">Ordering & Payments</h2>
                <AccordionItem value="item-5" className="border rounded-md px-4">
                  <AccordionTrigger className="text-forest font-medium py-4">What payment methods do you accept?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    We accept payments through Razorpay, which supports all major credit/debit cards. We also offer Cash on Delivery (COD) for your convenience. All online payments are processed through secure, encrypted channels to protect your information.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">Is there a minimum order value?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    There is no minimum order value required to place an order. However, orders above ₹500 qualify for free shipping. We encourage bundling products to take advantage of this offer and reduce the environmental impact of multiple deliveries.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">Can I modify or cancel my order?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    You can modify or cancel your order within 1 hour of placing it. After this window, we begin processing orders for fulfillment. For any changes needed after this time, please contact our customer service team immediately, and we'll do our best to accommodate your request.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">Do you offer subscriptions?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    Yes, we offer flexible subscription options for many of our products. Subscriptions can be set for weekly, bi-weekly, or monthly deliveries with a 10% discount on each order. You can manage, pause, or cancel your subscription anytime through your account dashboard.
                  </AccordionContent>
                </AccordionItem>
              </div>

              {/* Shipping & Delivery */}
              <div className="mb-8">
                <h2 className="font-heading text-forest text-2xl font-bold mb-4">Shipping & Delivery</h2>
                <AccordionItem value="item-9" className="border rounded-md px-4">
                  <AccordionTrigger className="text-forest font-medium py-4">What are your shipping options?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    We offer standard shipping (3-5 business days) and expedited shipping (1-2 business days) options. Free standard shipping is available for orders over ₹500. Our delivery partners are trained to handle perishable items with care, ensuring your products arrive in excellent condition.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-10" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">How do you pack perishable items?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    Perishable items are packed with eco-friendly insulation and ice packs when necessary to maintain optimal temperature during transit. Our packaging is designed to keep items fresh for up to 48 hours after dispatch, giving you flexibility with delivery timing.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-11" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">Do you ship internationally?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    Currently, we only ship within India. We're working on expanding our shipping network to serve international customers in the future. Sign up for our newsletter to stay updated on our expansion plans and new delivery areas.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-12" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">How can I track my order?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    Once your order ships, you'll receive a tracking number via email and SMS. You can also track your order anytime by logging into your account and visiting the "Track Your Order" page. Real-time updates are provided from dispatch through delivery.
                  </AccordionContent>
                </AccordionItem>
              </div>

              {/* Returns & Refunds */}
              <div className="mb-8">
                <h2 className="font-heading text-forest text-2xl font-bold mb-4">Returns & Refunds</h2>
                <AccordionItem value="item-13" className="border rounded-md px-4">
                  <AccordionTrigger className="text-forest font-medium py-4">Can I return products if I'm not satisfied?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    Yes, we offer a 30-day satisfaction guarantee. If you're not completely happy with your purchase, simply contact us for a return or replacement. For perishable items, please report any issues within 24 hours of delivery to ensure a prompt resolution.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-14" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">What is your refund policy?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    Refunds are processed within 5-7 business days after we receive and inspect the returned items. For perishable items that arrive damaged or spoiled, we may issue a refund without requiring the return of the product. Refunds are issued to the original payment method used for the purchase.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-15" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">Do you cover return shipping costs?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    We cover return shipping costs for items that are damaged, defective, or incorrect. For returns due to change of mind, the customer is responsible for return shipping costs. We provide a prepaid shipping label and deduct the shipping cost from your refund amount.
                  </AccordionContent>
                </AccordionItem>
              </div>

              {/* Account & Security */}
              <div>
                <h2 className="font-heading text-forest text-2xl font-bold mb-4">Account & Security</h2>
                <AccordionItem value="item-16" className="border rounded-md px-4">
                  <AccordionTrigger className="text-forest font-medium py-4">How do I create an account?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    You can create an account by clicking on the "Register" link in the top navigation menu. You'll need to provide your name, email address, and create a password. Alternatively, you can create an account during the checkout process when placing your first order.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-17" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">How is my personal information protected?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    We take data security seriously. Your personal information is encrypted and stored securely. We never share your data with third parties without your consent. Our website uses SSL encryption to protect all transactions. For more details, please review our Privacy Policy.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-18" className="border rounded-md px-4 mt-3">
                  <AccordionTrigger className="text-forest font-medium py-4">Can I shop without creating an account?</AccordionTrigger>
                  <AccordionContent className="text-olive pb-4">
                    Yes, we offer a guest checkout option for customers who prefer not to create an account. However, creating an account allows you to track orders, save favorite products, set up subscriptions, and enjoy a faster checkout process for future purchases.
                  </AccordionContent>
                </AccordionItem>
              </div>
            </Accordion>
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <h2 className="font-heading text-forest text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-olive mb-6">
              We're here to help! Reach out to our customer service team.
            </p>
            <a 
              href="/contact" 
              className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}