import { useState, useEffect } from 'react';
import { BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
// Import the new space-themed assets
import moon from '../assets/spelling-menu/moon.png';
import meteor from '../assets/spelling-menu/meteor.png';
import ufo from '../assets/spelling-menu/ufo.png';
import cow from '../assets/spelling-menu/cow.png';
import rocket from '../assets/spelling-menu/rocket.png';
import satellite from '../assets/satellite.png'; // Import satellite.png

const SpellingMenu = ({ onSelectMode, onHome }) => {
  const [animateItems, setAnimateItems] = useState({
    satellite: false,
    rocket: false,
  });

  useEffect(() => {
    const satelliteTimer = setTimeout(() => {
      setAnimateItems(prev => ({ ...prev, satellite: true }));
    }, Math.random() * 5000 + 1000); // Random delay 1-6s

    const rocketTimer = setTimeout(() => {
      setAnimateItems(prev => ({ ...prev, rocket: true }));
    }, Math.random() * 8000 + 2000); // Random delay 2-10s

    return () => {
      clearTimeout(satelliteTimer);
      clearTimeout(rocketTimer);
    };
  }, []);

  const modes = [
    {
      id: 'learn',
      title: 'Learn Mode',
      description: 'See and hear words',
      color: 'from-blue-400 to-blue-600',
      emoji: '📖'
    },
    {
      id: 'copy',
      title: 'Copy Mode', 
      description: 'Practice typing words',
      color: 'from-purple-400 to-purple-600',
      emoji: '✍️'
    },
    {
      id: 'fillblank',
      title: 'Fill Blanks',
      description: 'Complete missing letters',
      color: 'from-yellow-400 to-orange-500',
      emoji: '🧩'
    },
    {
      id: 'test',
      title: 'Test Mode',
      description: 'Spell from picture only',
      color: 'from-red-400 to-red-600',
      emoji: '🏆'
    }
  ];

  const handleKeyPress = (e) => {
    // Global hotkeys with modifiers
    if (e.ctrlKey && e.shiftKey && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      onHome();
      return;
    }
    
    // Mode selection hotkeys
    if (e.key === '1') onSelectMode('learn');
    if (e.key === '2') onSelectMode('copy');
    if (e.key === '3') onSelectMode('fillblank');
    if (e.key === '4') onSelectMode('test');
    
    // New hotkey for spelling menu (Ctrl+M for Menu)
    if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) {
      e.preventDefault();
      // This will be handled by parent to show spelling menu
    }
  };

  return (
    <>
      <style>{`
        @keyframes cow-drift {
          0% {
            transform: translateX(0) translateY(0) rotate(0deg);
          }
          25% {
            transform: translateX(-30px) translateY(-20px) rotate(15deg);
          }
          50% {
            transform: translateX(-50px) translateY(10px) rotate(-10deg);
          }
          75% {
            transform: translateX(-20px) translateY(30px) rotate(5deg);
          }
          100% {
            transform: translateX(0) translateY(0) rotate(0deg);
          }
        }
        .animate-cow-drift {
          animation: cow-drift 20s ease-in-out infinite;
        }
        @keyframes gentle-rock {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }
        .animate-gentle-rock {
          animation: gentle-rock 9s ease-in-out infinite;
        }
        @keyframes satellite-pass {
          0% {
            transform: translateX(-10vw) translateY(20vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateX(110vw) translateY(20vh) rotate(360deg);
            opacity: 1;
          }
        }
        .animate-satellite-pass {
          animation: satellite-pass 50s linear infinite;
          animation-fill-mode: backwards;
        }
        @keyframes rocket-fly-by {
            0% {
                transform: translate(-10vw, 120vh) scale(0.6) rotate(0deg);
                opacity: 0;
            }
            25% {
                transform: translate(20vw, 70vh) scale(1) rotate(5deg);
                opacity: 1;
            }
            50% {
                transform: translate(55vw, 45vh) scale(1) rotate(10deg);
                opacity: 1;
            }
            75% {
                transform: translate(90vw, 25vh) scale(1) rotate(15deg);
                opacity: 1;
            }
            100% {
                transform: translate(120vw, 10vh) scale(0.6) rotate(20deg);
                opacity: 0;
            }
        }
        .animate-rocket-fly-by {
            animation: rocket-fly-by 15s linear infinite;
            animation-fill-mode: backwards;
        }
        @keyframes gentle-bounce {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-8px) rotate(2deg);
          }
          50% {
            transform: translateY(-15px) rotate(0deg);
          }
          75% {
            transform: translateY(-8px) rotate(-2deg);
          }
        }
        .animate-gentle-bounce {
          animation: gentle-bounce 6s ease-in-out infinite;
          animation-delay: 1s;
        }
        @keyframes ufo-hover {
          0% {
            transform: translate(0, 0) rotate(0deg);
            filter: drop-shadow(0 0 10px hsl(0, 100%, 50%));
          }
          10% {
            transform: translate(5px, -10px) rotate(5deg);
          }
          20% {
            transform: translate(-10px, 0px) rotate(-5deg);
          }
          30% {
            transform: translate(0px, 10px) rotate(0deg);
            filter: drop-shadow(0 0 15px hsl(60, 100%, 50%));
          }
          40% { /* Darting action */
            transform: translate(50px, -30px) rotate(15deg);
          }
          50% {
            transform: translate(20px, 20px) rotate(-10deg);
            filter: drop-shadow(0 0 10px hsl(120, 100%, 50%));
          }
          60% {
            transform: translate(-20px, -20px) rotate(10deg);
          }
          70% {
            transform: translate(10px, 0px) rotate(-5deg);
            filter: drop-shadow(0 0 15px hsl(180, 100%, 50%));
          }
          80% { /* Darting action */
            transform: translate(-40px, 30px) rotate(-15deg);
          }
          90% {
            transform: translate(0px, -5px) rotate(5deg);
            filter: drop-shadow(0 0 10px hsl(240, 100%, 50%));
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
            filter: drop-shadow(0 0 10px hsl(300, 100%, 50%));
          }
        }
        .animate-ufo-hover {
            animation: ufo-hover 15s ease-in-out infinite;
        }
        .celestial-glow {
          filter: drop-shadow(0 0 6px rgba(255, 255, 224, 0.8));
        }
      `}</style>
            <div
        className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 relative"
        onKeyDown={handleKeyPress}
        tabIndex={0}
      >
        {/* Space Adventure themed background elements with proper z-index layering */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Jupiter - furthest back after stars */}
          <div className="absolute bottom-1/3 left-1/8 text-5xl z-[1]">🪐</div>
          
          {/* Moon - second furthest back */}
          <img 
            src={moon} 
            alt="Moon" 
            className="absolute top-1/5 left-1/5 w-16 h-16 md:w-20 md:h-20 animate-gentle-rock celestial-glow z-[2]" 
          />
          
          {/* Mid-range objects */}
          <img 
            src={meteor} 
            alt="Meteor" 
            className="absolute top-0 right-20 w-10 h-10 md:w-12 md:h-12 animate-fly-by z-[5]" 
          />
          <img 
            src={satellite} 
            alt="Satellite" 
            className={`absolute top-1/5 left-1/2 w-10 h-10 md:w-12 md:h-12 z-[6] opacity-0 ${animateItems.satellite ? 'animate-satellite-pass' : ''}`} // Use img tag
          />
          
          {/* Foreground objects */}
          <img 
            src={ufo} 
            alt="UFO" 
            className="absolute top-12 right-16 w-12 h-12 md:w-16 md:h-16 animate-ufo-hover z-[7]" 
          />
          <img 
            src={rocket} 
            alt="Rocket" 
            className={`absolute top-10 left-40 w-12 h-12 md:w-16 md:h-16 opacity-0 z-[8] ${animateItems.rocket ? 'animate-rocket-fly-by' : ''}`}
          />
        </div>
        {/* Home button - top right */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            onClick={onHome}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20"
          >
            <Home className="mr-2" size={20} />
            Home
          </Button>
        </div>
        
        {/* Cow animation - bottom right with slow drift */}
        <div className="absolute bottom-16 right-16 z-[9]">
          <img 
            src={cow} 
            alt="Cow" 
            className="w-8 h-8 md:w-10 md:h-10 animate-cow-drift" 
          />
        </div>

        {/* Mode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl relative z-10">
          {modes.map((mode, index) => (
            <Button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`relative h-40 md:h-48 p-6 md:p-8 bg-gradient-to-br ${mode.color} hover:scale-105 transform transition-all duration-300 shadow-xl hover:shadow-2xl rounded-3xl border-0 text-white group overflow-hidden`}
              tabIndex={index + 1}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="text-4xl md:text-5xl mb-2">{mode.emoji}</div>
                <h2 className="text-xl md:text-2xl font-bold">{mode.title}</h2>
                <p className="text-base md:text-lg opacity-90">{mode.description}</p>
              </div>

              {/* Number indicator */}
              <div className="absolute top-3 right-3 bg-white/20 rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center">
                <span className="text-sm md:text-base font-bold">{index + 1}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};

export default SpellingMenu;