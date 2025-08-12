import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ParallaxSection } from "@/components/ui/parallax-section";
import { AnimatedText } from "@/components/ui/animated-text";
import FarmerCard from "@/components/FarmerCard";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/use-animations";
import { Link } from "wouter";
import pic from "../../../public/pic5.webp";
export default function AllFarmers() {
  // Get all farmers data
  const { data: farmers = [], isLoading } = useQuery({
    queryKey: ["/api/farmers"],
  });

  // Animation controller
  const { setupScrollAnimation } = useAnimations();

  // Set up scroll animations
  useEffect(() => {
    window.scrollTo(0, 0);
    setupScrollAnimation();
  }, []);

  // Animation variants for staggered cards
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <div className="animate-pulse space-y-8 w-full">
          <div className="h-10 bg-muted rounded w-1/4 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <ParallaxSection
        backgroundUrl="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
        className="h-[50vh] flex items-center justify-center"
        opacity={0.6}
      >
        <div className="container mx-auto px-4 text-center">
          <AnimatedText
            tag="h1"
            className="font-heading text-white text-4xl md:text-6xl font-bold mb-6 text-shadow-extra-strong"
          >
            Meet Our Farmers
          </AnimatedText>

          <AnimatedText
            tag="p"
            delay={0.4}
            className="text-cream text-lg md:text-xl max-w-3xl mx-auto text-shadow-extra-strong"
          >
            The dedicated individuals who cultivate the earth with traditional
            wisdom and sustainable practices to bring you the finest natural
            products.
          </AnimatedText>
        </div>
      </ParallaxSection>

      {/* Farmers Introduction */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
              The Heroes Behind Our Products
            </h2>
            <p className="text-olive text-lg">
              Our partner farmers are the true heroes of our story. Many have
              been farming the same land for generations, preserving ancient
              agricultural wisdom while adapting sustainable practices. They
              work in harmony with nature, rejecting chemical pesticides and
              artificial enhancers to bring you food as it should be.
            </p>
          </div>

          {/* Farmers Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {farmers.map((farmer) => (
              <motion.div
                key={farmer.id}
                variants={item}
                className="scroll-animation"
              >
                <FarmerCard farmer={farmer} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Farming Philosophy */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="scroll-animation">
              <img
                src={pic}
                alt="Traditional farming methods"
                className="rounded-lg shadow-xl w-full h-[520px] object-cover"
              />
            </div>
            <div className="scroll-animation">
              <h2 className="font-heading text-forest text-3xl font-bold mb-6">
                Our Farming Philosophy
              </h2>
              <p className="text-olive mb-4">
                We partner exclusively with farmers who share our commitment to
                sustainable agriculture. These dedicated individuals practice
                farming methods that preserve biodiversity, protect soil health,
                and maintain the delicate balance of local ecosystems.
              </p>
              <p className="text-olive mb-4">
                Many of our farmers have rejected modern industrial farming in
                favor of traditional methods that have sustained communities for
                centuries. Their approach may yield less volume, but produces
                incomparably better flavor and nutrition.
              </p>
              <p className="text-olive">
                By choosing to purchase from HarvestDirect, you're not just
                getting exceptional products — you're supporting a vision of
                agriculture that respects both people and planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Network */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
              Join Our Farmer Network
            </h2>
            <p className="text-olive text-lg">
              Are you a farmer committed to traditional, chemical-free
              agriculture? We're always looking to expand our network of
              passionate growers who share our vision for sustainable,
              high-quality food production.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto scroll-animation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-4">
                  What We Look For
                </h3>
                <ul className="space-y-3 text-olive">
                  <li className="flex items-start">
                    <i className="fas fa-check text-primary mt-1 mr-2"></i>
                    <span>Chemical-free growing methods</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-primary mt-1 mr-2"></i>
                    <span>Commitment to sustainability</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-primary mt-1 mr-2"></i>
                    <span>Exceptional product quality</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-primary mt-1 mr-2"></i>
                    <span>Traditional farming knowledge</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-4">
                  Benefits of Joining
                </h3>
                <ul className="space-y-3 text-olive">
                  <li className="flex items-start">
                    <i className="fas fa-check text-primary mt-1 mr-2"></i>
                    <span>Fair compensation for your work</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-primary mt-1 mr-2"></i>
                    <span>Direct access to conscious consumers</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-primary mt-1 mr-2"></i>
                    <span>Marketing and storytelling support</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-primary mt-1 mr-2"></i>
                    <span>Community of like-minded farmers</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link
                href="/contact"
                className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-md transition duration-300"
              >
                Contact Us to Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
