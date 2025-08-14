import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ParallaxSection } from "@/components/ui/parallax-section";
import { useAnimations } from "@/hooks/use-animations";
import { MapPin } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Farmers() {
  // Set up animations
  const { setupScrollAnimation } = useAnimations();

  useEffect(() => {
    setupScrollAnimation();
  }, [setupScrollAnimation]);

  // Get farmers data
  const { data: farmers = [], isLoading } = useQuery({ 
    queryKey: ['/api/farmers'] 
  });

  return (
    <>
      {/* Hero Section */}
      <ParallaxSection 
        backgroundUrl="https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        className="pt-48 pb-24"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-heading text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow"
          >
            Meet Our Farmers
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-cream text-lg max-w-3xl mx-auto text-shadow"
          >
            The dedicated individuals who grow your food with passion, expertise, and traditional methods handed down through generations.
          </motion.p>
        </div>
      </ParallaxSection>

      {/* Introduction Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">Why Our Farmers Matter</h2>
            <p className="text-olive text-lg">
              At Harvest Direct, we believe our farmers are heroes. They preserve traditional growing methods that produce more flavorful, nutritious foods while caring for the earth. Every product has a story that begins with the passionate individuals you'll meet below.
            </p>
          </div>
        </div>
      </section>

      {/* Farmers Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="bg-muted h-64 w-full"></div>
                  <div className="p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-10 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {farmers.map((farmer, index) => (
                <motion.div 
                  key={farmer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg overflow-hidden shadow-md h-full flex flex-col"
                >
                  <img 
                    src={farmer.imageUrl}
                    alt={farmer.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="font-heading text-forest text-xl font-bold mb-2">
                      {farmer.name}
                    </h3>
                    <div className="flex items-center text-sm text-olive mb-4">
                      <MapPin className="text-secondary mr-2 h-4 w-4" />
                      <span>{farmer.location}</span>
                    </div>
                    <p className="text-olive mb-4 flex-grow">
                      {farmer.story.length > 150 
                        ? `${farmer.story.substring(0, 150)}...` 
                        : farmer.story}
                    </p>
                    <p className="text-forest font-medium mb-4">
                      Specialty: <span className="text-secondary">{farmer.specialty}</span>
                    </p>
                    <div className="mt-auto">
                      <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                        View Products
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Farming Practices */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">Traditional Farming Practices</h2>
            <p className="text-olive text-lg">
              Our farmers use methods that have been perfected over generations, producing foods with exceptional flavor while nurturing the earth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16 scroll-animation">
            <div>
              <img 
                src="https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
                alt="Traditional farming methods" 
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
            <div>
              <h3 className="font-heading text-forest text-2xl font-semibold mb-4">Natural Pest Management</h3>
              <p className="text-olive mb-6">
                Instead of chemical pesticides, our farmers use companion planting, natural predators, and traditional knowledge to manage pests. This protects beneficial insects and keeps harmful preservatives off your food.
              </p>
              <h3 className="font-heading text-forest text-2xl font-semibold mb-4">Seed Preservation</h3>
              <p className="text-olive">
                Many of our farmers save seeds from their best plants each season, preserving rare varieties with unique flavors and nutritional profiles that you won't find in commercial agriculture.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center scroll-animation">
            <div className="order-2 md:order-1">
              <h3 className="font-heading text-forest text-2xl font-semibold mb-4">Natural Fertilization</h3>
              <p className="text-olive mb-6">
                Using compost, cover crops, and natural amendments, our farmers build soil health naturally. This creates nutrient-dense foods with complex flavors while protecting local watersheds from harmful runoff.
              </p>
              <h3 className="font-heading text-forest text-2xl font-semibold mb-4">Mindful Harvesting</h3>
              <p className="text-olive">
                Our farmers harvest at peak ripeness and process products within hours to preserve maximum flavor and nutrition. Many items are handpicked to ensure only the highest quality makes it to your table.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src="https://images.pexels.com/photos/1483881/pexels-photo-1483881.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
                alt="Natural fertilization methods" 
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-forest text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            Taste the Difference
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Experience the exceptional flavor and quality that comes from traditional farming methods and dedicated growers.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 py-6 rounded-md transition duration-300 text-lg">
              Shop Farm-Direct Products
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}