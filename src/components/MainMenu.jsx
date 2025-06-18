import { Button } from '@/components/ui/button.jsx';
import { BookOpen, Edit3, Target, Trophy } from 'lucide-react';

const MainMenu = ({ onSelectMode }) => {
  const handleKeyPress = (e) => {
    if (e.key === '1') {
      onSelectMode('learn');
    } else if (e.key === '2') {
      onSelectMode('copy');
    } else if (e.key === '3') {
      onSelectMode('fillblank');
    } else if (e.key === '4') {
      onSelectMode('test');
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-b from-blue-50 to-green-50"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="text-6xl md:text-8xl mb-4">📚</div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Kids Spelling App
        </h1>
        <p className="text-lg md:text-xl text-gray-600">
          Learn and practice spelling with fun!
        </p>
      </div>

      {/* Mode selection grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl">
        {/* Learn Mode */}
        <Button
          onClick={() => onSelectMode('learn')}
          className="h-32 md:h-40 text-xl md:text-2xl font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-200 tablet-button keyboard-focus"
          tabIndex={1}
        >
          <div className="flex flex-col items-center space-y-3">
            <BookOpen className="h-12 w-12 md:h-16 md:w-16" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">Learn Mode</div>
              <div className="text-sm md:text-base opacity-90">See and hear words</div>
            </div>
          </div>
        </Button>

        {/* Copy Mode */}
        <Button
          onClick={() => onSelectMode('copy')}
          className="h-32 md:h-40 text-xl md:text-2xl font-semibold bg-purple-500 hover:bg-purple-600 text-white rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-200 tablet-button keyboard-focus"
          tabIndex={2}
        >
          <div className="flex flex-col items-center space-y-3">
            <Edit3 className="h-12 w-12 md:h-16 md:w-16" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">Copy Mode</div>
              <div className="text-sm md:text-base opacity-90">Practice typing words</div>
            </div>
          </div>
        </Button>

        {/* Fill Blank Mode */}
        <Button
          onClick={() => onSelectMode('fillblank')}
          className="h-32 md:h-40 text-xl md:text-2xl font-semibold bg-yellow-500 hover:bg-yellow-600 text-white rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-200 tablet-button keyboard-focus"
          tabIndex={3}
        >
          <div className="flex flex-col items-center space-y-3">
            <Target className="h-12 w-12 md:h-16 md:w-16" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">Fill Blanks</div>
              <div className="text-sm md:text-base opacity-90">Complete missing letters</div>
            </div>
          </div>
        </Button>

        {/* Test Mode */}
        <Button
          onClick={() => onSelectMode('test')}
          className="h-32 md:h-40 text-xl md:text-2xl font-semibold bg-red-500 hover:bg-red-600 text-white rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-200 tablet-button keyboard-focus"
          tabIndex={4}
        >
          <div className="flex flex-col items-center space-y-3">
            <Trophy className="h-12 w-12 md:h-16 md:w-16" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">Test Mode</div>
              <div className="text-sm md:text-base opacity-90">Spell from picture only</div>
            </div>
          </div>
        </Button>

        {/* Matching Game Mode */}
        <Button
          onClick={() => onSelectMode('matchingGame')}
          className="h-32 md:h-40 text-xl md:text-2xl font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-200 tablet-button keyboard-focus"
          tabIndex={5}
        >
          <div className="flex flex-col items-center space-y-3">
            <img src="/public/images/words/dino-egg.png" alt="Dino Egg" className="h-12 w-12 md:h-16 md:w-16" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">Matching Game</div>
              <div className="text-sm md:text-base opacity-90">Match words and pictures</div>
            </div>
          </div>
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-8 md:mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-lg max-w-3xl w-full">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center">
          How to Play:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base text-gray-600">
          <div>
            <strong className="text-blue-600">Learn Mode:</strong> See words with pictures and hear how they sound
          </div>
          <div>
            <strong className="text-purple-600">Copy Mode:</strong> See the word and practice typing it
          </div>
          <div>
            <strong className="text-yellow-600">Fill Blanks:</strong> Complete words with missing letters
          </div>
          <div>
            <strong className="text-red-600">Test Mode:</strong> Spell words from pictures alone
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm md:text-base text-gray-600">
            <strong>Tip:</strong> Use the keyboard or touch the screen to interact
          </p>
          <p className="text-sm md:text-base text-gray-600">
            <strong>Lock:</strong> Press the lock button to prevent accidental exits
          </p>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-6 text-sm md:text-base text-gray-600 bg-white/50 rounded-xl p-3 md:p-4">
        <p><strong>Keyboard shortcuts:</strong> 1 = Learn, 2 = Copy, 3 = Fill Blanks, 4 = Test</p>
      </div>
    </div>
  );
};

export default MainMenu;

