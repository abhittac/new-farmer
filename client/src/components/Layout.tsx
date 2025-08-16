import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Cart from "./Cart";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  // Check if current route is home to manage full-width layout
  const isHome = location === "/";

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <Navbar />
      <Cart />
      <main className="flex-grow relative z-10">{children}</main>
      <Footer />

      {/* Background decorative elements */}
      <div className="fixed top-0 right-0 w-1/3 h-screen bg-gradient-to-b from-secondary/5 to-transparent -z-10"></div>
      <div className="fixed bottom-0 left-0 w-1/4 h-screen bg-gradient-to-t from-primary/5 to-transparent -z-10"></div>
    </div>
  );
}
