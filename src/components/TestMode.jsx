import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Volume2, Lock, LockOpen, Home, Check, X } from 'lucide-react';
import { speakWord } from '../lib/unifiedWordDatabase';
import WordImage from '@/components/ui/WordImage.jsx';

const TestMode = ({ currentWord, onNext, onBack, onHome, onLock, onCorrect, isNavigationLocked }) => {
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

  const checkSpelling = async () => {
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
    if (e.key === 'Enter') {
      e.preventDefault();
      checkSpelling();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onBack();
    }
    // Ctrl+S for speak
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      handleSpeak();
    }
    // Ctrl+Shift+H for Home
    if ((e.ctrlKey && e.shiftKey) && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      onHome();
    }
    // Ctrl+L for lock
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      onLock();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-red-400 via-pink-400 to-red-500 relative overflow-hidden">
      {/* Navigation Protection Notice */}
      {isNavigationLocked && (
        <div className="absolute top-4 left-4 bg-orange-100 border-2 border-orange-400 rounded-xl p-3 shadow-lg z-10">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">Navigation Protected</span>
          </div>
        </div>
      )}

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

      {/* Coral Reef themed background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-5xl animate-bounce">🐠</div>
        <div className="absolute top-20 right-20 text-4xl animate-pulse">🐙</div>
        <div className="absolute bottom-20 left-20 text-6xl animate-bounce delay-1000">🦀</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-pulse delay-500">🐚</div>
        <div className="absolute top-1/2 left-5 text-3xl animate-bounce delay-700">🌊</div>
        <div className="absolute top-1/3 right-5 text-4xl animate-pulse delay-300">⭐</div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl animate-bounce delay-200">🪸</div>
        <div className="absolute top-1/4 right-1/3 text-4xl animate-pulse delay-800">🐡</div>
      </div>

      {/* Challenge indicator */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-200 border-2 border-red-400 rounded-xl p-3 shadow-lg z-10">
        <span className="text-sm font-semibold text-red-800">🏆 Challenge Mode</span>
      </div>

      {/* Main content */}
      <div className="text-center space-y-6 md:space-y-8 max-w-4xl w-full relative z-10">
        {/* Word display */}
        <div className={`bg-white rounded-3xl p-8 md:p-12 shadow-lg ${showFeedback ? (isCorrect ? 'feedback-correct' : 'feedback-incorrect') : ''}`}>
          <WordImage image={currentWord.image} word={currentWord.word} />
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
            Spell this word from the picture:
          </h2>
          
          {/* Input field */}
          <Input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="text-3xl md:text-4xl font-bold text-center p-4 md:p-6 border-4 border-gray-300 rounded-xl w-full max-w-md mx-auto focus:border-red-500 focus:outline-none tablet-input keyboard-focus"
            placeholder="Type here..."
            autoFocus
            tabIndex={1}
          />
          
          {/* Feedback */}
          {showFeedback && (
            <div className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="flex items-center justify-center space-x-2">
                {isCorrect ? (
                  <>
                    <Check className="h-8 w-8 text-green-600" />
                    <span className="text-xl md:text-2xl font-bold text-green-600">Amazing! 🌟</span>
                  </>
                ) : (
                  <>
                    <X className="h-8 w-8 text-red-600" />
                    <span className="text-xl md:text-2xl font-bold text-red-600">Try again!</span>
                  </>
                )}
              </div>
              {!isCorrect && (
                <p className="text-lg md:text-xl text-gray-600 mt-2">
                  The correct spelling is: <strong>{currentWord.word.toUpperCase()}</strong>
                </p>
              )}
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
            onClick={checkSpelling}
            size="lg"
            className="text-xl md:text-2xl px-6 md:px-8 py-4 md:py-6 bg-red-500 hover:bg-red-600 tablet-button keyboard-focus"
            disabled={!userInput.trim()}
            tabIndex={3}
          >
            Check Spelling
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
            className="text-lg md:text-xl px-4 md:px-6 py-3 md:py-4 bg-red-500 hover:bg-red-600 tablet-button keyboard-focus"
            tabIndex={7}
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

export default TestMode; 