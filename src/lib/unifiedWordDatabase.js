// Enhanced word database with real photos for consistent curriculum
import * as TTS from '../utils/simpleTTS.js';

// Unified word database for all learning modes
export const unifiedWordDatabase = {
  // Core vocabulary organized by starting letter
  A: [
    { word: 'apple', image: '/images/words/apple.png', category: 'food', audioPath: '/audio/apple.wav' },
    { word: 'ant', image: '/images/words/ant.png', category: 'animals' }
  ],
  B: [
    { word: 'ball', image: '/images/words/ball.png', category: 'toys' },
    { word: 'banana', image: '/images/words/banana.png', category: 'food' }
  ],
  C: [
    { word: 'cat', image: '/images/words/cat.png', category: 'animals' },
    { word: 'car', image: '/images/words/car.png', category: 'toys' }
  ],
  D: [
    { word: 'dog', image: '/images/words/dog.png', category: 'animals' },
    { word: 'duck', image: '/images/words/duck.png', category: 'animals' }
  ],
  E: [
    { word: 'elephant', image: '/images/words/elephant.png', category: 'animals' },
    { word: 'egg', image: '/images/words/egg.png', category: 'food' },
    { word: 'eleven', image: '/images/words/eleven.png', category: 'numbers' },
    { word: 'eighteen', image: '/images/words/eighteen.png', category: 'numbers' }
  ],
  F: [
    { word: 'fish', image: '/images/words/fish.png', category: 'animals' },
    { word: 'frog', image: '/images/words/frog.png', category: 'animals' },
    { word: 'fourteen', image: '/images/words/fourteen.png', category: 'numbers' },
    { word: 'fifteen', image: '/images/words/fifteen.png', category: 'numbers' }
  ],
  G: [
    { word: 'giraffe', image: '/images/words/giraffe.png', category: 'animals' },
    { word: 'goat', image: '/images/words/goat.png', category: 'animals' }
  ],
  H: [
    { word: 'horse', image: '/images/words/horse.png', category: 'animals' },
    { word: 'hat', image: '/images/words/hat.png', category: 'clothes' }
  ],
  I: [
    { word: 'ice cream', image: '/images/words/ice cream.png', category: 'food' },
    { word: 'igloo', image: '/images/words/igloo.png', category: 'places' }
  ],
  J: [
    { word: 'jellyfish', image: '/images/words/jellyfish.png', category: 'animals' },
    { word: 'juice', image: '/images/words/juice.png', category: 'food' }
  ],
  K: [
    { word: 'kite', image: '/images/words/kite.png', category: 'toys' },
    { word: 'kangaroo', image: '/images/words/kangaroo.png', category: 'animals' }
  ],
  L: [
    { word: 'lion', image: '/images/words/lion.png', category: 'animals' },
    { word: 'lemon', image: '/images/words/lemon.png', category: 'food' }
  ],
  M: [
    { word: 'monkey', image: '/images/words/monkey.png', category: 'animals' },
    { word: 'moon', image: '/images/words/moon.png', category: 'nature' }
  ],
  N: [
    { word: 'nest', image: '/images/words/nest.png', category: 'nature' },
    { word: 'nose', image: '/images/words/nose.png', category: 'body' },
    { word: 'nineteen', image: '/images/words/nineteen.png', category: 'numbers' }
  ],
  O: [
    { word: 'orange', image: '/images/words/orange.png', category: 'food' },
    { word: 'owl', image: '/images/words/owl.png', category: 'animals' }
  ],
  P: [
    { word: 'penguin', image: '/images/words/penguin.png', category: 'animals' },
    { word: 'pizza', image: '/images/words/pizza.png', category: 'food' }
  ],
  Q: [
    { word: 'queen', image: '/images/words/queen.png', category: 'people' },
    { word: 'quilt', image: '/images/words/quilt.png', category: 'objects' }
  ],
  R: [
    { word: 'rabbit', image: '/images/words/rabbit.png', category: 'animals' },
    { word: 'rainbow', image: '/images/words/rainbow.png', category: 'nature' }
  ],
  S: [
    { word: 'sun', image: '/images/words/sun.png', category: 'nature' },
    { word: 'snake', image: '/images/words/snake.png', category: 'animals' },
    { word: 'sixteen', image: '/images/words/sixteen.png', category: 'numbers' },
    { word: 'seventeen', image: '/images/words/seventeen.png', category: 'numbers' }
  ],
  T: [
    { word: 'tree', image: '/images/words/tree.png', category: 'nature' },
    { word: 'tiger', image: '/images/words/tiger.png', category: 'animals' },
    { word: 'twelve', image: '/images/words/twelve.png', category: 'numbers' },
    { word: 'thirteen', image: '/images/words/thirteen.png', category: 'numbers' },
    { word: 'twenty', image: '/images/words/twenty.png', category: 'numbers' }
  ],
  U: [
    { word: 'umbrella', image: '/images/words/umbrella.png', category: 'objects' },
    { word: 'unicorn', image: '/images/words/unicorn.png', category: 'fantasy' }
  ],
  V: [
    { word: 'violin', image: '/images/words/violin.png', category: 'music' },
    { word: 'van', image: '/images/words/van.png', category: 'vehicles' }
  ],
  W: [
    { word: 'whale', image: '/images/words/whale.png', category: 'animals' },
    { word: 'watermelon', image: '/images/words/watermelon.png', category: 'food' }
  ],
  X: [
    { word: 'xylophone', image: '/images/words/xylophone.png', category: 'music' },
    { word: 'x-ray', image: '/images/words/x-ray.png', category: 'medical' }
  ],
  Y: [
    { word: 'yak', image: '/images/words/yak.png', category: 'animals' },
    { word: 'yo-yo', image: '/images/words/yo-yo.png', category: 'toys' }
  ],
  Z: [
    { word: 'zebra', image: '/images/words/zebra.png', category: 'animals' },
    { word: 'zoo', image: '/images/words/zoo.png', category: 'places' }
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

