import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedTextProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

export function AnimatedText({ 
  children, 
  delay = 0.3, 
  className = "", 
  tag = "div"
}: AnimatedTextProps) {
  const variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 1, 
        ease: "easeOut",
        delay
      }
    }
  };

  const Component = motion[tag];

  return (
    <Component
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
    >
      {children}
    </Component>
  );
}
