import React, { useState, useEffect } from 'react';
import Silk from './Silk';

interface SilkBackgroundProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

const SilkBackground: React.FC<SilkBackgroundProps> = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Silk component'inin yüklenmesi için kısa bir delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Loading gradient background */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(196, 137, 19, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(196, 137, 19, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #1a1a1a 100%)
          `,
        }}
      />
      
      {/* Silk component with fade in */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Silk {...props} />
      </div>
    </div>
  );
};

export default SilkBackground;
