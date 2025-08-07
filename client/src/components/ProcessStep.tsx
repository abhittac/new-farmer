import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  icon?: ReactNode;
}

export default function ProcessStep({
  number,
  title,
  description,
  icon
}: ProcessStepProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-cream rounded-lg p-8 shadow-md hover:shadow-xl transition duration-300 h-full">
        <CardContent className="p-0">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
            {number}
          </div>
          <h3 className="font-heading text-forest text-xl font-bold mb-4">{title}</h3>
          <p className="text-olive">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
