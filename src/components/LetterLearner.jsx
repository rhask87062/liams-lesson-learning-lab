import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Lock, LockOpen, X } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { motion, AnimatePresence } from 'framer-motion';
import { speakWord, speakLetter, speakSequence, stopSpeaking, getWordsForLetter } from '../lib/unifiedWordDatabase';
import dinoBackground from '../assets/dino-background.png';
import triceratopsIcon from '/src/assets/trike.png';
import stegoIcon from '/src/assets/stego.png';

const AlphabetGrid = ({ onLetterSelect, activeKey }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // Create array with empty slot at position 8 (top-right corner)
  const gridItems = [];
  let letterIndex = 0;
  
  for (let i = 0; i < 27; i++) { // 27 slots total (26 letters + 1 empty)
    if (i === 8) {
      // Empty slot for home button in top-right
      gridItems.push({ type: 'empty', key: 'empty-home' });
    } else {
      // Add letter
      gridItems.push({ 
        type: 'letter', 
        letter: alphabet[letterIndex], 
        key: alphabet[letterIndex] 
      });
      letterIndex++;
    }
  }
  
  return (
    <div className="h-full grid grid-cols-9 grid-rows-3 gap-1 p-1">
      {gridItems.map((item) => {
        if (item.type === 'empty') {
          return <div key={item.key} />; // Empty cell for home button
        }
        
        return (
          <Button
            key={item.key}
            onClick={() => onLetterSelect(item.letter)}
            className={`
              w-full h-full flex items-center justify-center text-4xl md:text-5xl font-bold rounded-2xl border-2 border-white bg-black/20 hover:bg-black/40
              text-white
              hover:scale-105 hover:shadow-lg hover:z-10
              active:scale-95 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:z-10
              ${activeKey === item.letter ? 'bg-yellow-500/50 scale-110 ring-4 ring-yellow-400' : ''}
            `}
            data-letter={item.letter}
          >
            {item.letter}
          </Button>
        );
      })}
    </div>
  );
};

const drawRock = (ctx) => {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(10, -5);
  ctx.lineTo(15, 5);
  ctx.lineTo(10, 15);
  ctx.lineTo(-5, 10);
  ctx.closePath();
  ctx.fill();
};

const EruptionPuff = () => (
  <motion.div
    initial={{ scale: 0, opacity: 1 }}
    animate={{ scale: 3, opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }}
    exit={{ opacity: 0 }}
    className="absolute top-[28%] right-[15%] w-16 h-16 bg-gray-500/50 rounded-full z-0"
  />
);

const WordPopup = ({ wordData }) => {
  if (!wordData) return null;

  // Check if it's a base64 image, a file path, or an emoji
  const isBase64Image = typeof wordData.image === 'string' && wordData.image.startsWith('data:image/');
  const isImagePath = typeof wordData.image === 'string' && (wordData.image.includes('/') || wordData.image.includes('.png') || wordData.image.includes('.jpg'));
  const isImage = isBase64Image || isImagePath;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.5 } }}
      className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none overflow-hidden"
    >
      <div
        className="flex flex-col items-center max-w-[90vw] max-h-[90vh]"
        style={{ filter: 'drop-shadow(3px 5px 4px rgba(0,0,0,0.7))' }}
      >
        <div className="text-9xl md:text-[12rem] flex items-center justify-center">
          {isImage ? (
            <img src={wordData.image} alt={wordData.word} className="h-64 w-auto object-contain max-w-full" />
          ) : (
            <span>{wordData.image}</span>
          )}
        </div>
        <h2
          className="text-6xl md:text-8xl font-bold mt-4 text-white text-center"
        >
          {wordData.word}
        </h2>
      </div>
    </motion.div>
  );
};

