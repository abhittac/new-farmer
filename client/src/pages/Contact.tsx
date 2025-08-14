import { useEffect } from "react";
import { motion } from "framer-motion";
import { ParallaxSection } from "@/components/ui/parallax-section";
import { useAnimations } from "@/hooks/use-animations";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactFormWithStorage from "@/components/ContactFormWithStorage";
import { useSiteSettings } from "@/context/SiteContext";

export default function Contact() {
  // Set up animations
  const { setupScrollAnimation } = useAnimations();
  const { settings } = useSiteSettings();
  useEffect(() => {
    setupScrollAnimation();
    window.scrollTo(0, 0);
  }, [setupScrollAnimation]);
  console.log("Contact settings:", settings);
  return (
    <>
      {/* Hero Section */}
      <ParallaxSection
        backgroundUrl="https://images.pexels.com/photos/2347011/pexels-photo-2347011.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        className="pt-48 pb-24"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-heading text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white text-lg max-w-3xl mx-auto text-shadow-strong"
          >
            Have questions, suggestions, or feedback? We'd love to hear from
            you. Our team is here to help.
          </motion.p>
        </div>
      </ParallaxSection>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="scroll-animation">
              <h2 className="font-heading text-forest text-3xl font-bold mb-6">
                Send Us a Message
              </h2>
              <p className="text-olive mb-8">
                Whether you have a question about our products, farmers, or
                ordering process, we're here to help. Fill out the form below
                and we'll respond as soon as possible.
              </p>

              <ContactFormWithStorage />
            </div>

            {/* Contact Info */}
            <div className="scroll-animation">
              <h2 className="font-heading text-forest text-3xl font-bold mb-6">
                Contact Information
              </h2>
              <p className="text-olive mb-8">
                You can reach out to us through any of the channels below. We
                aim to respond to all inquiries within 24 hours during business
                days.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex">
                  <div className="mr-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                      <Phone className="text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-forest text-xl font-semibold mb-2">
                      Phone Support
                    </h3>
                    <p className="text-olive mb-1">
                      +91 {settings.storeInfo.phone}
                    </p>
                    <p className="text-olive text-sm">
                      Monday to Friday, 9am to 5pm EST
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="mr-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                      <Mail className="text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-forest text-xl font-semibold mb-2">
                      Email Us
                    </h3>
                    <p className="text-olive mb-1">
                      <a
                        href={`mailto:${settings.storeInfo.email}`}
                        className="hover:underline"
                      >
                        {settings.storeInfo.email}
                      </a>
                    </p>
                    <p className="text-olive text-sm">
                      For general inquiries and support
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="mr-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                      <MapPin className="text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-forest text-xl font-semibold mb-2">
                      Office Address
                    </h3>
                    <p className="text-olive mb-1">
                      {settings.storeInfo.address}
                    </p>
                    <p className="text-olive mb-1">
                      {settings.storeInfo.city}, {settings.storeInfo.state}{" "}
                      {settings.storeInfo.zip}
                    </p>
                    <p className="text-olive text-sm">
                      {settings.storeInfo.country}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="mr-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                      <Clock className="text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-forest text-xl font-semibold mb-2">
                      Business Hours
                    </h3>
                    <p className="text-olive mb-1">
                      Monday - Friday: 9am - 5pm EST
                    </p>
                    <p className="text-olive mb-1">Saturday: 10am - 2pm EST</p>
                    <p className="text-olive">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10 scroll-animation">
            <h2 className="font-heading text-forest text-3xl font-bold mb-4">
              Visit Our Headquarters
            </h2>
            <p className="text-olive">
              Located in beautiful Green Valley, our office is where we
              coordinate with farmers and process orders.
            </p>
          </div>

          <div className="rounded-lg overflow-hidden scroll-animation h-[400px] bg-white shadow-md">
            {/* This would be a real map in a production environment */}
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="font-heading text-forest text-xl font-bold mb-2">
                  {settings.siteName} HQ
                </h3>
                <p className="text-olive">
                  {settings.storeInfo.address}, {settings.storeInfo.city},{" "}
                  {settings.storeInfo.state} {settings.storeInfo.zip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-olive text-lg">
              Here are answers to some common questions. Can't find what you're
              looking for? Contact us directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 scroll-animation">
            <div className="bg-background p-6 rounded-lg">
              <h3 className="font-heading text-forest text-xl font-semibold mb-3">
                How do you ensure product quality?
              </h3>
              <p className="text-olive">
                We work directly with carefully selected farmers who follow
                traditional growing methods. All products undergo multiple
                quality checks before reaching you, ensuring exceptional flavor
                and purity.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg">
              <h3 className="font-heading text-forest text-xl font-semibold mb-3">
                What are your shipping options?
              </h3>
              <p className="text-olive">
                We offer standard shipping (3-5 business days) and expedited
                shipping (1-2 business days) options. Free standard shipping is
                available for orders over ₹50.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg">
              <h3 className="font-heading text-forest text-xl font-semibold mb-3">
                Can I return products if I'm not satisfied?
              </h3>
              <p className="text-olive">
                Yes, we offer a 30-day satisfaction guarantee. If you're not
                completely happy with your purchase, simply contact us for a
                return or replacement.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg">
              <h3 className="font-heading text-forest text-xl font-semibold mb-3">
                Are your products certified organic?
              </h3>
              <p className="text-olive">
                Many of our partner farms follow organic practices but don't
                always have formal certification due to cost constraints. We
                personally verify all farming methods to ensure they meet our
                standards for preservatives-free production.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
