import { Shield, Lock, FileText, AlertCircle } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-forest text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-olive text-lg max-w-2xl mx-auto">
              Last updated: May 15, 2025
            </p>
          </div>

          {/* Policy Introduction */}
          <div className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Shield className="text-primary h-6 w-6" />
              </div>
              <h2 className="font-heading text-forest text-2xl font-bold">Our Commitment to Privacy</h2>
            </div>

            <p className="text-olive mb-6">
              At Farm to Table, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.
            </p>
            
            <p className="text-olive mb-6">
              We encourage you to read this Privacy Policy carefully to understand our practices regarding your personal data. By using our website and services, you acknowledge that you have read and understand this Privacy Policy.
            </p>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="font-heading text-forest text-xl font-semibold mb-4">Table of Contents</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#information-collected" className="text-primary hover:underline">1. Information We Collect</a>
                </li>
                <li>
                  <a href="#use-of-information" className="text-primary hover:underline">2. How We Use Your Information</a>
                </li>
                <li>
                  <a href="#sharing-information" className="text-primary hover:underline">3. Sharing Your Information</a>
                </li>
                <li>
                  <a href="#data-security" className="text-primary hover:underline">4. Data Security</a>
                </li>
                <li>
                  <a href="#cookies" className="text-primary hover:underline">5. Cookies and Tracking Technologies</a>
                </li>
                <li>
                  <a href="#your-rights" className="text-primary hover:underline">6. Your Rights</a>
                </li>
                <li>
                  <a href="#children" className="text-primary hover:underline">7. Children's Privacy</a>
                </li>
                <li>
                  <a href="#changes" className="text-primary hover:underline">8. Changes to This Privacy Policy</a>
                </li>
                <li>
                  <a href="#contact" className="text-primary hover:underline">9. Contact Us</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Information We Collect */}
          <div id="information-collected" className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8 scroll-mt-20">
            <h2 className="font-heading text-forest text-2xl font-bold mb-6">1. Information We Collect</h2>
            
            <h3 className="font-heading text-forest text-xl font-semibold mb-3">Personal Information You Provide</h3>
            <p className="text-olive mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-olive mb-6">
              <li>Contact information (name, email address, phone number, delivery address)</li>
              <li>Account information (username, password)</li>
              <li>Payment information (credit card details, billing address)</li>
              <li>Order history and preferences</li>
              <li>Profile information (dietary preferences, allergies)</li>
              <li>Communications with us (customer service inquiries, feedback)</li>
            </ul>

            <h3 className="font-heading text-forest text-xl font-semibold mb-3">Information Collected Automatically</h3>
            <p className="text-olive mb-4">
              When you access or use our website, we automatically collect certain information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-olive mb-6">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage information (pages visited, time spent on the site, links clicked)</li>
              <li>Location information (based on IP address or with your consent)</li>
              <li>Cookies and similar technologies (as explained in our Cookie Policy)</li>
            </ul>

            <h3 className="font-heading text-forest text-xl font-semibold mb-3">Information from Third Parties</h3>
            <p className="text-olive">
              We may receive information about you from third parties, such as:
            </p>
            <ul className="list-disc list-inside space-y-2 text-olive">
              <li>Payment processors and financial institutions</li>
              <li>Delivery partners</li>
              <li>Social media platforms (if you connect your account or interact with our content)</li>
            </ul>
          </div>

          {/* How We Use Your Information */}
          <div id="use-of-information" className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8 scroll-mt-20">
            <h2 className="font-heading text-forest text-2xl font-bold mb-6">2. How We Use Your Information</h2>
            
            <p className="text-olive mb-4">
              We use the information we collect for various purposes, including:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-2">Providing Our Services</h3>
                <ul className="list-disc list-inside space-y-1 text-olive">
                  <li>Processing and fulfilling your orders</li>
                  <li>Managing your account and preferences</li>
                  <li>Facilitating payments and deliveries</li>
                  <li>Providing customer support</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-2">Improving Our Services</h3>
                <ul className="list-disc list-inside space-y-1 text-olive">
                  <li>Analyzing usage patterns and trends</li>
                  <li>Developing new features and offerings</li>
                  <li>Enhancing user experience</li>
                  <li>Troubleshooting technical issues</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-2">Marketing and Communication</h3>
                <ul className="list-disc list-inside space-y-1 text-olive">
                  <li>Sending promotional emails and newsletters (with your consent)</li>
                  <li>Personalizing content and recommendations</li>
                  <li>Running surveys and contests</li>
                  <li>Communicating about your orders and account</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-2">Legal and Security Purposes</h3>
                <ul className="list-disc list-inside space-y-1 text-olive">
                  <li>Complying with legal obligations</li>
                  <li>Preventing fraud and unauthorized access</li>
                  <li>Enforcing our terms and policies</li>
                  <li>Protecting our rights and the rights of others</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sharing Your Information */}
          <div id="sharing-information" className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8 scroll-mt-20">
            <h2 className="font-heading text-forest text-2xl font-bold mb-6">3. Sharing Your Information</h2>
            
            <p className="text-olive mb-4">
              We may share your information with the following categories of recipients:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-2">Service Providers</h3>
                <p className="text-olive">
                  We share information with third-party service providers who perform services on our behalf, such as:
                </p>
                <ul className="list-disc list-inside space-y-1 text-olive">
                  <li>Payment processors (Razorpay)</li>
                  <li>Delivery and logistics partners</li>
                  <li>Cloud storage providers</li>
                  <li>Customer support services</li>
                  <li>Analytics and marketing services</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-2">Business Partners</h3>
                <p className="text-olive">
                  We may share information with business partners, such as farmers and producers, to fulfill orders and improve our services.
                </p>
              </div>
              
              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-2">Legal Requirements</h3>
                <p className="text-olive">
                  We may disclose information if required by law, regulation, legal process, or governmental request, or to protect our rights, property, or safety, or the rights, property, or safety of others.
                </p>
              </div>
              
              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-2">Business Transfers</h3>
                <p className="text-olive">
                  In the event of a merger, acquisition, reorganization, bankruptcy, or similar event, your information may be transferred as part of our business assets.
                </p>
              </div>
              
              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-2">With Your Consent</h3>
                <p className="text-olive">
                  We may share your information with third parties when you have given us your consent to do so.
                </p>
              </div>
            </div>
            
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
              <div className="flex">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>
                  <strong>Important:</strong> We do not sell your personal information to third parties for their marketing purposes without your explicit consent.
                </p>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div id="data-security" className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8 scroll-mt-20">
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Lock className="text-primary h-6 w-6" />
              </div>
              <h2 className="font-heading text-forest text-2xl font-bold">4. Data Security</h2>
            </div>
            
            <p className="text-olive mb-4">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. These measures include:
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-olive mb-6">
              <li>Encryption of sensitive data, including payment information</li>
              <li>Secure Socket Layer (SSL) technology for data transmission</li>
              <li>Regular security assessments and audits</li>
              <li>Access controls and authentication procedures</li>
              <li>Employee training on data security and privacy</li>
            </ul>
            
            <p className="text-olive">
              While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security but continuously work to enhance our security measures.
            </p>
          </div>

          {/* Cookies and Tracking Technologies */}
          <div id="cookies" className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8 scroll-mt-20">
            <h2 className="font-heading text-forest text-2xl font-bold mb-6">5. Cookies and Tracking Technologies</h2>
            
            <p className="text-olive mb-4">
              We use cookies and similar tracking technologies to collect information about your browsing activities on our website. Cookies are small data files stored on your device that help us improve our website and your experience.
            </p>
            
            <h3 className="font-heading text-forest text-xl font-semibold mb-3">Types of Cookies We Use</h3>
            <div className="space-y-3 mb-6">
              <div>
                <p className="font-medium text-forest">Essential Cookies:</p>
                <p className="text-olive">
                  Required for the website to function properly. They enable basic functions like page navigation and access to secure areas.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-forest">Preference Cookies:</p>
                <p className="text-olive">
                  Allow the website to remember information that changes how the website behaves or looks, like your preferred language or region.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-forest">Analytics Cookies:</p>
                <p className="text-olive">
                  Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-forest">Marketing Cookies:</p>
                <p className="text-olive">
                  Used to track visitors across websites to display relevant advertisements based on their browsing habits.
                </p>
              </div>
            </div>
            
            <h3 className="font-heading text-forest text-xl font-semibold mb-3">Managing Cookies</h3>
            <p className="text-olive mb-4">
              You can control and manage cookies in various ways:
            </p>
            <ul className="list-disc list-inside space-y-2 text-olive">
              <li>Browser Settings: Most browsers allow you to refuse or accept cookies through their settings</li>
              <li>Cookie Banner: Use our cookie consent banner to customize your preferences</li>
              <li>Third-Party Tools: Various tools are available to help manage cookies and tracking</li>
            </ul>
            
            <p className="text-olive mt-4">
              Please note that disabling certain cookies may affect the functionality of our website and your user experience.
            </p>
          </div>

          {/* Your Rights */}
          <div id="your-rights" className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8 scroll-mt-20">
            <h2 className="font-heading text-forest text-2xl font-bold mb-6">6. Your Rights</h2>
            
            <p className="text-olive mb-4">
              Depending on your location, you may have certain rights regarding your personal data. These may include:
            </p>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="font-medium text-forest">Right to Access:</p>
                <p className="text-olive">
                  You can request a copy of the personal data we hold about you.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-forest">Right to Rectification:</p>
                <p className="text-olive">
                  You can request that we correct inaccurate or incomplete information about you.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-forest">Right to Erasure:</p>
                <p className="text-olive">
                  In certain circumstances, you can request that we delete your personal data.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-forest">Right to Restrict Processing:</p>
                <p className="text-olive">
                  You can request that we limit how we use your personal data.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-forest">Right to Data Portability:</p>
                <p className="text-olive">
                  You can request a copy of your data in a structured, commonly used, and machine-readable format.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-forest">Right to Object:</p>
                <p className="text-olive">
                  You can object to our processing of your personal data in certain circumstances.
                </p>
              </div>
            </div>
            
            <p className="text-olive">
              To exercise any of these rights, please contact us using the information provided in the "Contact Us" section. We will respond to your request within the timeframe required by applicable law.
            </p>
          </div>

          {/* Children's Privacy */}
          <div id="children" className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8 scroll-mt-20">
            <h2 className="font-heading text-forest text-2xl font-bold mb-6">7. Children's Privacy</h2>
            
            <p className="text-olive mb-4">
              Our website and services are not directed to children under 16 years of age, and we do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately, and we will delete such information from our records.
            </p>
          </div>

          {/* Changes to This Privacy Policy */}
          <div id="changes" className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8 scroll-mt-20">
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <FileText className="text-primary h-6 w-6" />
              </div>
              <h2 className="font-heading text-forest text-2xl font-bold">8. Changes to This Privacy Policy</h2>
            </div>
            
            <p className="text-olive mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. The revised policy will be effective immediately upon posting on this page.
            </p>
            
            <p className="text-olive mb-4">
              We will notify you of any material changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-olive">
              <li>Posting a notice on our website</li>
              <li>Sending an email to the address associated with your account</li>
              <li>Indicating the date of the last update at the top of this Privacy Policy</li>
            </ul>
            
            <p className="text-olive mt-4">
              We encourage you to review this Privacy Policy periodically to stay informed about our data practices.
            </p>
          </div>

          {/* Contact Us */}
          <div id="contact" className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8 scroll-mt-20">
            <h2 className="font-heading text-forest text-2xl font-bold mb-6">9. Contact Us</h2>
            
            <p className="text-olive mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            
            <div className="bg-background rounded-md p-6">
              <p className="text-olive mb-2">
                <span className="font-medium text-forest">By Email:</span> privacy@farmtotable.com
              </p>
              <p className="text-olive mb-2">
                <span className="font-medium text-forest">By Mail:</span> Farm to Table Privacy Team, 123 Farm Street, Green Valley, CA 94103, United States
              </p>
              <p className="text-olive">
                <span className="font-medium text-forest">By Phone:</span> +91 1800-123-4567
              </p>
            </div>
          </div>

          {/* Bottom Call to Action */}
          <div className="bg-primary/10 rounded-lg p-6 md:p-8 text-center">
            <h3 className="font-heading text-forest text-xl font-semibold mb-3">Have Questions About Our Privacy Practices?</h3>
            <p className="text-olive mb-4">
              Our team is here to help with any privacy-related questions or concerns you may have.
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