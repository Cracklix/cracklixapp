
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

export const ButtonAnimated = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full"
      >
        <Button
          ref={ref}
          className={cn("w-full transition-all duration-300 font-medium", className)}
          {...props}
        />
      </motion.div>
    );
  }
);
ButtonAnimated.displayName = "ButtonAnimated";
