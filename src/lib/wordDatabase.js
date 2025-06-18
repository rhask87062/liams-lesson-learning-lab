// Word database for the spelling app
import * as TTS from '../utils/simpleTTS.js';

export const wordDatabase = [
  // Animals
  {
    id: 1,
    word: "cat",
    category: "animals",
    image: "🐱",
    pronunciation: "/kæt/"
  },
  {
    id: 2,
    word: "dog",
    category: "animals", 
    image: "🐶",
    pronunciation: "/dɔg/"
  },
  {
    id: 3,
    word: "bird",
    category: "animals",
    image: "🐦",
    pronunciation: "/bɜrd/"
  },
  {
    id: 4,
    word: "fish",
    category: "animals",
    image: "🐟",
    pronunciation: "/fɪʃ/"
  },
  
  // Family
  {
    id: 5,
    word: "mom",
    category: "family",
    image: "👩",
    pronunciation: "/mɑm/"
  },
  {
    id: 6,
    word: "dad",
    category: "family",
    image: "👨",
    pronunciation: "/dæd/"
  },
  {
    id: 7,
    word: "baby",
    category: "family",
    image: "👶",
    pronunciation: "/ˈbeɪbi/"
  },
  
  // Colors
  {
    id: 8,
    word: "red",
    category: "colors",
    image: "🔴",
    pronunciation: "/rɛd/"
  },
  {
    id: 9,
    word: "blue",
    category: "colors",
    image: "🔵",
    pronunciation: "/blu/"
  },
  {
    id: 10,
    word: "green",
    category: "colors",
    image: "🟢",
    pronunciation: "/grin/"
  },
  
  // Body parts
  {
    id: 11,
    word: "eye",
    category: "body",
    image: "👁️",
    pronunciation: "/aɪ/"
  },
  {
    id: 12,
    word: "hand",
    category: "body",
    image: "✋",
    pronunciation: "/hænd/"
  },
  {
    id: 13,
    word: "foot",
    category: "body",
    image: "🦶",
    pronunciation: "/fʊt/"
  },
  
  // Food
  {
    id: 14,
    word: "apple",
    category: "food",
    image: "🍎",
    pronunciation: "/ˈæpəl/"
  },
  {
    id: 15,
    word: "milk",
    category: "food",
    image: "🥛",
    pronunciation: "/mɪlk/"
  },
  {
    id: 16,
    word: "bread",
    category: "food",
    image: "🍞",
    pronunciation: "/brɛd/"
  },
  
  // Objects
  {
    id: 17,
    word: "ball",
    category: "objects",
    image: "⚽",
    pronunciation: "/bɔl/"
  },
  {
    id: 18,
    word: "book",
    category: "objects",
    image: "📚",
    pronunciation: "/bʊk/"
  },
  {
    id: 19,
    word: "car",
    category: "objects",
    image: "🚗",
    pronunciation: "/kɑr/"
  },
  {
    id: 20,
    word: "house",
    category: "objects",
    image: "🏠",
    pronunciation: "/haʊs/"
  }
];

// Get words by category
export const getWordsByCategory = (category) => {
  return wordDatabase.filter(word => word.category === category);
};

// Get all categories
export const getCategories = () => {
  return [...new Set(wordDatabase.map(word => word.category))];
};

// Get random word
export const getRandomWord = () => {
  return wordDatabase[Math.floor(Math.random() * wordDatabase.length)];
};

// Enhanced speech functions using the new simple TTS
export const speakWord = (word) => {
  TTS.speak(word);
};

export const speakLetter = (letter) => {
  TTS.speak(letter, { rate: 0.7, pitch: 1.2 });
};

export const speakSequence = (items) => {
  TTS.cancel(); // Stop any previous speech

  const speakItem = (index) => {
    if (index >= items.length) return;

    const currentItem = items[index];
    const parameters = {
      onend: () => speakItem(index + 1)
    };
    
    TTS.speak(currentItem, parameters);
  };

  speakItem(0);
};

export const stopSpeaking = () => {
  TTS.cancel();
};

// Test TTS system
export const testTTS = () => {
  TTS.speak("Hello, this is a test.", { lang: 'en-US' });
};