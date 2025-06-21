import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import HomeButton from '@/components/HomeButton.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAllWords } from '@/lib/unifiedWordDatabase';
import WordImage from './ui/WordImage';
import SparkleBackground from './ui/SparkleBackground';

// Fisher-Yates (aka Knuth) Shuffle Algorithm
const shuffle = (array) => {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};

const MatchingGame = ({ onHome, optionsCount = 3 }) => {
    const [optionCards, setOptionCards] = useState([]);
    const [targetCard, setTargetCard] = useState(null);
    const [selectionStatus, setSelectionStatus] = useState(null); // 'correct', 'incorrect', or null
    const [selectedCardId, setSelectedCardId] = useState(null);

    const setupNewRound = () => {
        setSelectionStatus(null);
        setSelectedCardId(null);

        const allItems = getAllWords();
        const shuffledItems = shuffle([...allItems]);
        
        const correctItem = shuffledItems[0];
        const incorrectItems = shuffledItems.slice(1, optionsCount);
        
        const currentOptions = shuffle([correctItem, ...incorrectItems]);

        setTargetCard(correctItem);
        setOptionCards(currentOptions);
    };

    useEffect(() => {
        setupNewRound();
    }, []);

    const handleCardSelect = (selectedItem) => {
        if (selectionStatus) return; // Don't allow changes after selection

        setSelectedCardId(selectedItem.id);

        if (selectedItem.id === targetCard.id) {
            setSelectionStatus('correct');
        } else {
            setSelectionStatus('incorrect');
        }

        setTimeout(() => {
            setupNewRound();
        }, 1500); // Wait 1.5 seconds before starting the next round
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8 overflow-hidden">
            <SparkleBackground />
            <h1 className="text-5xl font-bold text-white mb-12 z-10">Matching Game</h1>
            
            {/* Option Cards */}
            <div className="grid grid-cols-3 gap-8 mb-16 z-10">
                {optionCards.map((item) => (
                    <Card
                        key={item.id}
                        onClick={() => handleCardSelect(item)}
                        className={cn(
                            "w-48 h-64 flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl bg-white/70 backdrop-blur-sm border-2",
                            selectionStatus && selectedCardId === item.id && selectionStatus === 'correct' && 'bg-green-300/80 border-green-600 ring-4 ring-green-500',
                            selectionStatus && selectedCardId === item.id && selectionStatus === 'incorrect' && 'bg-red-300/80 border-red-600 ring-4 ring-red-500',
                            selectionStatus && item.id === targetCard.id && 'bg-green-300/80 border-green-600', // Always highlight the correct one after selection
                            !selectionStatus ? 'border-white/50' : ''
                        )}
                    >
                        <CardContent className="p-0 flex items-center justify-center">
                           <WordImage image={item.image} word={item.word} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Target Card */}
            <div className="flex flex-col items-center z-10">
                <p className="text-2xl font-semibold text-gray-300 mb-4">Match This</p>
                <Card className="w-48 h-64 flex items-center justify-center bg-white/10 backdrop-blur-md ring-4 ring-purple-500 shadow-xl border-2 border-purple-300">
                    <CardContent className="p-0 flex items-center justify-center">
                        {targetCard && <WordImage image={targetCard.image} word={targetCard.word} />}
                    </CardContent>
                </Card>
            </div>

            {/* Feedback and Controls */}
            <div className="absolute bottom-8 right-8 flex items-center space-x-4 z-10">
                 {selectionStatus === 'correct' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
                 {selectionStatus === 'incorrect' && <XCircle className="h-16 w-16 text-red-500" />}
                <HomeButton onClick={onHome} />
            </div>
        </div>
    );
};

export default MatchingGame; 