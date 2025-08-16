import { ReactNode, useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxSectionProps {
  backgroundUrl: string;
  opacity?: number;
  children: ReactNode;
  className?: string;
  overlayColor?: string;
}

export function ParallaxSection({
  backgroundUrl,
  opacity = 0.6, // Increased opacity for better text contrast
  children,
  className = "",
  overlayColor = "bg-forest",
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, windowHeight * 0.2]);

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          // y,
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-70" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
