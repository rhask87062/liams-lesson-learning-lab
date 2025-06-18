import { useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Volume2, Lock, LockOpen, Home } from 'lucide-react';
import { speakWord } from '../lib/wordDatabase';
import WordImage from '@/components/ui/WordImage.jsx';

const LearnMode = ({ currentWord, onNext, onBack, onLock, onHome, isNavigationLocked }) => {
  if (!currentWord) return null;

  const handleSpeak = async () => {
    await speakWord(currentWord.word);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onNext();
    }
    if (e.key === 'Escape') {
      onBack();
    }
    if (e.key === 's' || e.key === 'S') {
      handleSpeak();
    }
    // Ctrl+H or Alt+H for Home to avoid interference with spelling
    if ((e.ctrlKey && e.shiftKey) && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      onHome();
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-500 via-green-400 via-teal-500 to-blue-600 relative overflow-hidden"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Ocean Adventure themed background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-5xl animate-bounce">🐋</div>
        <div className="absolute top-20 right-20 text-4xl animate-pulse">🐬</div>
        <div className="absolute bottom-20 left-20 text-6xl animate-bounce delay-1000">🏝️</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-pulse delay-500">⛵</div>
        <div className="absolute top-1/2 left-5 text-3xl animate-bounce delay-700">🌊</div>
        <div className="absolute top-1/3 right-5 text-4xl animate-pulse delay-300">🐠</div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl animate-bounce delay-200">🦑</div>
        <div className="absolute top-1/4 right-1/3 text-4xl animate-pulse delay-800">🏖️</div>
      </div>
      {/* Header with home and lock buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          onClick={onLock}
          className={`px-4 py-2 ${isNavigationLocked ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-lg`}
        >
          {isNavigationLocked ? <Lock size={20} /> : <LockOpen size={20} />}
        </Button>
        <Button
          onClick={onHome}
          className="bg-green-500/70 hover:bg-green-600/70 text-white px-4 py-2 border-0"
          title="Home (Ctrl+Shift+H)"
        >
          <Home size={20} />
        </Button>
      </div>

      {/* Navigation lock indicator */}
      {isNavigationLocked && (
        <div className="absolute top-4 left-4 bg-orange-100 border-2 border-orange-400 rounded-xl p-3 shadow-lg z-10">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">Navigation Protected</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="text-center space-y-6 md:space-y-8 max-w-4xl w-full relative z-10">
        {/* Word display */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <WordImage image={currentWord.image} word={currentWord.word} />
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            {currentWord.word.toUpperCase()}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">{currentWord.pronunciation}</p>
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          <Button
            onClick={handleSpeak}
            size="lg"
            className="text-xl md:text-2xl px-6 md:px-8 py-4 md:py-6 bg-green-500 hover:bg-green-600 tablet-button keyboard-focus"
            tabIndex={1}
          >
            <Volume2 className="h-6 w-6 md:h-8 md:w-8 mr-3" />
            Hear Word
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between w-full max-w-md mx-auto">
          <Button
            onClick={onBack}
            size="lg"
            variant="outline"
            className="text-lg md:text-xl px-4 md:px-6 py-3 md:py-4 tablet-button keyboard-focus"
            tabIndex={2}
          >
            ← Back
          </Button>
          <Button
            onClick={onNext}
            size="lg"
            className="text-lg md:text-xl px-4 md:px-6 py-3 md:py-4 bg-blue-500 hover:bg-blue-600 tablet-button keyboard-focus"
            tabIndex={3}
          >
            Next →
          </Button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-sm md:text-base text-gray-600 bg-white/50 rounded-xl p-3 md:p-4">
          <p><strong>Keyboard shortcuts:</strong> Space/Enter = Next, S = Speak, Ctrl+Shift+H = Home, Escape = Back</p>
        </div>
      </div>
    </div>
  );
};

export default LearnMode;

