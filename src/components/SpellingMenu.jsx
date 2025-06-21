import { useState, useEffect } from 'react';
import { BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const SpellingMenu = ({ onSelectMode, onHome }) => {
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
        @keyframes cow-abduction {
          0%, 100% {
            transform: translateX(0) translateY(0) rotate(-4deg);
          }
          50% {
            transform: translateX(-3px) translateY(-1px) rotate(4deg);
          }
        }
        .animate-cow-abduction {
          animation: cow-abduction 4s ease-in-out infinite;
        }
      `}</style>
      <div 
        className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 relative"
        onKeyDown={handleKeyPress}
        tabIndex={0}
      >
        {/* Space Adventure themed background elements (now handled by App.jsx) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 text-5xl animate-rocket-fly-by">🚀</div>
          <div className="absolute bottom-10 right-12 text-5xl animate-gentle-bounce">🛸</div>
          <div className="absolute top-1/5 left-1/5 text-6xl">🌙</div>
          <div className="absolute bottom-1/3 left-1/8 text-5xl">🪐</div>
          <div className="absolute top-0 right-20 text-4xl animate-fly-by">☄️</div>
        </div>
        {/* Header with home button */}
        <div className="absolute bottom-6 right-4 z-10 flex items-center gap-2">
          <div className="text-4xl animate-cow-abduction">🐄</div>
          <Button
            onClick={onHome}
            className="bg-green-500/70 hover:bg-green-600/70 text-white px-4 py-2 border-0"
            title="Home (Ctrl+Shift+H)"
          >
            <Home size={20} />
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 md:mb-12 relative z-10 text-white">
          <div className="text-8xl md:text-9xl mb-4">📚</div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Spelling Games
          </h1>
          <p className="text-xl md:text-2xl">
            Learn and practice spelling with fun!
          </p>
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

