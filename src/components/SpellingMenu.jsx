import { useState } from 'react';
import { BookOpen, Lock, LockOpen } from 'lucide-react';
import HomeButton from '@/components/HomeButton.jsx';
import { Button } from '@/components/ui/button.jsx';

const SpellingMenu = ({ onSelectMode, onHome, onLock, isNavigationLocked }) => {
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
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      onLock();
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
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-emerald-400 via-cyan-500 via-blue-500 to-purple-600 relative overflow-hidden"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Space Adventure themed background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-5xl animate-bounce">🚀</div>
        <div className="absolute top-20 right-20 text-4xl animate-pulse">⭐</div>
        <div className="absolute bottom-20 left-20 text-6xl animate-bounce delay-1000">🌟</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-pulse delay-500">🛸</div>
        <div className="absolute top-1/2 left-5 text-3xl animate-bounce delay-700">🌙</div>
        <div className="absolute top-1/3 right-5 text-4xl animate-pulse delay-300">✨</div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl animate-bounce delay-200">🪐</div>
        <div className="absolute top-1/4 right-1/3 text-4xl animate-pulse delay-800">☄️</div>
      </div>
      {/* Header with home button */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <Button
          onClick={onLock}
          className={`px-4 py-2 ${isNavigationLocked ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-lg`}
        >
          {isNavigationLocked ? <Lock size={20} /> : <LockOpen size={20} />}
        </Button>
        <HomeButton onClick={onHome} />
      </div>

      {/* Header */}
      <div className="text-center mb-8 md:mb-12 relative z-10">
        <div className="text-8xl md:text-9xl mb-4">📚</div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Spelling Games
        </h1>
        <p className="text-xl md:text-2xl text-gray-600">
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

      {/* Instructions */}
      <div className="mt-8 md:mt-12 text-center relative z-10">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
            <div>
              <p className="text-gray-700 mb-2">
                <strong>Learn Mode:</strong> See words with pictures and hear how they sound
              </p>
              <p className="text-gray-700">
                <strong>Copy Mode:</strong> See the word and practice typing it
              </p>
            </div>
            <div>
              <p className="text-gray-700 mb-2">
                <strong>Fill Blanks:</strong> Complete words with missing letters
              </p>
              <p className="text-gray-700">
                <strong>Test Mode:</strong> Spell words from pictures alone
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-gray-600">
              <strong>Keyboard shortcuts:</strong> 1-4 = Select mode, Ctrl+Shift+H = Home, Ctrl+L = Lock
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellingMenu;

