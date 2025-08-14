import { useEffect } from "react";
import { motion } from "framer-motion";
import { ParallaxSection } from "@/components/ui/parallax-section";
import { useAnimations } from "@/hooks/use-animations";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { type TeamMember } from "@shared/schema";
import farmerImage from "../../../public/pic4.jpg";
export default function OurStory() {
  // Set up animations
  const { setupScrollAnimation } = useAnimations();

  // Fetch team members from database
  const { data: teamMembers = [], isLoading: isLoadingTeam } = useQuery<
    TeamMember[]
  >({
    queryKey: ["/api/team-members"],
  });

  // Filter only active team members and sort by display order
  const activeTeamMembers = teamMembers
    .filter((member) => member.isActive)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  useEffect(() => {
    setupScrollAnimation();
    window.scrollTo(0, 0);
  }, [setupScrollAnimation]);

  return (
    <>
      {/* Hero Section */}
      <ParallaxSection
        backgroundUrl="https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        className="pt-48 pb-24"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-heading text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-extra-strong"
          >
            Our Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-cream text-lg max-w-3xl mx-auto text-shadow-extra-strong"
          >
            How a journey to rediscover authentic farming traditions led to the
            creation of Harvest Direct
          </motion.p>
        </div>
      </ParallaxSection>

      {/* Origin Story Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center scroll-animation">
            <div>
              <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
                How It All Began
              </h2>
              <p className="text-olive mb-6">
                Harvest Direct was born from a simple yet profound realization.
                During travels through rural villages, our founder Arjun
                witnessed the stark contrast between the vibrant, flavorful
                foods grown by traditional farmers and the bland, mass-produced
                alternatives dominating supermarket shelves.
              </p>
              <p className="text-olive mb-6">
                What stood out most was the deep wisdom these farmers
                possessed—techniques passed down through generations that
                produced foods with exceptional flavor while nurturing the land.
                Yet many of these farmers struggled to reach markets beyond
                their local areas, while consumers in cities had lost connection
                to the source of their food.
              </p>
              <p className="text-olive">
                This disconnect inspired a mission: to create a bridge between
                traditional farmers preserving ancient growing methods and
                conscious consumers seeking authentic, natural foods grown with
                care and expertise.
              </p>
            </div>
            <div>
              <img
                src={farmerImage}
                alt="Farmers in a traditional farm"
                className="rounded-lg shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision and Values */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
              Our Vision & Values
            </h2>
            <p className="text-olive text-lg">
              We envision a world where traditional farming knowledge is valued
              and preserved, where farmers receive fair compensation for their
              expertise, and where consumers can access truly natural,
              preservatives-free foods directly from their source.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 scroll-animation">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                  ></path>
                </svg>
              </div>
              <h3 className="font-heading text-forest text-xl font-semibold mb-4">
                Authenticity
              </h3>
              <p className="text-olive">
                We believe in foods as nature intended—grown without shortcuts,
                artificial inputs, or genetic modification. True flavor and
                nutrition come from traditional methods that respect natural
                processes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="font-heading text-forest text-xl font-semibold mb-4">
                Fair Partnership
              </h3>
              <p className="text-olive">
                We pay our farmers significantly above market rates to honor
                their knowledge and commitment to quality. This creates
                sustainable livelihoods that allow them to continue traditional
                practices.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="font-heading text-forest text-xl font-semibold mb-4">
                Transparency
              </h3>
              <p className="text-olive">
                We share the story behind each product—who grew it, how it was
                cultivated, and its journey to your table. We believe consumers
                deserve to know the full story of their food.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey Timeline */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
              Our Journey
            </h2>
            <p className="text-olive text-lg">
              From a small operation working with just three farmers to a
              thriving marketplace connecting traditional growers with conscious
              consumers nationwide.
            </p>
          </div>

          <div className="relative scroll-animation">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-secondary/30"></div>

            {/* 2018 - Beginning */}
            <div className="relative z-10 mb-12">
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8 md:pr-12">
                  <h3 className="font-heading text-forest text-xl md:text-2xl font-semibold mb-2">
                    2018
                  </h3>
                  <h4 className="text-secondary font-semibold mb-3">
                    The Seed is Planted
                  </h4>
                  <p className="text-olive mb-0">
                    Arjun's travels through rural farming communities spark the
                    idea for a platform that could connect traditional farmers
                    directly with consumers.
                  </p>
                </div>
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center z-10 shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div className="flex-1 pl-8 md:pl-12"></div>
              </div>
            </div>

            {/* 2019 - First Partnerships */}
            <div className="relative z-10 mb-12">
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8 md:pr-12"></div>
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center z-10 shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div className="flex-1 pl-8 md:pl-12">
                  <h3 className="font-heading text-forest text-xl md:text-2xl font-semibold mb-2">
                    2019
                  </h3>
                  <h4 className="text-secondary font-semibold mb-3">
                    First Partnerships
                  </h4>
                  <p className="text-olive mb-0">
                    Harvest Direct begins with just three farmer partners
                    selling specialty coffee beans, cardamom, and traditional
                    rice varieties through a simple website.
                  </p>
                </div>
              </div>
            </div>

            {/* 2020 - Growth Despite Challenges */}
            <div className="relative z-10 mb-12">
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8 md:pr-12">
                  <h3 className="font-heading text-forest text-xl md:text-2xl font-semibold mb-2">
                    2020
                  </h3>
                  <h4 className="text-secondary font-semibold mb-3">
                    Growth Despite Challenges
                  </h4>
                  <p className="text-olive mb-0">
                    Despite global disruptions, demand for authentic, traceable
                    food skyrockets. We expand to support 12 farmer families and
                    introduce our subscription model.
                  </p>
                </div>
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center z-10 shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="flex-1 pl-8 md:pl-12"></div>
              </div>
            </div>

            {/* 2021 - Certification & Standardization */}
            <div className="relative z-10 mb-12">
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8 md:pr-12"></div>
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center z-10 shrink-0">
                  <span className="text-white font-bold">4</span>
                </div>
                <div className="flex-1 pl-8 md:pl-12">
                  <h3 className="font-heading text-forest text-xl md:text-2xl font-semibold mb-2">
                    2021
                  </h3>
                  <h4 className="text-secondary font-semibold mb-3">
                    Certification & Standardization
                  </h4>
                  <p className="text-olive mb-0">
                    We develop our own quality standards based on traditional
                    growing methods, helping farmers document and verify their
                    natural practices.
                  </p>
                </div>
              </div>
            </div>

            {/* 2022 - Farmer Training Programs */}
            <div className="relative z-10 mb-12">
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8 md:pr-12">
                  <h3 className="font-heading text-forest text-xl md:text-2xl font-semibold mb-2">
                    2022
                  </h3>
                  <h4 className="text-secondary font-semibold mb-3">
                    Farmer Training Programs
                  </h4>
                  <p className="text-olive mb-0">
                    Launch of our training initiative to help traditional
                    farmers document their knowledge and teach younger
                    generations, ensuring practices aren't lost.
                  </p>
                </div>
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center z-10 shrink-0">
                  <span className="text-white font-bold">5</span>
                </div>
                <div className="flex-1 pl-8 md:pl-12"></div>
              </div>
            </div>

            {/* 2023 - National Expansion */}
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8 md:pr-12"></div>
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center z-10 shrink-0">
                  <span className="text-white font-bold">6</span>
                </div>
                <div className="flex-1 pl-8 md:pl-12">
                  <h3 className="font-heading text-forest text-xl md:text-2xl font-semibold mb-2">
                    2023
                  </h3>
                  <h4 className="text-secondary font-semibold mb-3">
                    National Expansion
                  </h4>
                  <p className="text-olive mb-0">
                    Harvest Direct now works with over 50 farmer families across
                    multiple regions, offering more than 100 unique products
                    with full traceability from farm to table.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
              Meet Our Team
            </h2>
            <p className="text-olive text-lg">
              The passionate individuals working behind the scenes to connect
              farmers with consumers while preserving traditional growing
              methods.
            </p>
          </div>

          {isLoadingTeam ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 scroll-animation">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse"
                >
                  <div className="w-full h-64 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTeamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 scroll-animation">
              {activeTeamMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <img
                    src={
                      member.profileImageUrl ||
                      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                    }
                    alt={member.name}
                    className="w-full h-64 object-cover object-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
                    }}
                  />
                  <div className="p-6">
                    <h3 className="font-heading text-forest text-xl font-semibold mb-1">
                      {member.name}
                    </h3>
                    <p className="text-secondary text-sm font-medium mb-4">
                      {member.jobTitle}
                    </p>
                    <p className="text-olive text-sm">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center scroll-animation">
              <p className="text-olive text-lg">
                Our team information will be available soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-forest text-white bg-[hsl(var(--border))]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            Join Our Mission
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Experience the difference that traditionally grown, natural products
            can make in your life while supporting the farmers who preserve
            these valuable practices.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-6"
              >
                Explore Our Products
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/10"
              >
                Get In Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
