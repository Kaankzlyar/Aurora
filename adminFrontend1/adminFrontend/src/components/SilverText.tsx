import React from "react";
import "./SilverText.css";

interface SilverTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

export default function SilverText({ 
  children, 
  className = "", 
  style, 
  size = "md",
  animated = false,
  ...props 
}: SilverTextProps & React.HTMLAttributes<HTMLSpanElement>) {
  
  const sizeClass = size !== "md" ? `silver-text-${size}` : "";
  const animatedClass = animated ? "silver-text-animated" : "";
  
  const combinedClassName = [
    "silver-text",
    sizeClass,
    animatedClass,
    className
  ].filter(Boolean).join(" ");

  const silverTextStyle: React.CSSProperties = {
    fontFamily: "Montserrat, sans-serif",
    fontSize: size === "md" ? "18px" : undefined,
    fontWeight: 600,
    letterSpacing: size === "md" ? "1px" : undefined,
    display: "inline-block",
    ...style,
  };

  return (
    <span 
      className={combinedClassName} 
      style={silverTextStyle}
      {...props}
    >
      {children}
    </span>
  );
}
