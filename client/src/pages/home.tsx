import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedText } from "@/components/ui/animated-text";
import { ParallaxSection } from "@/components/ui/parallax-section";
import ProductCard from "@/components/ProductCard";
import FarmerCard from "@/components/FarmerCard";
import ProcessStep from "@/components/ProcessStep";
import Testimonial from "@/components/Testimonial";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAnimations } from "@/hooks/use-animations";
import { ChevronDown, Leaf, Truck, Sprout, MapPin, Loader } from "lucide-react";
import { motion } from "framer-motion";
import bannerVideo from "../../../attached_assets/banner.mp4";
import type {
  Product,
  Farmer,
  Testimonial as TestimonialType,
  TeamMember,
  Category,
} from "@shared/schema";
import { Loader2 } from "lucide-react";
import farmerImage from "../../../public/pic1.jpg";
import farmerImage2 from "../../../public/pic2.jpg";
import farmerImage3 from "../../../attached_assets/pic1.webp";
import { formatSnakeCase } from "@/utils/formatSnakeCase";
import { getImageUrl } from "@/utils/imageUtils";
const newsletterSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export default function Home() {
  // State for category and subcategory filtering
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(
    null
  );
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const storyRef = useRef(null);
  const scrollToStory = () => {
    storyRef.current.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [product, setProduct] = useState([]);
  // Get products and farmers data
  const { data: productsResponse } = useQuery({
    queryKey: [`${import.meta.env.VITE_API_URL}/api/products`],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products?limit=50`
      );
      return response.json();
    },
  });

  // Filter featured products on the frontend
  const allProducts = productsResponse?.products || [];
  const products = allProducts.filter((product: Product) => product.featured);

  const { data: farmers = [] } = useQuery<Farmer[]>({
    queryKey: [`${import.meta.env.VITE_API_URL}/api/farmers/featured`],
  });

  // Get categories for filtering
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: [`${import.meta.env.VITE_API_URL}/api/categories/main`],
  });

  // Get subcategories when a category is selected
  const { data: subcategories = [] } = useQuery<Category[]>({
    queryKey: [
      `${import.meta.env.VITE_API_URL}/api/categories`,
      selectedCategory,
      "subcategories",
    ],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/categories/${selectedCategory}/subcategories`
      );
      return response.json();
    },
    enabled: !!selectedCategory,
  });

  const { data: testimonials = [] } = useQuery<TestimonialType[]>({
    queryKey: [`${import.meta.env.VITE_API_URL}/api/testimonials`],
  });

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: [`${import.meta.env.VITE_API_URL}/api/team-members`],
  });

  // Animation controller for scroll animations
  const { setupScrollAnimation } = useAnimations();

  // Filter products based on selected category and subcategory
  const filteredProducts = products.filter((product: Product) => {
    if (!selectedCategory && !selectedSubcategory) return true;

    const selectedCategoryName = categories.find(
      (cat) => cat.id === selectedCategory
    )?.name;
    const selectedSubcategoryName = subcategories.find(
      (sub) => sub.id === selectedSubcategory
    )?.name;

    if (selectedSubcategory) {
      return product.subcategory === selectedSubcategoryName;
    }

    if (selectedCategory) {
      return product.category === selectedCategoryName;
    }

    return true;
  });

  // Set up scroll animations
  useEffect(() => {
    setupScrollAnimation();
  }, []);

  // Newsletter form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      name: "",
      email: "",
      agreedToTerms: false,
    },
  });

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      await apiRequest(
        `${import.meta.env.VITE_API_URL}/api/newsletter/subscribe`,
        {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast({
        title: "Subscription successful!",
        description: "Thank you for joining our community.",
      });
    } catch (error) {
      toast({
        title: "Subscription failed",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  };

  const productData = async () => {
    try {
      const response = await apiRequest(
        `${import.meta.env.VITE_API_URL}/api/products`
      );
      console.log("Nidhi:", response.products);
      setProduct(response.products[0] || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    productData();
  }, []);

  return (
    <>
      {/* Modern Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden pt-0 sm:pt-0 md:pt-0 lg:pt-0 xl:pt-0 pt-[100px]">
        {/* Background image with parallax effect */}
        <div
          className="absolute inset-0 bg-center bg-cover z-0 transform scale-110"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500076656116-558758c991c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
            filter: "brightness(0.8)",
          }}
        ></div>

        {/* Decorative overlay elements with improved contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest/80 to-black/50 z-10"></div>
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent z-10"></div>

        {/* Left-aligned content for modern asymmetric layout */}
        <div className="container mx-auto px-4 lg:px-8 relative z-20 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 md:pr-8 mb-10 md:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 leading-tight text-shadow-extra-strong">
                From <span className="text-secondary font-extrabold">Soil</span>{" "}
                to <span className="text-secondary font-extrabold">Soul</span>
              </h1>

              <h2 className="font-heading text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 text-shadow-extra-strong">
                Pure Nature, Direct to Your Table
              </h2>

              <p className="text-white text-base sm:text-lg max-w-xl mb-8 text-shadow-extra-strong">
                Experience the authentic flavors of traditionally grown,
                preservatives-free products sourced directly from the farmers who
                nurture them with generations of wisdom.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 py-6 rounded-md transition duration-300"
                  >
                    Explore Products
                  </Button>
                </Link>

                <Link href="/our-story">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white bg-white/10 font-semibold px-8 py-6 rounded-md transition duration-300"
                  >
                    Our Story
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Floating product card for visual interest */}
          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-2xl transform rotate-2 max-w-md mx-auto"
            >
              {product.length === 0 ? (
                <Loader />
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden shrink-0">
                      <img
                        src={getImageUrl(product?.imageUrl)}
                        alt="Featured product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-heading text-forest text-xl font-bold">
                        {product?.name || ""}
                      </h3>
                      <div className="flex items-center text-sm text-secondary font-medium">
                        <Leaf className="h-4 w-4 mr-1" />
                        <span>{product?.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center items-center">
                    {/* <span className="text-forest text-xl font-bold">
                      ₹{product.price}/{product.quantity}{" "}
                      {product.unit === "pcs" && product.quantity === 1
                        ? "Piece"
                        : formatSnakeCase(product.unit!)}
                    </span> */}
                    <Link
                      to={`/products/${product.id}`}
                      className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-semibold transition duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center z-20">
          <Link href="#story" onClick={scrollToStory}>
            <div className="text-white animate-bounce bg-black/20 p-2 rounded-full backdrop-blur-sm hover:bg-black/30 transition-colors duration-300">
              <ChevronDown className="h-6 w-6" />
            </div>
          </Link>
        </div>
      </section>

      {/* Our Story Section */}
      <section
        id="story"
        ref={storyRef}
        className="py-16 md:py-24 bg-background"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
              Our Story
            </h2>
            <p className="text-olive text-base sm:text-lg">
              We connect you directly with farmers who've dedicated their lives
              to growing the purest, most flavorful products using sustainable,
              traditional methods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="scroll-animation">
              <img
                src={farmerImage}
                alt="Farmer harvesting coffee beans"
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
            <div className="scroll-animation">
              <h3 className="font-heading text-forest text-xl sm:text-2xl md:text-3xl font-semibold mb-4">
                Celebrating Our Farmers
              </h3>
              <p className="text-olive mb-4">
                For generations, these dedicated men and women have cultivated
                the earth using knowledge passed down through families. Their
                hands tell stories of hard work, persistence, and deep respect
                for nature.
              </p>
              <p className="text-olive mb-6">
                Without chemical pesticides or artificial enhancers, they grow
                foods with authentic flavors and natural goodness that factory
                farming simply cannot replicate.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start">
                <div className="w-full text-center mb-6 md:w-auto md:text-left md:mb-0 md:mr-4">
                  <span className="block text-secondary text-3xl font-bold">
                    24+
                  </span>
                  <span className="text-olive text-sm">Partner Farms</span>
                </div>

                <div className="hidden md:block h-10 w-px bg-olive/20 mx-4"></div>

                <div className="w-full text-center mb-6 md:w-auto md:text-left md:mb-0 md:mx-4">
                  <span className="block text-secondary text-3xl font-bold">
                    100%
                  </span>
                  <span className="text-olive text-sm">Preservatives-Free</span>
                </div>

                <div className="hidden md:block h-10 w-px bg-olive/20 mx-4"></div>

                <div className="w-full text-center mb-6 md:w-auto md:text-left md:mb-0 md:ml-4">
                  <span className="block text-secondary text-3xl font-bold">
                    8+
                  </span>
                  <span className="text-olive text-sm">Product Categories</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center ">
            <div className="order-2 md:order-1 scroll-animation">
              <h3 className="font-heading text-forest text-xl sm:text-2xl md:text-3xl font-semibold mb-4">
                From Soil to Soul
              </h3>
              <p className="text-olive mb-4">
                Every product in our collection has a story. It begins in the
                rich soil of family farms, where generations of agricultural
                wisdom merge with sustainable practices.
              </p>
              <p className="text-olive mb-6">
                We bypass middlemen to ensure farmers receive fair compensation
                for their remarkable work while delivering exceptionally fresh
                products to your doorstep.
              </p>
              <Link href="/our-process">
                <Button className="bg-primary hover:bg-primary-dark text-white font-semibold transition duration-300">
                  Learn About Our Process
                </Button>
              </Link>
            </div>
            <div className="order-1 md:order-2 scroll-animation">
              <img
                src={farmerImage2}
                alt="Traditional farming methods"
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section id="products" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 scroll-animation">
            <h2 className="font-heading text-forest text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Our Products
            </h2>
            <p className="text-olive text-base sm:text-lg">
              Explore our collection of premium farm-fresh products, each grown
              with care and harvested at peak ripeness.
            </p>
          </div>

          {/* Category and Subcategory Navigation */}
          <div className="flex flex-col items-center gap-4 mb-12 scroll-animation">
            {/* Category Selection */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                className="px-5 py-2 rounded-full font-medium transition duration-200"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
              >
                All Products
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  className="px-5 py-2 rounded-full font-medium transition duration-200"
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedSubcategory(null);
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            {/* Subcategory Selection */}
            {selectedCategory && subcategories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant={!selectedSubcategory ? "default" : "outline"}
                  size="sm"
                  className="px-4 py-1 rounded-full text-sm transition duration-200"
                  onClick={() => setSelectedSubcategory(null)}
                >
                  All{" "}
                  {categories.find((cat) => cat.id === selectedCategory)?.name}
                </Button>
                {subcategories.map((subcategory) => (
                  <Button
                    key={subcategory.id}
                    variant={
                      selectedSubcategory === subcategory.id
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="px-4 py-1 rounded-full text-sm transition duration-200"
                    onClick={() => setSelectedSubcategory(subcategory.id)}
                  >
                    {subcategory.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product: Product) => (
              <div key={product.id} className="scroll-animation">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8 py-3 rounded-md transition duration-300"
              >
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Parallax Quote Section */}
      <ParallaxSection
        backgroundUrl="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
        className="py-28"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-accent text-white text-3xl md:text-4xl mb-6 text-shadow-strong">
              "The care of the earth is our most ancient and most worthy
              responsibility."
            </p>
            <p className="text-white text-lg text-shadow-strong font-medium">
              — Traditional Farming Wisdom
            </p>
          </div>
        </div>
      </ParallaxSection>

      {/* Meet Our Farmers */}
      <section id="farmers" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
              Meet Our Farmers
            </h2>
            <p className="text-olive text-lg">
              The passionate individuals whose expertise and dedication bring
              you nature's finest bounty, cultivated with care and respect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {farmers.map((farmer) => (
              <div key={farmer.id} className="scroll-animation">
                <FarmerCard farmer={farmer} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/farmers">
              <Button
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8 py-3 rounded-md transition duration-300"
              >
                Meet All Our Farmers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section id="process" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
              Our Process
            </h2>
            <p className="text-olive text-lg">
              From seed to harvest to your doorstep, discover how we maintain
              quality and sustainability at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="scroll-animation">
              <ProcessStep
                number={1}
                title="Sustainable Cultivation"
                description="Our partner farmers use traditional, preservatives-free methods that preserve soil health and biodiversity. Many practice polyculture, growing multiple crops that support each other naturally."
              />
            </div>

            <div className="scroll-animation">
              <ProcessStep
                number={2}
                title="Careful Harvesting"
                description="Products are harvested by hand at peak ripeness to ensure optimal flavor and nutritional value. This careful approach preserves quality that mechanical harvesting can't match."
              />
            </div>

            <div className="scroll-animation">
              <ProcessStep
                number={3}
                title="Traditional Processing"
                description="Using time-tested methods like sun-drying and small-batch processing, our farmers preserve the natural characteristics of each product without artificial additives or preservatives."
              />
            </div>

            <div className="scroll-animation">
              <ProcessStep
                number={4}
                title="Quality Control"
                description="Every batch is carefully inspected for quality and authenticity. We verify that products meet our strict standards for flavor, appearance, and purity before packaging."
              />
            </div>

            <div className="scroll-animation">
              <ProcessStep
                number={5}
                title="Sustainable Packaging"
                description="Our products are packaged in eco-friendly materials that preserve freshness while minimizing environmental impact. We're constantly improving our packaging to reduce waste."
              />
            </div>

            <div className="scroll-animation">
              <ProcessStep
                number={6}
                title="Direct Delivery"
                description="We ship directly from farms to your doorstep, minimizing handling and ensuring maximum freshness. This direct approach also ensures farmers receive fair compensation for their work."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Journey Map */}
      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16 scroll-animation">
            <h2 className="font-heading text-forest text-3xl md:text-4xl font-bold mb-6">
              From Farm to Your Table
            </h2>
            <p className="text-olive text-lg">
              Trace the journey of our products from the farms where they're
              grown to your doorstep.
            </p>
          </div>

          <div className="relative scroll-animation">
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-10 relative">
              <div className="w-full h-[30rem] bg-background/50 rounded-lg flex items-center justify-center mb-8">
                {/* Placeholder for the interactive map */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 800 600"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="p-4"
                >
                  <path
                    d="M400 50C450 200 600 250 700 300"
                    stroke="#DDA15E"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                  />
                  <path
                    d="M400 50C350 200 200 250 100 300"
                    stroke="#DDA15E"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                  />
                  <path
                    d="M100 300C200 350 300 400 400 500"
                    stroke="#5A6F43"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                  />
                  <path
                    d="M700 300C600 350 500 400 400 500"
                    stroke="#5A6F43"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                  />

                  {/* Farm locations */}
                  <circle cx="400" cy="50" r="20" fill="#606C38" />
                  <circle cx="700" cy="300" r="15" fill="#DDA15E" />
                  <circle cx="100" cy="300" r="15" fill="#DDA15E" />
                  <circle cx="400" cy="500" r="20" fill="#BC4749" />

                  {/* Labels */}
                  <text
                    x="400"
                    y="40"
                    textAnchor="middle"
                    fill="#283618"
                    fontFamily="Mulish"
                    fontSize="12"
                  >
                    Central Processing
                  </text>
                  <text
                    x="700"
                    y="290"
                    textAnchor="middle"
                    fill="#283618"
                    fontFamily="Mulish"
                    fontSize="12"
                  >
                    Highland Farms
                  </text>
                  <text
                    x="100"
                    y="290"
                    textAnchor="middle"
                    fill="#283618"
                    fontFamily="Mulish"
                    fontSize="12"
                  >
                    Lowland Farms
                  </text>
                  <text
                    x="400"
                    y="530"
                    textAnchor="middle"
                    fill="#283618"
                    fontFamily="Mulish"
                    fontSize="12"
                  >
                    Your Home
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="text-secondary text-3xl" />
                  </div>
                  <h3 className="font-heading text-forest text-xl font-semibold mb-2">
                    24+ Partner Farms
                  </h3>
                  <p className="text-olive">
                    Family-owned farms across diverse regions, each with unique
                    growing conditions.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="text-secondary text-3xl" />
                  </div>
                  <h3 className="font-heading text-forest text-xl font-semibold mb-2">
                    Direct Shipping
                  </h3>
                  <p className="text-olive">
                    Products travel directly from farms to our central facility
                    to your home.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sprout className="text-secondary text-3xl" />
                  </div>
                  <h3 className="font-heading text-forest text-xl font-semibold mb-2">
                    100% Traceability
                  </h3>
                  <p className="text-olive">
                    Each product can be traced back to the exact farm and farmer
                    who grew it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      {teamMembers.length > 0 && (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <div key={member.id} className="scroll-animation">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={member.profileImageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-heading text-forest text-xl font-bold mb-2">
                        {member.name}
                      </h3>
                      <p className="text-primary font-medium mb-3">
                        {member.jobTitle}
                      </p>
                      <p className="text-olive text-sm leading-relaxed">
                        {member.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-[#283618] text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14 scroll-animation">
            <h2 className="font-heading text-[#FEFAE0] text-3xl md:text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-white/80 text-lg">
              Discover why people across the country choose our farm-direct
              products.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto scroll-animation">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {testimonials.slice(0, 3).map((testimonial) => (
                <Testimonial key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>

            {/* <div className="flex justify-center mt-12 space-x-3">
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <div className="w-3 h-3 rounded-full bg-white/40"></div>
              <div className="w-3 h-3 rounded-full bg-white/40"></div>
              <div className="w-3 h-3 rounded-full bg-white/40"></div>
            </div> */}
          </div>
        </div>
      </section>
      <section id="video" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-8 lg:px-8">
          <>
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden scroll-animation">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-10">
                {/* Left: Text */}
                <div className="order-2 md:order-1 scroll-animation">
                  <h3 className="font-heading text-forest text-xl sm:text-2xl md:text-3xl font-semibold mb-4">
                    Quality You Can Feel, Trust You Can Taste
                  </h3>
                  <p className="text-olive mb-4">
                    We don’t spend on big ads—we spend on quality. Every product
                    we bring to your table is made with care, honesty, and
                    purpose.
                  </p>
                  <p className="text-olive mb-6">
                    You, our customer, are our greatest ambassador. When you
                    share our story, you help us grow—naturally, beautifully.
                  </p>
                  <p className="text-olive mb-6">
                    Thank you for choosing us. Let’s build something real,
                    together.
                  </p>
                  <Link href="/our-process">
                    <Button className="bg-primary hover:bg-primary-dark text-white font-semibold transition duration-300">
                      Learn About Our Process
                    </Button>
                  </Link>
                </div>

                {/* Right: Video Thumbnail */}
                <div className="order-1 md:order-2 scroll-animation">
                  <div
                    className="relative cursor-pointer group rounded-lg shadow-xl overflow-hidden"
                    onClick={() => setIsVideoOpen(true)}
                  >
                    <img
                      src={farmerImage3}
                      alt="Video thumbnail"
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-8 h-8 text-white"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Modal */}
            {isVideoOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                onClick={() => setIsVideoOpen(false)} // Close on overlay click
              >
                <div
                  className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4"
                  onClick={(e) => e.stopPropagation()} // Prevent close on iframe click
                >
                  <button
                    onClick={() => setIsVideoOpen(false)}
                    className="absolute top-3 right-5 text-black hover:text-red-500"
                  >
                    ✕
                  </button>
                  <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={bannerVideo}
                      title="Video"
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        </div>
      </section>
      {/* Newsletter Section */}
      <section id="contact" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden scroll-animation">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image side */}
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=900"
                  alt="Farmer working in terraced fields"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content side */}
              <div className="p-8 md:p-12">
                <h2 className="font-heading text-forest text-3xl font-bold mb-6">
                  Join Our Community
                </h2>
                <p className="text-olive mb-6">
                  Subscribe to receive seasonal recipes, farmer stories, and
                  exclusive offers on our fresh, farm-direct products.
                </p>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-forest text-sm font-medium mb-2"
                    >
                      Your Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-md border border-olive/20"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-forest text-sm font-medium mb-2"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-md border border-olive/20"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <Controller
                      name="agreedToTerms"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="agreedToTerms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      )}
                    />
                    <label
                      htmlFor="agreedToTerms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to receive newsletters about products and special
                      offers.
                    </label>
                  </div>
                  {errors.agreedToTerms && (
                    <p className="text-destructive text-sm">
                      {errors.agreedToTerms.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-md transition duration-300"
                  >
                    Subscribe Now
                  </Button>
                </form>

                <p className="text-olive/70 text-sm mt-6">
                  By subscribing, you agree to our Privacy Policy. You can
                  unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
