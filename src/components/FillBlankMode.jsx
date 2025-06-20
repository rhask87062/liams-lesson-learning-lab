import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Volume2, Lock, LockOpen, Home } from 'lucide-react';
import { speakWord } from '../lib/unifiedWordDatabase';
import WordImage from '@/components/ui/WordImage.jsx';

const FillBlankMode = ({ currentWord, onNext, onBack, onHome, onLock, onCorrect, isNavigationLocked, difficulty = 1 }) => {
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [blankedWord, setBlankedWord] = useState('');
  const [missingLetters, setMissingLetters] = useState([]);

  useEffect(() => {
    if (currentWord) {
      generateBlankedWord();
    }
    setUserInput('');
    setIsCorrect(null);
    setShowFeedback(false);
  }, [currentWord, difficulty]);

  const generateBlankedWord = () => {
    if (!currentWord) return;
    
    const word = currentWord.word.toLowerCase();
    const wordLength = word.length;
    
    // For fill-in-the-blank mode, we only blank out 1 letter at a time
    // This makes it appropriate for young children learning letters
    const numBlanks = 1;
    
    // Select random position to blank out
    const blankPosition = Math.floor(Math.random() * wordLength);
    
    // Create blanked word and track missing letter
    let blanked = '';
    const missing = [];
    
    for (let i = 0; i < wordLength; i++) {
      if (i === blankPosition) {
        blanked += '_';
        missing.push({ position: i, letter: word[i] });
      } else {
        blanked += word[i];
      }
    }
    
    setBlankedWord(blanked);
    setMissingLetters(missing);
  };

  if (!currentWord) return null;

  const handleSpeak = async () => {
    await speakWord(currentWord.word);
  };

  const checkAnswer = () => {
    // For single letter input, check if the user typed the correct missing letter
    const expectedLetter = missingLetters[0]?.letter.toLowerCase();
    const userLetter = userInput.toLowerCase().trim();
    
    const correct = userLetter === expectedLetter;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct && onCorrect) {
      onCorrect();
    }

    // Auto-advance after correct answer
    if (correct) {
      setTimeout(() => {
        onNext();
      }, 2000);
    }
  };

  const handleInputChange = (e) => {
    // Only allow single letter input
    const value = e.target.value;
    if (value.length <= 1 && /^[a-zA-Z]*$/.test(value)) {
      setUserInput(value);
      setShowFeedback(false);
      setIsCorrect(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
    if (e.key === 'Escape') {
      onBack();
    }
    // Ctrl+H or Alt+H for Home to avoid interference with spelling
    if ((e.ctrlKey && e.shiftKey) && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      onHome();
    }
  };

  const getDifficultyText = () => {
    switch(difficulty) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      default: return 'Easy';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-yellow-400 via-lime-400 via-orange-400 to-yellow-500 relative overflow-hidden">
      {/* Tropical Fruit themed background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-5xl animate-bounce">🍍</div>
        <div className="absolute top-20 right-20 text-4xl animate-pulse">🥭</div>
        <div className="absolute bottom-20 left-20 text-6xl animate-bounce delay-1000">🌴</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-pulse delay-500">🥥</div>
        <div className="absolute top-1/2 left-5 text-3xl animate-bounce delay-700">🍌</div>
        <div className="absolute top-1/3 right-5 text-4xl animate-pulse delay-300">🦜</div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl animate-bounce delay-200">🌺</div>
        <div className="absolute top-1/4 right-1/3 text-4xl animate-pulse delay-800">🏖️</div>
      </div>
      {/* Header with home and lock buttons */}
      <div className="absolute bottom-4 right-4 flex space-x-3 z-10">
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

      {/* Difficulty indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-200 border-2 border-yellow-400 rounded-xl p-3 shadow-lg z-10">
        <span className="text-sm font-semibold text-yellow-800">Difficulty: {getDifficultyText()}</span>
      </div>

      {/* Main content */}
      <div className="text-center space-y-6 md:space-y-8 max-w-4xl w-full relative z-10">
        {/* Word display */}
        <div className={`bg-white rounded-3xl p-8 md:p-12 shadow-lg ${showFeedback ? (isCorrect ? 'feedback-correct' : 'feedback-incorrect') : ''}`}>
          <WordImage image={currentWord.image} word={currentWord.word} />
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
            Fill in the missing letter:
          </h2>
          
          {/* Blanked word display */}
          <div className="text-4xl md:text-6xl font-bold text-yellow-600 mb-6 tracking-wider">
            {blankedWord.split('').map((char, index) => (
              <span key={index} className={char === '_' ? 'text-red-500' : ''}>
                {char === '_' ? '_' : char.toUpperCase()}
              </span>
            ))}
          </div>
          
          {/* Input field - smaller for single letter */}
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="text-4xl md:text-6xl font-bold text-center p-4 md:p-6 border-4 border-gray-300 rounded-xl w-20 md:w-24 mx-auto focus:border-yellow-500 focus:outline-none tablet-input keyboard-focus"
            placeholder="?"
            maxLength="1"
            autoFocus
            tabIndex={1}
          />
          
          {/* Feedback */}
          {showFeedback && (
            <div className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="flex items-center justify-center space-x-2">
                <span className={`text-xl md:text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? 'Excellent!' : 'Try again!'}
                </span>
              </div>
              {!isCorrect && (
                <p className="text-lg md:text-xl text-gray-600 mt-2">
                  The missing letter is: <strong>{missingLetters[0]?.letter.toUpperCase()}</strong>
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
            onClick={checkAnswer}
            size="lg"
            className="text-xl md:text-2xl px-6 md:px-8 py-4 md:py-6 bg-yellow-500 hover:bg-yellow-600 tablet-button keyboard-focus"
            disabled={!userInput.trim()}
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
            className="text-lg md:text-xl px-4 md:px-6 py-3 md:py-4 bg-yellow-500 hover:bg-yellow-600 tablet-button keyboard-focus"
            tabIndex={7}
          >
            Next →
          </Button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-sm md:text-base text-gray-600 bg-white/50 rounded-xl p-3 md:p-4">
          <p><strong>Keyboard shortcuts:</strong> Enter = Check, Ctrl+Shift+H = Home, Escape = Back</p>
        </div>
      </div>
    </div>
  );
};

export default FillBlankMode;

