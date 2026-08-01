'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

interface GlassButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'default' | 'active' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function GlassButton({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: GlassButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`glass-button glass-button-${variant} glass-button-${size} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
