import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useSiteSettings } from "@/context/SiteContext";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn, debounce } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAnimations } from "@/hooks/use-animations";
import { useCategory } from "@/hooks/store";
import techizeLogo from "../../../public/uploads/techize-logo.png";
const useSearchParams = () => {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");

  const updateURL = (newParams: Record<string, string | null>) => {
    const currentParams = new URLSearchParams(location.split("?")[1] || "");

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        currentParams.delete(key);
      } else {
        currentParams.set(key, value);
      }
    });

    const newURL = currentParams.toString()
      ? `/products?${currentParams.toString()}`
      : "/products";
    navigate(newURL);
  };

  return { params, updateURL };
};

export default function Footer() {
  const { setCategory } = useCategory();
  const [location] = useLocation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { settings } = useSiteSettings();
  const { updateURL } = useSearchParams();

  const { params: searchParams } = useSearchParams();
  const categoryParam = searchParams.get("category");

  // State for categories
  const [mainCategories, setMainCategories] = useState<any[]>([]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({
          email,
          agreedToTerms: true,
        }),
      });

      toast({
        title: "Subscription successful!",
        description: "Thank you for joining our newsletter.",
      });

      setEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch main categories
  const fetchMainCategories = async () => {
    try {
      const response = await fetch("/api/categories/main");
      if (response.ok) {
        const data = await response.json();
        setMainCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch main categories:", error);
    }
  };

  // Handle category change
  // Update the handleCategoryChange function in your Footer component
  // In Footer.tsx
  // In Footer.tsx
  const handleCategoryChange = (categoryName: string | null) => {
    setCategory(categoryName);
    updateURL({
      category: categoryName || undefined,
      subcategory: null,
      page: "1",
      sortBy: "id",
      sortOrder: "desc",
      search: searchParams.get("search"),
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
    });

    // Scroll to top
    window.scrollTo(0, 0);
  };

  const handleClickUp = () => {
    window.scrollTo(0, 0);
  };
  // Load categories on component mount
  useEffect(() => {
    fetchMainCategories();
  }, []);

  return (
    <footer className="bg-[#283618] text-white pt-16 pb-8  w-full">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              {settings.siteLogo && (
                <img
                  src={settings.siteLogo}
                  alt={settings.siteName}
                  className="h-8 w-8 object-contain"
                />
              )}
              <h3 className="font-heading text-2xl font-bold text-white">
                {settings.siteName}
              </h3>
            </div>
            <p className="text-white/90 mb-6 leading-relaxed">
              {settings.siteTagline}
            </p>
            <div className="flex space-x-5 mt-4">
              {/* Dynamic Social Links */}
              {settings.socialLinks.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#DDA15E] transition-all duration-300"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.socialLinks.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#DDA15E] transition-all duration-300"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.socialLinks.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#DDA15E] transition-all duration-300"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings.socialLinks.linkedin && (
                <a
                  href={settings.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#DDA15E] transition-all duration-300"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {settings.socialLinks.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#DDA15E] transition-all duration-300"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {settings.socialLinks.website && (
                <a
                  href={settings.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#DDA15E] transition-all duration-300"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 border-b border-white/20 pb-2">
              Products
            </h4>
            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={cn(
                    "text-white/90 hover:text-[#DDA15E] transition-all duration-300 flex items-center",
                    !categoryParam && "text-[#DDA15E] font-medium"
                  )}
                >
                  All Products
                </button>
              </li>
              {mainCategories.map((category) => (
                <li key={category.id} onClick={handleClickUp}>
                  <button
                    onClick={() => handleCategoryChange(category.name)}
                    className={cn(
                      "text-white/90 hover:text-[#DDA15E] transition-all duration-300 flex items-center",
                      categoryParam === category.name &&
                        "text-[#DDA15E] font-medium"
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-[#DDA15E]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M7 17l9.2-9.2M17 17V7H7"></path>
                    </svg>
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About Us Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 border-b border-white/20 pb-2">
              About Us
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/our-story"
                  onClick={handleClickUp}
                  className="text-white/90 hover:text-[#DDA15E] transition-all duration-300 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-[#DDA15E]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17l9.2-9.2M17 17V7H7"></path>
                  </svg>
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  href="/farmers"
                  onClick={handleClickUp}
                  className="text-white/90 hover:text-[#DDA15E] transition-all duration-300 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-[#DDA15E]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17l9.2-9.2M17 17V7H7"></path>
                  </svg>
                  Meet the Farmers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 border-b border-white/20 pb-2">
              Customer Care
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/contact"
                  onClick={handleClickUp}
                  className="text-white/90 hover:text-[#DDA15E] transition-all duration-300 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-[#DDA15E]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17l9.2-9.2M17 17V7H7"></path>
                  </svg>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  onClick={handleClickUp}
                  className="text-white/90 hover:text-[#DDA15E] transition-all duration-300 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-[#DDA15E]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17l9.2-9.2M17 17V7H7"></path>
                  </svg>
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-returns"
                  onClick={handleClickUp}
                  className="text-white/90 hover:text-[#DDA15E] transition-all duration-300 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-[#DDA15E]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17l9.2-9.2M17 17V7H7"></path>
                  </svg>
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  onClick={handleClickUp}
                  className="text-white/90 hover:text-[#DDA15E] transition-all duration-300 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-[#DDA15E]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17l9.2-9.2M17 17V7H7"></path>
                  </svg>
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  onClick={handleClickUp}
                  className="text-white/90 hover:text-[#DDA15E] transition-all duration-300 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-[#DDA15E]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17l9.2-9.2M17 17V7H7"></path>
                  </svg>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/20 pt-8 pb-8">
          <div className="max-w-xl mx-auto text-center">
            <h4 className="text-white font-bold text-xl mb-4">
              Join Our Newsletter
            </h4>
            <p className="text-white/80 mb-6">
              Get updates on new arrivals, seasonal harvest news, and exclusive
              offers.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-md py-3 px-4 flex-grow focus:outline-none focus:ring-2 focus:ring-[#DDA15E]"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#DDA15E] hover:bg-[#DDA15E]/90 disabled:bg-[#DDA15E]/50 text-white font-semibold py-3 px-6 rounded-md transition-all duration-300"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-white/80 text-sm mb-2">
            © {new Date().getFullYear()} HarvestDirect. All rights reserved.
          </p>
          <p className="text-white/70 text-sm mb-2">
            Made with ❤️ for farmers and natural food.
          </p>
          <p className="text-white/60 text-xs flex items-center justify-center gap-1">
            Designed by
            <a
              className="flex items-center"
              href="https://www.techizebuilder.com/project-category/business"
            >
              <span className="font-medium">Techize Builder</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
