// Enhanced word database with real photos for consistent curriculum
import * as TTS from '../utils/simpleTTS.js';

// Unified word database for all learning modes
export const unifiedWordDatabase = {
  // Core vocabulary organized by starting letter
  A: [
    { word: 'apple', image: '/images/words/apple.jpg', category: 'food', audioPath: '/audio/apple.wav' },
    { word: 'ant', image: '🐜', category: 'animals' }
  ],
  B: [
    { word: 'ball', image: '/images/words/ball.jpg', category: 'toys' },
    { word: 'banana', image: '🍌', category: 'food' }
  ],
  C: [
    { word: 'cat', image: '/images/words/cat.jpg', category: 'animals' },
    { word: 'car', image: '/images/words/car.jpg', category: 'toys' }
  ],
  D: [
    { word: 'dog', image: '/images/words/dog.jpg', category: 'animals' },
    { word: 'duck', image: '🦆', category: 'animals' }
  ],
  E: [
    { word: 'elephant', image: '🐘', category: 'animals' },
    { word: 'egg', image: '🥚', category: 'food' },
    { word: 'eleven', image: '1️⃣1️⃣', category: 'numbers' },
    { word: 'eighteen', image: '1️⃣8️⃣', category: 'numbers' }
  ],
  F: [
    { word: 'fish', image: '🐟', category: 'animals' },
    { word: 'frog', image: '🐸', category: 'animals' },
    { word: 'fourteen', image: '1️⃣4️⃣', category: 'numbers' },
    { word: 'fifteen', image: '1️⃣5️⃣', category: 'numbers' }
  ],
  G: [
    { word: 'giraffe', image: '🦒', category: 'animals' },
    { word: 'goat', image: '🐐', category: 'animals' }
  ],
  H: [
    { word: 'horse', image: '🐴', category: 'animals' },
    { word: 'hat', image: '👒', category: 'clothes' }
  ],
  I: [
    { word: 'ice cream', image: '🍦', category: 'food' },
    { word: 'igloo', image: '🏔️', category: 'places' }
  ],
  J: [
    { word: 'jellyfish', image: '🪼', category: 'animals' },
    { word: 'juice', image: '🧃', category: 'food' }
  ],
  K: [
    { word: 'kite', image: '🪁', category: 'toys' },
    { word: 'kangaroo', image: '🦘', category: 'animals' }
  ],
  L: [
    { word: 'lion', image: '🦁', category: 'animals' },
    { word: 'lemon', image: '🍋', category: 'food' }
  ],
  M: [
    { word: 'monkey', image: '🐵', category: 'animals' },
    { word: 'moon', image: '🌙', category: 'nature' }
  ],
  N: [
    { word: 'nest', image: '🪺', category: 'nature' },
    { word: 'nose', image: '��', category: 'body' },
    { word: 'nineteen', image: '1️⃣9️⃣', category: 'numbers' }
  ],
  O: [
    { word: 'orange', image: '🍊', category: 'food' },
    { word: 'owl', image: '🦉', category: 'animals' }
  ],
  P: [
    { word: 'penguin', image: '🐧', category: 'animals' },
    { word: 'pizza', image: '🍕', category: 'food' }
  ],
  Q: [
    { word: 'queen', image: '👸', category: 'people' },
    { word: 'quilt', image: '🛏️', category: 'objects' }
  ],
  R: [
    { word: 'rabbit', image: '🐰', category: 'animals' },
    { word: 'rainbow', image: '🌈', category: 'nature' }
  ],
  S: [
    { word: 'sun', image: '☀️', category: 'nature' },
    { word: 'snake', image: '🐍', category: 'animals' },
    { word: 'sixteen', image: '1️⃣6️⃣', category: 'numbers' },
    { word: 'seventeen', image: '1️⃣7️⃣', category: 'numbers' }
  ],
  T: [
    { word: 'tree', image: '🌳', category: 'nature' },
    { word: 'tiger', image: '🐅', category: 'animals' },
    { word: 'twelve', image: '1️⃣2️⃣', category: 'numbers' },
    { word: 'thirteen', image: '1️⃣3️⃣', category: 'numbers' },
    { word: 'twenty', image: '2️⃣0️⃣', category: 'numbers' }
  ],
  U: [
    { word: 'umbrella', image: '☂️', category: 'objects' },
    { word: 'unicorn', image: '🦄', category: 'fantasy' }
  ],
  V: [
    { word: 'violin', image: '🎻', category: 'music' },
    { word: 'van', image: '🚐', category: 'vehicles' }
  ],
  W: [
    { word: 'whale', image: '🐋', category: 'animals' },
    { word: 'watermelon', image: '🍉', category: 'food' }
  ],
  X: [
    { word: 'xylophone', image: '🎵', category: 'music' },
    { word: 'x-ray', image: '🩻', category: 'medical' }
  ],
  Y: [
    { word: 'yak', image: '🐂', category: 'animals' },
    { word: 'yo-yo', image: '🪀', category: 'toys' }
  ],
  Z: [
    { word: 'zebra', image: '🦓', category: 'animals' },
    { word: 'zoo', image: '🦁', category: 'places' }
  ],
  // Numbers
  '0': [{ word: 'zero', image: '0️⃣', category: 'numbers' }],
  '1': [{ word: 'one', image: '1️⃣', category: 'numbers' }],
  '2': [{ word: 'two', image: '2️⃣', category: 'numbers' }],
  '3': [{ word: 'three', image: '3️⃣', category: 'numbers' }],
  '4': [{ word: 'four', image: '4️⃣', category: 'numbers' }],
  '5': [{ word: 'five', image: '5️⃣', category: 'numbers' }],
  '6': [{ word: 'six', image: '6️⃣', category: 'numbers' }],
  '7': [{ word: 'seven', image: '7️⃣', category: 'numbers' }],
  '8': [{ word: 'eight', image: '8️⃣', category: 'numbers' }],
  '9': [{ word: 'nine', image: '9️⃣', category: 'numbers' }],
  '10': [{ word: 'ten', image: '🔟', category: 'numbers' }],
  '11': [{ word: 'eleven', image: '1️⃣1️⃣', category: 'numbers' }],
  '12': [{ word: 'twelve', image: '1️⃣2️⃣', category: 'numbers' }],
  '13': [{ word: 'thirteen', image: '1️⃣3️⃣', category: 'numbers' }],
  '14': [{ word: 'fourteen', image: '1️⃣4️⃣', category: 'numbers' }],
  '15': [{ word: 'fifteen', image: '1️⃣5️⃣', category: 'numbers' }],
  '16': [{ word: 'sixteen', image: '1️⃣6️⃣', category: 'numbers' }],
  '17': [{ word: 'seventeen', image: '1️⃣7️⃣', category: 'numbers' }],
  '18': [{ word: 'eighteen', image: '1️⃣8️⃣', category: 'numbers' }],
  '19': [{ word: 'nineteen', image: '1️⃣9️⃣', category: 'numbers' }],
  '20': [{ word: 'twenty', image: '2️⃣0️⃣', category: 'numbers' }]
};

