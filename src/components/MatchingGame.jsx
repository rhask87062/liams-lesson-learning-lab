import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Home, Lock, LockOpen } from 'lucide-react';
import { unifiedWords } from '../lib/unifiedWordLibrary.js';
import { speakWord } from '../lib/wordDatabase.js';

const MatchingGame = ({ onHome, onLock, isNavigationLocked }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted) {
      initializeGame();
    }
  }, [gameStarted]);

  const initializeGame = () => {
    const allWords = Object.values(unifiedWords).flat();
    // Select a subset of words for the game, e.g., 6 unique words
    const selectedWords = [];
    const uniqueIndices = new Set();
    while (selectedWords.length < 6 && uniqueIndices.size < allWords.length) {
      const randomIndex = Math.floor(Math.random() * allWords.length);
      if (!uniqueIndices.has(randomIndex)) {
        uniqueIndices.add(randomIndex);
        selectedWords.push(allWords[randomIndex]);
      }
    }

    const gamePairs = selectedWords.flatMap(wordData => [
      { id: `${wordData.word}-text`, content: wordData.word, type: 'text', matched: false, wordId: wordData.word },
      { id: `${wordData.word}-image`, content: wordData.image, type: 'image', matched: false, wordId: wordData.word }
    ]);

    // Shuffle cards
    const shuffledCards = gamePairs.sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCards([]);
  };

  const handleCardClick = (clickedCard) => {
    if (flippedCards.length === 2 || clickedCard.matched || flippedCards.includes(clickedCard)) {
      return;
    }

    const newFlippedCards = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [card1, card2] = newFlippedCards;
      if (card1.wordId === card2.wordId) {
        // Match found
        setMatchedCards(prev => [...prev, card1.wordId]);
        setCards(prevCards =>
          prevCards.map(card =>
            card.wordId === card1.wordId ? { ...card, matched: true } : card
          )
        );
        speakWord(card1.wordId); // Speak the word when matched
        setTimeout(() => setFlippedCards([]), 1000); // Clear flipped cards after a delay
      } else {
        // No match
        setTimeout(() => setFlippedCards([]), 1000); // Flip back after a delay
      }
    }
  };

  const isCardFlipped = (card) => flippedCards.includes(card) || matchedCards.includes(card.wordId);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
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
      
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Matching Game (Coming Soon!)</h1>
      </div>

      {!gameStarted ? (
        <div className="flex-grow flex items-center justify-center">
          <Button
            onClick={() => setGameStarted(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white text-3xl px-8 py-4 rounded-lg shadow-lg"
          >
            Start Game
          </Button>
        </div>
      ) : (
        <div className="flex-grow grid grid-cols-4 gap-4 p-4">
          {cards.map(card => (
            <div
              key={card.id}
              className={`
                relative flex items-center justify-center rounded-lg shadow-md cursor-pointer
                ${isCardFlipped(card) ? 'bg-white/80' : 'bg-blue-700/60 hover:bg-blue-800/70'}
                ${card.matched ? 'opacity-50 pointer-events-none' : ''}
              `}
              onClick={() => handleCardClick(card)}
            >
              {isCardFlipped(card) && (
                <div className="text-5xl md:text-6xl font-bold text-gray-800 flex items-center justify-center w-full h-full p-2">
                  {card.type === 'image' ? (
                    typeof card.content === 'string' && card.content.includes('/') ? (
                      <img src={card.content} alt={card.wordId} className="h-full w-auto object-contain" />
                    ) : (
                      <span>{card.content}</span>
                    )
                  ) : (
                    <span>{card.content}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {matchedCards.length === cards.length / 2 && gameStarted && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center shadow-lg">
            <h2 className="text-4xl font-bold text-green-600 mb-4">🎉 You Won! 🎉</h2>
            <Button
              onClick={initializeGame}
              className="bg-purple-500 hover:bg-purple-600 text-white text-2xl px-6 py-3 rounded-lg"
            >
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingGame; 