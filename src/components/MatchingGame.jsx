import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import all microscopic item assets
import amoeba from '../assets/matching-game/amoeba.png';
import paramecium from '../assets/matching-game/paramecium.png';
import diatom from '../assets/matching-game/diatom.png';
import redBloodCell from '../assets/matching-game/red-blood-cell.png';
import whiteBloodCell from '../assets/matching-game/white-blood-cell.png';
import moldSpore from '../assets/matching-game/mold-spore.png';
import sodiumCrystal from '../assets/matching-game/sodium-crystal.png';
import euglena from '../assets/matching-game/euglena.png';
import virus from '../assets/matching-game/virus.png';
import rainbowPollenGrain from '../assets/matching-game/rainbow-pollen-grain.png';

// Try to import petri background - will use gradient fallback if not available
let petriBackground = null;
try {
  petriBackground = require('../assets/matching-game/petri-background.png');
} catch (e) {
  // File doesn't exist yet, will use gradient background
}

// Microscopic items configuration
const microscopicItems = [
  { id: 1, name: 'Amoeba', image: amoeba },
  { id: 2, name: 'Paramecium', image: paramecium },
  { id: 3, name: 'Diatom', image: diatom },
  { id: 4, name: 'Red Blood Cell', image: redBloodCell },
  { id: 5, name: 'White Blood Cell', image: whiteBloodCell },
  { id: 6, name: 'Mold Spore', image: moldSpore },
  { id: 7, name: 'Sodium Crystal', image: sodiumCrystal },
  { id: 8, name: 'Euglena', image: euglena },
  { id: 9, name: 'Virus', image: virus },
  { id: 10, name: 'Pollen Grain', image: rainbowPollenGrain },
];

// Letters to use for matching
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// Fisher-Yates shuffle
const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Floating item component
const FloatingItem = ({ item, letter, onClick, isSelected, isCorrect, isTarget, index, totalItems }) => {
  // Calculate position in a circular pattern
  const angle = (index / totalItems) * 2 * Math.PI;
  const radius = 35; // percentage of container
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);

  return (
    <div
      onClick={onClick}
      className={cn(
        "absolute w-24 h-24 md:w-32 md:h-32 cursor-pointer transition-all duration-500 transform hover:scale-110",
        "flex items-center justify-center rounded-full",
        isSelected && isCorrect && "scale-125 z-20",
        isSelected && !isCorrect && "scale-90 opacity-50",
        isTarget && isSelected && "ring-4 ring-green-500",
        !isSelected && "hover:z-10"
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%)`,
        animation: `float ${5 + index}s ease-in-out infinite`,
        animationDelay: `${index * 0.5}s`
      }}
    >
      <div className="relative w-full h-full">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-contain rounded-full"
        />
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          "text-4xl md:text-5xl font-bold text-white",
          "rounded-full"
        )}>
          <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {letter}
          </span>
        </div>
      </div>
    </div>
  );
};

const MatchingGame = ({ onHome }) => {
  const [gameItems, setGameItems] = useState([]);
  const [targetItem, setTargetItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [itemCount, setItemCount] = useState(
    parseInt(localStorage.getItem('matchingGameItems') || '6')
  );

  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = () => {
      const newCount = parseInt(localStorage.getItem('matchingGameItems') || '6');
      setItemCount(newCount);
    };

    window.addEventListener('matchingGameSettingsChanged', handleSettingsChange);
    window.addEventListener('storage', handleSettingsChange);

    return () => {
      window.removeEventListener('matchingGameSettingsChanged', handleSettingsChange);
      window.removeEventListener('storage', handleSettingsChange);
    };
  }, []);

  const setupNewRound = () => {
    // Reset selection state
    setSelectedItem(null);
    setIsCorrect(false);

    // Randomly select items and assign letters
    const shuffledItems = shuffle(microscopicItems);
    const selectedItems = shuffledItems.slice(0, itemCount);
    
    // Assign letters to items
    const gameItemsWithLetters = selectedItems.map((item, index) => ({
      ...item,
      letter: letters[index],
      uniqueId: `${item.id}-${Date.now()}-${index}`
    }));

    // Choose target item
    const target = gameItemsWithLetters[Math.floor(Math.random() * gameItemsWithLetters.length)];
    
    setGameItems(shuffle(gameItemsWithLetters));
    setTargetItem(target);
  };

  useEffect(() => {
    setupNewRound();
  }, [round, itemCount]); // Also re-setup when itemCount changes

  const handleItemClick = (item) => {
    if (selectedItem) return; // Prevent multiple selections

    setSelectedItem(item);
    const correct = item.letter === targetItem.letter && item.id === targetItem.id;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    // Move to next round after delay
    setTimeout(() => {
      setRound(round + 1);
    }, correct ? 1500 : 2000);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-2xl animate-pulse animation-delay-2000" />
      </div>

      {/* Score and Round display */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <p className="text-white text-lg font-semibold">Round: {round}</p>
          <p className="text-white text-lg font-semibold">Score: {score}</p>
        </div>
      </div>

      {/* Home button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={onHome}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20"
        >
          <Home className="mr-2" size={20} />
          Home
        </Button>
      </div>

      {/* Main petri dish container */}
      <div className="relative w-[600px] h-[600px] md:w-[800px] md:h-[800px] max-w-[90vw] max-h-[70vh]">
        {/* Petri dish background */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100/10 to-gray-300/10 border-4 border-white/50 shadow-2xl"
          style={petriBackground ? {
            backgroundImage: `url(${petriBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          {/* Inner circle for depth effect */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-transparent to-white/5 border border-white/10" />
        </div>

        {/* Floating microscopic items */}
        {gameItems.map((item, index) => (
          <FloatingItem
            key={item.uniqueId}
            item={item}
            letter={item.letter}
            onClick={() => handleItemClick(item)}
            isSelected={selectedItem?.uniqueId === item.uniqueId}
            isCorrect={isCorrect}
            isTarget={item.letter === targetItem?.letter && item.id === targetItem?.id}
            index={index}
            totalItems={gameItems.length}
          />
        ))}
      </div>

      {/* Target card - bottom right */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-2">Find This:</p>
          <Card className="w-40 h-40 md:w-48 md:h-48 bg-white/90 backdrop-blur-md border-4 border-yellow-400 shadow-2xl">
            <CardContent className="p-0 h-full flex items-center justify-center relative">
              {targetItem && (
                <>
                  <img 
                    src={targetItem.image} 
                    alt={targetItem.name}
                    className="w-full h-full object-contain p-4"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl md:text-6xl font-bold text-black/80 bg-white/60 rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                      {targetItem.letter}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feedback message */}
      {selectedItem && (
        <div className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30",
          "text-6xl font-bold animate-bounce",
          isCorrect ? "text-green-400" : "text-red-400"
        )}>
          {isCorrect ? "Correct! 🎉" : "Try Again! 🔬"}
        </div>
      )}

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px) rotate(0deg);
          }
          33% {
            transform: translate(-50%, -50%) translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translate(-50%, -50%) translateY(10px) rotate(240deg);
          }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default MatchingGame; 