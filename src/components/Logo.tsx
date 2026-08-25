import React from 'react';

interface LogoProps {
  className?: string;
  alt?: string;
}

export const LOGO_BASE64 = "/logo.png";

export default function Logo({ className = "w-12 h-12", alt = "Majisa Balotra - Majisa Restaurant Balotra (Desi Dhaba) Logo" }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      loading="eager"
      className={`object-contain inline-block ${className}`}
    />
  );
}