// Get words for a specific letter
export const getWordsForLetter = (letter) => {
  return unifiedWordDatabase[letter.toUpperCase()] || [];
};

// Get all words as flat array for spelling games
export const getAllWords = () => {
  const allWords = [];
  Object.values(unifiedWordDatabase).forEach(letterWords => {
    letterWords.forEach(wordObj => {
      allWords.push({
        id: allWords.length + 1,
        word: wordObj.word,
        category: wordObj.category,
        image: wordObj.image,
        pronunciation: wordObj.pronunciation || `/${wordObj.word}/`, // Use existing pronunciation or default
        audioPath: wordObj.audioPath || null // Include audioPath
      });
    });
  });
  return allWords;
};

// Enhanced speech functions using simple TTS
export const speakWord = async (wordObj) => {
  try {
    // If wordObj is a string, treat it as a simple word, otherwise assume it's a word object
    if (typeof wordObj === 'string') {
      await TTS.speak(wordObj);
    } else if (wordObj && wordObj.word) {
      await TTS.speak(wordObj.word, { audioPath: wordObj.audioPath });
    }
  } catch (error) {
    console.error('Error speaking word:', error);
  }
};

export const speakLetter = async (letter) => {
  try {
    // Check if it's a single letter and use the audio file if available
    if (letter.length === 1 && /[A-Za-z]/.test(letter)) {
      const audioPath = `/audio/${letter.toLowerCase()}.m4a`;
      await TTS.speak(letter, { audioPath, rate: 0.6, pitch: 1.1, volume: 1.0 });
    } else {
      // For non-single letters or special cases, use regular TTS with boosted volume
      await TTS.speak(letter, { rate: 0.6, pitch: 1.1, volume: 1.0 });
    }
  } catch (error) {
    console.error('Error speaking letter:', error);
  }
};

export const speakSequence = async (items, delay = 800) => {
  try {
    // Map items to an array of objects with text and audioPath for TTS.speakSequence
    const speechItems = items.map(item => {
      if (typeof item === 'string') {
        return { text: item, audioPath: null };
      } else if (item.word) {
        // It's a word object
        return { text: item.word, audioPath: item.audioPath || null };
      } else if (item.text) {
        // It already has text property
        return { text: item.text, audioPath: item.audioPath || null };
      } else {
        // Fallback
        return { text: String(item), audioPath: null };
      }
    });
    await TTS.speakSequence(speechItems, delay);
  } catch (error) {
    console.error('Error speaking sequence:', error);
  }
};

export const stopSpeaking = () => {
  TTS.cancel();
};

// Legacy exports for compatibility
export const wordDatabase = getAllWords();
export const getWordsByCategory = (category) => {
  return getAllWords().filter(word => word.category === category);
};
export const getCategories = () => {
  return [...new Set(getAllWords().map(word => word.category))];
};
export const getRandomWord = () => {
  const words = getAllWords();
  return words[Math.floor(Math.random() * words.length)];
};

