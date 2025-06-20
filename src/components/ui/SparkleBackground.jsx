import React, { useMemo } from 'react';

const SparkleBackground = () => {
  const sparkles = useMemo(() => {
    const sparkleCount = 100; // Increase for more density
    return Array.from({ length: sparkleCount }).map((_, i) => {
      const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 2 + 1}px`,
        height: `${Math.random() * 2 + 1}px`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 3 + 2}s`,
      };
      return <div key={i} className="absolute bg-white rounded-full sparkle" style={style} />;
    });
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      {sparkles}
      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1); }
          }
          .sparkle {
            animation-name: twinkle;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }
        `}
      </style>
    </div>
  );
};

export default SparkleBackground; 