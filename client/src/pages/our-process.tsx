import { useEffect } from "react";
import { motion } from "framer-motion";
import { ParallaxSection } from "@/components/ui/parallax-section";
import { useAnimations } from "@/hooks/use-animations";
import { Truck, Leaf, Package, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import pic1 from "../../../public/pic3.jpg";
export default function OurProcess() {
  // Set up animations
  const { setupScrollAnimation } = useAnimations();

  useEffect(() => {
    window.scrollTo(0, 0);
    setupScrollAnimation();
  }, [setupScrollAnimation]);

  return (
    <>
      {/* Hero Section */}
      <ParallaxSection
        backgroundUrl="https://images.pexels.com/photos/5913367/pexels-photo-5913367.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        className="pt-48 pb-24"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-heading text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow"
          >
            Our Farm-to-Table Process
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white text-lg max-w-3xl mx-auto text-shadow"
          >
            How we ensure the highest quality products make it from our partner
            farms directly to your table with transparency at every step.
          </motion.p>
        </div>
      </ParallaxSection>

      {/* Overview Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
              A Different Approach
            </h2>
            <p className="text-olive text-lg">
              Unlike conventional supply chains with numerous middlemen, our
              process creates a direct connection between farmers and consumers.
              This ensures you receive fresher products while farmers earn fair
              compensation for their dedication to quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center scroll-animation">
            <div>
              <img
                src={pic1}
                alt="Farmer inspecting crop quality"
                className="rounded-lg shadow-xl w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
            <div>
              <h3 className="font-heading text-forest text-2xl md:text-3xl font-semibold mb-4">
                Traceable From Seed to Table
              </h3>
              <p className="text-olive mb-4">
                Every product in our collection can be traced back to the exact
                farm where it was grown. We believe transparency builds trust
                and helps you make informed choices about the foods you eat.
              </p>
              <p className="text-olive mb-6">
                When you purchase from Harvest Direct, you're not just buying a
                product – you're supporting a system that values quality,
                sustainability, and fair compensation for farmers who are
                preserving traditional growing methods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="py-16 md:py-24 bg-background relative">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
              Our Process Steps
            </h2>
            <p className="text-olive text-lg">
              From careful partner selection to your doorstep, here's how we
              ensure quality at every stage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 scroll-animation">
            {/* Step 1 */}
            <div className="flex">
              <div className="mr-6">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                  <span className="text-secondary font-bold text-xl">1</span>
                </div>
              </div>
              <div>
                <h3 className="font-heading text-forest text-xl font-bold mb-3">
                  Farmer Selection & Partnership
                </h3>
                <p className="text-olive mb-4">
                  We carefully select partner farmers based on their commitment
                  to traditional farming methods, product quality, and
                  sustainable practices. Each farm undergoes thorough evaluation
                  before joining our network.
                </p>
                <ul className="text-olive space-y-2">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>Focus on preservatives-free growing practices</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>
                      Evaluation of soil health and growing environment
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>
                      Assessment of traditional knowledge and practices
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex">
              <div className="mr-6">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                  <span className="text-secondary font-bold text-xl">2</span>
                </div>
              </div>
              <div>
                <h3 className="font-heading text-forest text-xl font-bold mb-3">
                  Harvest & Processing
                </h3>
                <p className="text-olive mb-4">
                  Products are harvested at peak ripeness and processed using
                  methods that preserve maximum flavor and nutrition. Our
                  minimal processing approach ensures you taste the food as
                  nature intended.
                </p>
                <ul className="text-olive space-y-2">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>Careful hand-harvesting of many products</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>
                      Processing within hours of harvest when possible
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>
                      Traditional processing methods that preserve nutrition
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex">
              <div className="mr-6">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                  <span className="text-secondary font-bold text-xl">3</span>
                </div>
              </div>
              <div>
                <h3 className="font-heading text-forest text-xl font-bold mb-3">
                  Quality Control
                </h3>
                <p className="text-olive mb-4">
                  Every product undergoes rigorous quality checks to ensure it
                  meets our high standards. We regularly test for purity and
                  reject any items that don't meet our strict criteria.
                </p>
                <ul className="text-olive space-y-2">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>Visual inspection for quality indicators</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>Sample testing for purity and taste</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>
                      Verification of harvesting and processing methods
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex">
              <div className="mr-6">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                  <span className="text-secondary font-bold text-xl">4</span>
                </div>
              </div>
              <div>
                <h3 className="font-heading text-forest text-xl font-bold mb-3">
                  Packaging & Delivery
                </h3>
                <p className="text-olive mb-4">
                  Products are packaged to preserve freshness using
                  environmentally responsible materials. We work with reliable
                  shipping partners to deliver your order promptly with minimal
                  environmental impact.
                </p>
                <ul className="text-olive space-y-2">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>Minimal, eco-friendly packaging</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>Carbon-offset shipping options</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>
                      Careful handling to ensure products arrive in perfect
                      condition
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 z-0 opacity-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <pattern
              id="pattern-circles"
              x="0"
              y="0"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
              patternContentUnits="userSpaceOnUse"
            >
              <circle
                id="pattern-circle"
                cx="10"
                cy="10"
                r="1.6257413380501518"
                fill="#000"
              ></circle>
            </pattern>
            <rect
              id="rect"
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#pattern-circles)"
            ></rect>
          </svg>
        </div>
      </section>

      {/* Sustainability Initiatives */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
              Our Sustainability Initiatives
            </h2>
            <p className="text-olive text-lg">
              We're committed to making our operations environmentally
              responsible at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 scroll-animation">
            <div className="bg-background p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <Leaf className="text-secondary" />
              </div>
              <h3 className="font-heading text-forest text-lg font-semibold mb-3">
                Regenerative Agriculture
              </h3>
              <p className="text-olive">
                We partner with farmers who practice regenerative methods that
                build soil health and sequester carbon, creating a positive
                environmental impact.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <Package className="text-secondary" />
              </div>
              <h3 className="font-heading text-forest text-lg font-semibold mb-3">
                Sustainable Packaging
              </h3>
              <p className="text-olive">
                Our packaging is designed to minimize waste with recyclable,
                compostable, or biodegradable materials wherever possible.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <Truck className="text-secondary" />
              </div>
              <h3 className="font-heading text-forest text-lg font-semibold mb-3">
                Carbon-Offset Shipping
              </h3>
              <p className="text-olive">
                We measure and offset the carbon footprint of our shipping
                operations by investing in verified environmental projects.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-secondary" />
              </div>
              <h3 className="font-heading text-forest text-lg font-semibold mb-3">
                Waste Reduction
              </h3>
              <p className="text-olive">
                We implement systems to minimize food waste through careful
                planning, multi-use applications, and composting programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-forest text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-black">
            Experience Our Process Firsthand
          </h2>
          <p className="text-black text-lg max-w-2xl mx-auto mb-8">
            The best way to understand the difference our process makes is to
            taste it for yourself. Browse our collection of farm-direct products
            today.
          </p>
          <Link href="/products">
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 py-6 rounded-md transition duration-300 text-lg"
            >
              Shop Our Products
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