const Instructions = ({ onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30"
  >
    <div className="bg-black/60 text-white rounded-lg p-4 text-center shadow-lg relative max-w-md">
      <p className="font-bold text-lg mb-2">How to play: Touch a letter to hear words that start with it!</p>
      <div className="text-sm space-y-1">
        <p><strong>Keyboard shortcuts:</strong></p>
        <p>• Press any letter key (A-Z) to hear a word</p>
        <p>• Number keys: 1=A, 2=B, 3=C, etc.</p>
        <p>• Escape = Return to menu</p>
        <p>• Ctrl+L = Lock navigation</p>
      </div>
      <button onClick={onDismiss} className="absolute top-[-10px] right-[-10px] bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors">
        <X size={20} />
      </button>
    </div>
  </motion.div>
);

const LetterLearner = ({ onHome, onLock, isNavigationLocked, wordList }) => {
  const [wordsByLetter, setWordsByLetter] = useState({});
  const [popupWord, setPopupWord] = useState(null);
  const [showInstructions, setShowInstructions] = useState(!sessionStorage.getItem('instructionsDismissed'));
  const { width, height } = useWindowSize();
  const [erupt, setErupt] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    const groupedWords = wordList.reduce((acc, wordObj) => {
      const firstLetter = wordObj.word.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(wordObj);
      return acc;
    }, {});
    setWordsByLetter(groupedWords);
  }, [wordList]);

  const handleLetterSelect = useCallback((letter) => {
    if (isNavigationLocked || isAnimating) return;

    const words = wordsByLetter[letter];
    if (words && words.length > 0) {
      const wordToShow = words[Math.floor(Math.random() * words.length)];
      setPopupWord(wordToShow);
      setErupt(true);
      setIsAnimating(true);
      setActiveKey(letter); // Highlight the active letter
      speakSequence([letter, wordToShow.word], 800);

      setTimeout(() => {
        setPopupWord(null);
        setErupt(false);
        setIsAnimating(false);
        setActiveKey(null); // Remove highlight
      }, 4500);
    }
  }, [wordsByLetter, isNavigationLocked, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyPress(event) {
      console.log('Letter Learner - Key pressed:', event.key);
      
      // Skip if user is typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Handle global shortcuts
      if (event.ctrlKey && event.shiftKey && (event.key === 'h' || event.key === 'H')) {
        event.preventDefault();
        onHome();
        return;
      }
      if (event.ctrlKey && (event.key === 'l' || event.key === 'L')) {
        event.preventDefault();
        onLock();
        return;
      }
      
      // Skip other ctrl/meta combinations
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      
      const key = event.key.toUpperCase();
      console.log('Letter Learner - Checking letter:', key);
      
      // Handle letter keys
      if (/[A-Z]/.test(key) && key.length === 1) {
        console.log('Letter Learner - Triggering letter:', key);
        event.preventDefault();
        handleLetterSelect(key);
      } 
      // Handle number keys (1-9 map to A-I, 0 maps to J)
      else if (/[0-9]/.test(key)) {
        event.preventDefault();
        const letterIndex = key === '0' ? 9 : parseInt(key) - 1;
        const letter = String.fromCharCode(65 + letterIndex); // A=65 in ASCII
        if (letterIndex < 26) {
          console.log('Letter Learner - Number key', key, 'maps to letter:', letter);
          handleLetterSelect(letter);
        }
      }
      // Handle Escape to go home
      else if (event.key === 'Escape') {
        event.preventDefault();
        onHome();
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleLetterSelect, onHome, onLock]);

  const dismissInstructions = () => {
    setShowInstructions(false);
    sessionStorage.setItem('instructionsDismissed', 'true');
  };

  return (
          <div
        className="w-screen h-screen bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${dinoBackground})` }}
    >
      <AnimatePresence>
        {erupt && (
          <>
            <EruptionPuff />
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={100}
              gravity={0.4}
              initialVelocityY={10}
              drawShape={drawRock}
              colors={['#8B4513', '#A0522D', '#696969', '#808080']}
            />
          </>
        )}
      </AnimatePresence>
      
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
          className={`px-4 py-2 ${isNavigationLocked ? 'bg-orange-500/70 hover:bg-orange-600/70' : 'bg-gray-500/70 hover:bg-gray-600/70'} text-white border-0`}
          title={isNavigationLocked ? "Unlock Navigation (Ctrl+L)" : "Lock Navigation (Ctrl+L)"}
        >
          {isNavigationLocked ? <Lock size={20} /> : <LockOpen size={20} />}
        </Button>
      </div>

      <div className="w-full h-full">
        <AlphabetGrid onLetterSelect={handleLetterSelect} activeKey={activeKey} />
      </div>

      <AnimatePresence>
        {popupWord && <WordPopup wordData={popupWord} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {showInstructions && <Instructions onDismiss={dismissInstructions} />}
      </AnimatePresence>
    </div>
  );
};

export default LetterLearner;

