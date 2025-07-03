import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Lock, LockOpen } from 'lucide-react';
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
import petriBackground from '../assets/matching-game/petri-background.png';

// Microscopic items configuration with movement types
const microscopicItems = [
  { id: 1, name: 'Amoeba', image: amoeba, movementType: 'active' }, // Moves with pseudopods
  { id: 2, name: 'Paramecium', image: paramecium, movementType: 'active' }, // Moves with cilia
  { id: 3, name: 'Diatom', image: diatom, movementType: 'passive' }, // Non-living, drifts
  { id: 4, name: 'Red Blood Cell', image: redBloodCell, movementType: 'passive' }, // No self-propulsion
  { id: 5, name: 'White Blood Cell', image: whiteBloodCell, movementType: 'active' }, // Moves actively
  { id: 6, name: 'Mold Spore', image: moldSpore, movementType: 'passive' }, // Drifts
  { id: 7, name: 'Sodium Crystal', image: sodiumCrystal, movementType: 'static' }, // Non-living crystal
  { id: 8, name: 'Euglena', image: euglena, movementType: 'active' }, // Moves with flagellum
  { id: 9, name: 'Virus', image: virus, movementType: 'passive' }, // No self-propulsion
  { id: 10, name: 'Pollen Grain', image: rainbowPollenGrain, movementType: 'static' }, // Non-living
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
  // Calculate position within a constrained circular area
  const angle = (index / totalItems) * 2 * Math.PI + (Math.random() * 0.5);
  const maxRadius = 30; // Keep items within 30% radius from center
  const minRadius = 10; // Minimum distance from center
  const radius = minRadius + (Math.random() * (maxRadius - minRadius));
  
  // Center at 50%, 50% with radius constraints
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);

  // Determine animation duration based on movement type
  const getAnimationDuration = () => {
    switch (item.movementType) {
      case 'active': // Living microbes with propulsion
        return 4 + (index % 3) * 1; // 4-6 seconds
      case 'passive': // Living but no self-propulsion
        return 8 + (index % 3) * 2; // 8-12 seconds
      case 'static': // Non-living particles
        return 12 + (index % 3) * 3; // 12-18 seconds
      default:
        return 8 + index * 2;
    }
  };

  // Choose animation name based on movement type
  const getAnimationName = () => {
    return item.movementType === 'active' ? 'float-active' : 'float';
  };

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
        animation: `${getAnimationName()} ${getAnimationDuration()}s ease-in-out infinite`,
        animationDelay: `${index * 0.3}s`
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

const MatchingGame = ({ onHome, onLock, isNavigationLocked }) => {
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
    <div 
      className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden"
      style={{
        backgroundImage: `url(${petriBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >

      {/* Score and Round display */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <p className="text-white text-lg font-semibold">Round: {round}</p>
          <p className="text-white text-lg font-semibold">Score: {score}</p>
        </div>
      </div>

      {/* Navigation buttons - top right */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          onClick={onLock}
          className={`px-4 py-2 ${isNavigationLocked ? 'bg-orange-500/70 hover:bg-orange-600/70' : 'bg-gray-500/70 hover:bg-gray-600/70'} text-white border-0`}
          title={isNavigationLocked ? "Unlock Navigation (Ctrl+L)" : "Lock Navigation (Ctrl+L)"}
        >
          {isNavigationLocked ? <Lock size={20} /> : <LockOpen size={20} />}
        </Button>
        <Button
          onClick={onHome}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20"
          disabled={isNavigationLocked}
        >
          <Home className="mr-2" size={20} />
          Home
        </Button>
      </div>

      {/* Floating microscopic items directly on background */}
      <div className="absolute inset-0">
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

      {/* Crosshair/Reticule overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-black transform -translate-x-1/2"></div>
        {/* Horizontal line */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-black transform -translate-y-1/2"></div>
      </div>

      {/* Target card - bottom right */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-2">Find This:</p>
          <Card className="w-40 h-40 md:w-48 md:h-48 bg-white border-4 border-yellow-400 shadow-2xl">
            <CardContent className="p-0 h-full flex items-center justify-center relative">
              {targetItem && (
                <>
                  <img 
                    src={targetItem.image} 
                    alt={targetItem.name}
                    className="w-full h-full object-contain p-2 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
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


    </div>
  );
};

export default MatchingGame; 