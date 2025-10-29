import React from "react";

export interface StarStyle extends React.CSSProperties {
  left: string;
  top: string;
  width: string;
  height: string;
  animationDuration: string;
  animationDelay: string;
}

export interface StarConfig {
  count?: number;
  minSize?: number;
  maxSize?: number;
  minDuration?: number;
  maxDuration?: number;
  maxDelay?: number;
  edgeMargin?: number;
}

// Star component for background animation
export const Star = ({ style }: { style: StarStyle }) => (
  <div 
    className="absolute bg-white rounded-full" 
    style={{
      left: style.left,
      top: style.top,
      width: style.width,
      height: style.height,
      animation: `twinkle ${style.animationDuration} ease-in-out infinite`,
      animationDelay: style.animationDelay,
    }}
  />
);

// Generate random stars with configurable options
export const generateStars = (config: StarConfig = {}): StarStyle[] => {
  const {
    count = 70,
    minSize = 1.5,
    maxSize = 3,
    minDuration = 3,
    maxDuration = 7,
    maxDelay = 3,
    edgeMargin = 2.5
  } = config;

  const stars: StarStyle[] = [];
  
  for (let i = 0; i < count; i++) {
    const size = Math.random() * (maxSize - minSize) + minSize;
    const positionRange = 100 - (edgeMargin * 2);
    
    stars.push({
      left: `${Math.random() * positionRange + edgeMargin}%`,
      top: `${Math.random() * positionRange + edgeMargin}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${Math.random() * (maxDuration - minDuration) + minDuration}s`,
      animationDelay: `${Math.random() * maxDelay}s`,
    });
  }
  
  return stars;
};

// CSS keyframes for the twinkle animation
export const getTwinkleCSS = () => `
  @keyframes twinkle {
    0%, 100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.3);
    }
  }
`;