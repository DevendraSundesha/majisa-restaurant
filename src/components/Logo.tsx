import React from 'react';

interface LogoProps {
  className?: string;
  alt?: string;
}

export const LOGO_BASE64 = "/logo.png";

export default function Logo({ className = "w-12 h-12", alt = "Majisa Restaurant Logo" }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`object-contain inline-block ${className}`}
    />
  );
}
