import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Home, Lock, LockOpen, X } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { motion, AnimatePresence } from 'framer-motion';
import { speakWord, speakLetter, speakSequence, stopSpeaking } from '../lib/wordDatabase.js';
import dinoBackground from '../assets/dino-background.png';
import triceratopsIcon from '/src/assets/trike.png';
import stegoIcon from '/src/assets/stego.png';

const AlphabetGrid = ({ onLetterSelect }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return (
    <div className="h-full grid grid-cols-9 grid-rows-3 gap-1 p-1">
      {alphabet.map((letter) => (
        <Button
          key={letter}
          onClick={() => onLetterSelect(letter)}
          className={`
            w-full h-full flex items-center justify-center text-4xl md:text-5xl font-bold rounded-2xl border-2 border-white bg-black/20 hover:bg-black/40
            text-white
            hover:scale-105 hover:shadow-lg hover:z-10
            active:scale-95 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:z-10
          `}
        >
          {letter}
        </Button>
      ))}
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
      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
    >
      <div
        className="flex flex-col items-center"
        style={{ filter: 'drop-shadow(3px 5px 4px rgba(0,0,0,0.7))' }}
      >
        <div className="text-9xl md:text-[12rem]">
          {isImage ? (
            <img src={wordData.image} alt={wordData.word} className="h-64 w-auto object-contain" />
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
      <p className="font-bold">How to play: Touch a letter to hear words that start with it!</p>
      <p className="text-sm">Keyboard shortcuts: Press any letter/number key</p>
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

  // Keyboard navigation
  useEffect(() => {
    function handleKeyPress(event) {
      if (event.ctrlKey || event.metaKey) return;
      
      const key = event.key.toUpperCase();
      if (/[A-Z]/.test(key) && key.length === 1) {
        handleLetterSelect(key);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const handleLetterSelect = useCallback((letter) => {
    if (isNavigationLocked || isAnimating) return;

    const words = wordsByLetter[letter];
    if (words && words.length > 0) {
      const wordToShow = words[Math.floor(Math.random() * words.length)];
      setPopupWord(wordToShow);
      setErupt(true);
      setIsAnimating(true);
      speakSequence([letter, wordToShow.word], 800);

      setTimeout(() => {
        setPopupWord(null);
        setErupt(false);
        setIsAnimating(false);
      }, 4500);
    }
  }, [wordsByLetter, isNavigationLocked, isAnimating]);

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
      
      <div className="absolute bottom-4 right-4 z-30 flex gap-2">
        <Button
          onClick={onLock}
          className={`px-4 py-2 ${isNavigationLocked ? 'bg-orange-500/70 hover:bg-orange-600/70' : 'bg-gray-500/70 hover:bg-gray-600/70'} text-white border-0`}
          title={isNavigationLocked ? "Unlock Navigation (Ctrl+L)" : "Lock Navigation (Ctrl+L)"}
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

      <div className="w-full h-full">
        <AlphabetGrid onLetterSelect={handleLetterSelect} />
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

