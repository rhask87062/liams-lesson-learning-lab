import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import labBackground from '../assets/lab.png';
import telescope from '../assets/telescope.png';
import microscope from '../assets/microscope.png';
import chemistrySet from '../assets/chemistry-set.png';
import computer from '../assets/computer.png';
import whiteboard from '../assets/whiteboard.png';
import fossil from '../assets/fossil.png';
import banner from '../assets/banner.png';

const RootMenu = ({ onSelectActivity, onProgressDashboard }) => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      installPromptEvent.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA installation');
        } else {
          console.log('User dismissed the PWA installation');
        }
        setInstallPromptEvent(null);
        setCanInstall(false);
      });
    } else {
      // Fallback: Show manual install instructions
      alert('To install this app:\n\n1. Click the browser menu (⋮ or ⋯)\n2. Look for "Install app" or "Add to Home Screen"\n3. Follow the prompts to install');
    }
  };

  const labAssets = [
    {
      id: 'spelling',
      title: 'Spelling Games',
      asset: telescope,
      position: 'absolute right-125 top-35',
      size: 'w-20 h-20 md:w-100 md:h-100',
      glow: 'group-hover:drop-shadow-[0_0_15px_#3B82F6]', // Blue glow
      labelColor: 'text-blue-500',
      labelGap: '-mt-15', // Custom gap for telescope
      textGlow: 'group-hover:drop-shadow-[0_0_25px_#3B82F6]',
      hoverTransform: 'group-hover:-translate-y-5', // 4px up for spelling games
      hoverTextColor: 'group-hover:text-blue-300' // Brighter blue
    },
    {
      id: 'matching-game',
      title: 'Matching Game',
      asset: microscope,
      position: 'absolute left-0 top-68',
      size: 'w-16 h-16 md:w-70 md:h-70',
      glow: 'group-hover:drop-shadow-[0_0_15px_#22C55E]', // Green glow
      labelColor: 'text-green-500',
      labelGap: '-mt-12', // Custom gap for microscope
      textGlow: 'group-hover:drop-shadow-[0_0_25px_#22C55E]',
      hoverTransform: 'group-hover:-translate-y-2.5', // 2px up for matching game
      hoverTextColor: 'group-hover:text-green-300' // Brighter green
    },
    {
      id: 'magic-paint',
      title: 'Magic Paint',
      asset: computer,
      position: 'absolute left-375 top-55',
      size: 'w-20 h-20 md:w-100 md:h-100',
      glow: 'group-hover:drop-shadow-[0_0_15px_#4338CA]', // Indigo glow to match text-indigo-700
      labelColor: 'text-indigo-700',
      labelGap: '-mt-23', // Custom gap for computer
      textGlow: 'group-hover:drop-shadow-[0_0_25px_#4338CA]',
      hoverTransform: 'group-hover:-translate-y-3.5', // 2px up for magic paint
      hoverTextColor: 'group-hover:text-indigo-400', // Brighter indigo
      labelOffset: '-translate-x-25' // Move label 20px left
    },
    {
      id: 'letter-learner',
      title: 'Letter Learner',
      asset: fossil,
      position: 'absolute left-90 bottom-65',
      size: 'w-20 h-20 md:w-88 md:h-88',
      glow: 'group-hover:drop-shadow-[0_0_15px_#F97316]', // Orange glow to match text-orange-500
      labelColor: 'text-orange-500',
      labelGap: '-mt-22', // Custom gap for fossil
      textGlow: 'group-hover:drop-shadow-[0_0_25px_#F97316]',
      hoverTransform: 'group-hover:-translate-y-3', // 4px up for letter learner
      hoverTextColor: 'group-hover:text-orange-300' // Brighter orange
    },

  ];

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${labBackground})` }}
    >
      {/* Progress Button - Top Right */}
      <div className="absolute top-4 right-9 group cursor-pointer z-20">
        <Button
          onClick={onProgressDashboard}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xl flex items-center justify-center text-lg font-medium border-2 border-white transition-all duration-300 group-hover:drop-shadow-[0_0_15px_#3B82F6] group-hover:scale-110"
        >
          📊
        </Button>
        
        {/* Progress Button Label */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-blue-500 group-hover:text-blue-300 group-hover:drop-shadow-[0_0_15px_#3B82F6] text-sm font-black whitespace-nowrap text-center transition-all duration-300" style={{ fontFamily: 'Impact, "Arial Black", "Trebuchet MS", sans-serif', letterSpacing: '0.5px' }}>
            Progress Data
          </div>
        </div>
      </div>

      {/* Install App Button - Below Progress */}
      <div className="absolute top-25 right-9 group cursor-pointer z-20">
        <Button
          onClick={handleInstallClick}
          className="w-14 h-14 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-xl flex items-center justify-center text-lg font-medium border-2 border-white transition-all duration-300 group-hover:drop-shadow-[0_0_15px_#22C55E] group-hover:scale-110"
        >
          📱
        </Button>
        
        {/* Install Button Label */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-green-500 group-hover:text-green-300 group-hover:drop-shadow-[0_0_15px_#22C55E] text-sm font-black whitespace-nowrap text-center transition-all duration-300" style={{ fontFamily: 'Impact, "Arial Black", "Trebuchet MS", sans-serif', letterSpacing: '0.5px' }}>
            Install App Locally
          </div>
        </div>
      </div>

      {/* Banner at top */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
        <img 
          src={banner} 
          alt="Liam's Learning Lab" 
          className="h-16 md:h-65 w-auto transform scale-x-125"
        />
      </div>

      {/* Interactive Lab Assets */}
      {labAssets.map((item, index) => (
        <div 
          key={item.id} 
          className={`${item.position} group cursor-pointer z-10 p-8`}
          onClick={() => onSelectActivity(item.id)}
          tabIndex={index + 1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectActivity(item.id);
            }
          }}
        >
          {/* Asset Image */}
          <img 
            src={item.asset} 
            alt={item.title}
            className={`${item.size} opacity-100 group-hover:scale-110 ${item.hoverTransform} transition-all duration-300 group-hover:filter ${item.glow}`}
          />
          
          {/* Label */}
          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 ${item.labelGap} ${item.labelOffset || ''} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}>
            <div className={`${item.labelColor} ${item.hoverTextColor} ${item.textGlow} text-xl md:text-2xl font-black whitespace-nowrap text-center drop-shadow-lg transition-all duration-300`} style={{ fontFamily: 'Impact, "Arial Black", "Trebuchet MS", sans-serif', letterSpacing: '0.5px' }}>
              {item.title}
            </div>
          </div>
        </div>
      ))}
      </div>
  );
};

export default RootMenu;

