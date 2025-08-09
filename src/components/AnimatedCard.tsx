import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  animationKey?: number;
  delay?: number;
}

export const AnimatedCard = ({ children, className = "", animationKey = 0, delay = 0 }: AnimatedCardProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animationKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.3, 
          delay: delay * 0.1,
          ease: "easeOut"
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export const FadeIn = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

export const SlideIn = ({ children, direction = "up", delay = 0 }: { 
  children: ReactNode; 
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}) => {
  const variants = {
    up: { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: 20, opacity: 0 },
    right: { x: -20, opacity: 0 }
  };

  return (
    <motion.div
      initial={variants[direction]}
      animate={{ y: 0, x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
};
