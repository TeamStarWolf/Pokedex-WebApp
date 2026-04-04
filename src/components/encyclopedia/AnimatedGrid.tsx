import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

type GridProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  className?: string;
};

export function AnimatedGrid({ children, className, ...rest }: GridProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type ItemProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedGridItem({ children, className }: ItemProps) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
