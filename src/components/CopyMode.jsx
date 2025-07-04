import { useState, useEffect } from 'react';
import { Volume2, Lock, LockOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { speakWord } from '../lib/unifiedWordDatabase';
import WordImage from '@/components/ui/WordImage.jsx';

const CopyMode = ({ currentWord, onNext, onBack, onHome, onLock, onCorrect, isNavigationLocked }) => {
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setUserInput('');
    setIsCorrect(null);
    setShowFeedback(false);
  }, [currentWord]);

  if (!currentWord) return null;

  const handleSpeak = async () => {
    await speakWord(currentWord);
  };

  const checkAnswer = async () => {
    const correct = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Always play the word audio to reinforce learning
    await handleSpeak();
    
    if (correct && onCorrect) {
      onCorrect();
    }

    // Auto-advance after correct answer
    if (correct) {
      setTimeout(() => {
        onNext();
      }, 2500); // Slightly longer delay to allow audio to finish
    }
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    setShowFeedback(false);
    setIsCorrect(null);
  };

  const handleKeyPress = (e) => {
    // Global hotkeys with modifiers
    if (e.ctrlKey && e.shiftKey && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      onHome();
      return;
    }
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      handleSpeak();
      return;
    }
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      onLock();
      return;
    }
    
    // Mode-specific hotkeys
    if (e.key === 'Enter') {
      checkAnswer();
    }
    if (e.key === 'Escape') {
      onBack();
    }
  };

  return (
          <div
        className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-purple-500 via-orange-400 via-red-500 to-purple-600 relative overflow-hidden"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Sunset Paradise themed background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-5xl animate-bounce">🌅</div>
        <div className="absolute top-20 right-20 text-4xl animate-pulse">🦋</div>
        <div className="absolute bottom-20 left-20 text-6xl animate-bounce delay-1000">🌺</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-pulse delay-500">🌴</div>
        <div className="absolute top-1/2 left-5 text-3xl animate-bounce delay-700">☀️</div>
        <div className="absolute top-1/3 right-5 text-4xl animate-pulse delay-300">🌸</div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl animate-bounce delay-200">🦜</div>
        <div className="absolute top-1/4 right-1/3 text-4xl animate-pulse delay-800">🌊</div>
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

      {/* Lock button - bottom right */}
      <div className="absolute bottom-4 right-4 z-30">
        <Button
          onClick={onLock}
          variant={isNavigationLocked ? "default" : "outline"}
          size="lg"
          className={`p-3 tablet-button keyboard-focus ${
            isNavigationLocked 
              ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
              : ''
          }`}
          tabIndex={5}
        >
          {isNavigationLocked ? (
            <Lock className="h-6 w-6" />
          ) : (
            <LockOpen className="h-6 w-6" />
          )}
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
          <div className="text-6xl md:text-8xl mb-6 tablet-emoji">
            <WordImage image={currentWord.image} word={currentWord.word} />
          </div>
          <h2 className="text-6xl md:text-8xl font-bold text-purple-600 mb-6">
            {currentWord.word.toUpperCase()}
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-6">
            Copy this word by typing it below
          </p>
          
          {/* Input field */}
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className={`text-3xl md:text-4xl font-bold text-center p-4 md:p-6 border-4 rounded-xl w-full max-w-md mx-auto focus:outline-none tablet-input keyboard-focus ${
              showFeedback
                ? isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-300 focus:border-purple-500'
            }`}
            placeholder="Type here..."
            tabIndex={1}
          />
          
          {/* Feedback */}
          {showFeedback && (
            <div className={`mt-4 text-xl md:text-2xl font-semibold ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCorrect ? '✅ Correct! Great job!' : '❌ Try again!'}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
          <Button
            onClick={handleSpeak}
            size="lg"
            className="text-xl md:text-2xl px-6 md:px-8 py-4 md:py-6 bg-green-500 hover:bg-green-600 tablet-button keyboard-focus"
            tabIndex={2}
          >
            <Volume2 className="h-6 w-6 md:h-8 md:w-8 mr-3" />
            Hear Word
          </Button>
          
          <Button
            onClick={checkAnswer}
            size="lg"
            className="text-xl md:text-2xl px-6 md:px-8 py-4 md:py-6 bg-purple-500 hover:bg-purple-600 tablet-button keyboard-focus"
            tabIndex={3}
          >
            Check Answer
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between w-full max-w-md mx-auto">
          <Button
            onClick={onBack}
            size="lg"
            variant="outline"
            className="text-lg md:text-xl px-4 md:px-6 py-3 md:py-4 tablet-button keyboard-focus"
            tabIndex={4}
          >
            ← Back
          </Button>
          <Button
            onClick={onNext}
            size="lg"
            className="text-lg md:text-xl px-4 md:px-6 py-3 md:py-4 bg-purple-500 hover:bg-purple-600 tablet-button keyboard-focus"
            tabIndex={5}
          >
            Next →
          </Button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-sm md:text-base text-gray-600 bg-white/50 rounded-xl p-3 md:p-4">
          <p><strong>Keyboard shortcuts:</strong> Enter = Check, Ctrl+S = Speak, Ctrl+Shift+H = Home, Ctrl+L = Lock, Escape = Back</p>
        </div>
      </div>
    </div>
  );
};

export default CopyMode;

