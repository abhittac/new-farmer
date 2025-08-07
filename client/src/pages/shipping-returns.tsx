import { ArrowRight, Package, RefreshCw, Truck, AlertCircle } from "lucide-react";

export default function ShippingReturns() {
  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-forest text-4xl md:text-5xl font-bold mb-4">Shipping & Returns</h1>
            <p className="text-olive text-lg max-w-2xl mx-auto">
              Information about our shipping process, delivery timeframes, and return policy.
            </p>
          </div>

          {/* Shipping Information */}
          <div className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Truck className="text-primary h-6 w-6" />
              </div>
              <h2 className="font-heading text-forest text-2xl font-bold">Shipping Information</h2>
            </div>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-heading text-forest text-xl font-semibold mb-3">Shipping Methods & Timeframes</h3>
                <p className="text-olive mb-4">
                  We offer the following shipping options to ensure your farm-fresh products reach you in perfect condition:
                </p>
                <ul className="space-y-3">
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-forest">Standard Shipping (3-5 business days):</span>
                      <p className="text-olive">₹70 or FREE for orders above ₹500</p>
                    </div>
                  </li>
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-forest">Express Shipping (1-2 business days):</span>
                      <p className="text-olive">₹150 (available for select locations)</p>
                    </div>
                  </li>
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-forest">Same-Day Delivery:</span>
                      <p className="text-olive">₹250 (available only in select metro areas for orders placed before 11 AM)</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-heading text-forest text-xl font-semibold mb-3">Delivery Areas</h3>
                <p className="text-olive mb-4">
                  We currently deliver to most locations across India. Delivery timeframes and options may vary based on your location.
                </p>
                <p className="text-olive">
                  Standard shipping is available nationwide, while express and same-day options are limited to major cities and surrounding areas. During checkout, you'll see available shipping options for your specific location.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-heading text-forest text-xl font-semibold mb-3">Packaging</h3>
                <p className="text-olive mb-4">
                  We take special care in packaging your products to ensure they arrive fresh and undamaged:
                </p>
                <ul className="space-y-3">
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-forest">Perishable Items:</span>
                      <p className="text-olive">Packed with eco-friendly insulation and ice packs to maintain optimal temperature</p>
                    </div>
                  </li>
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-forest">Fragile Items:</span>
                      <p className="text-olive">Carefully cushioned with biodegradable protective materials</p>
                    </div>
                  </li>
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-forest">Eco-Friendly Approach:</span>
                      <p className="text-olive">We use minimal, recyclable, and biodegradable packaging materials wherever possible</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-3">Order Tracking</h3>
                <p className="text-olive mb-4">
                  Once your order ships, you'll receive a tracking number via email and SMS. You can track your order at any time by:
                </p>
                <ul className="space-y-3">
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-olive">Logging into your account and visiting the "Order History" page</p>
                  </li>
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-olive">Using the "Track Your Order" feature on our website</p>
                  </li>
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-olive">Clicking the tracking link in your shipment confirmation email</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Returns Policy */}
          <div className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <RefreshCw className="text-primary h-6 w-6" />
              </div>
              <h2 className="font-heading text-forest text-2xl font-bold">Returns Policy</h2>
            </div>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-heading text-forest text-xl font-semibold mb-3">30-Day Satisfaction Guarantee</h3>
                <p className="text-olive">
                  We stand behind the quality of our products. If you're not completely satisfied with your purchase, we accept returns within 30 days of delivery for a full refund or replacement.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-heading text-forest text-xl font-semibold mb-3">Return Process</h3>
                <p className="text-olive mb-4">
                  To initiate a return, please follow these steps:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-olive">
                  <li>Contact our customer service team via email or phone within 30 days of receiving your order</li>
                  <li>Provide your order number and details about the items you wish to return</li>
                  <li>Our team will guide you through the process and provide a return shipping label if applicable</li>
                  <li>Package unused items securely in their original packaging if possible</li>
                  <li>Ship the items back using the provided return label or your preferred carrier</li>
                </ol>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-heading text-forest text-xl font-semibold mb-3">Special Considerations for Perishable Items</h3>
                <p className="text-olive mb-4">
                  For perishable products, please contact us within 24 hours of delivery if there are any issues with quality or condition. Because of their nature, we handle these returns on a case-by-case basis:
                </p>
                <ul className="space-y-3">
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-olive">We may issue a refund or replacement without requiring the return of the product</p>
                  </li>
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-olive">Photographic evidence of the issue may be requested</p>
                  </li>
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-olive">Our quality team will review each case promptly to ensure customer satisfaction</p>
                  </li>
                </ul>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-heading text-forest text-xl font-semibold mb-3">Non-Returnable Items</h3>
                <p className="text-olive mb-4">
                  For health and safety reasons, the following items cannot be returned:
                </p>
                <ul className="space-y-3">
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-olive">Products with broken seals or opened packaging (except in cases of damage or defect)</p>
                  </li>
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-olive">Personalized or custom-made products</p>
                  </li>
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-olive">Gift cards and promotional items</p>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-3">Refund Process</h3>
                <p className="text-olive mb-4">
                  Once we receive and inspect your return, we'll process your refund:
                </p>
                <ul className="space-y-3">
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-olive">Refunds are processed within 5-7 business days after inspection</p>
                  </li>
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-olive">Credit will be applied to your original payment method</p>
                  </li>
                  <li className="flex">
                    <ArrowRight className="text-primary h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-olive">You'll receive an email notification when your refund is processed</p>
                  </li>
                </ul>
                <p className="text-olive mt-4">
                  <span className="font-medium text-forest">Note:</span> Shipping charges are only refundable if the return is due to our error (damaged, defective, or incorrect items).
                </p>
              </div>
            </div>
          </div>

          {/* Questions Box */}
          <div className="bg-primary/10 rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-start mb-4 md:mb-0">
              <AlertCircle className="text-primary h-6 w-6 mr-3 mt-0.5" />
              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-1">Have Questions?</h3>
                <p className="text-olive">Our customer service team is here to help with any shipping or return inquiries.</p>
              </div>
            </div>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}