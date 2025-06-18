import { useState, useEffect } from 'react';

// Custom hook for managing app state
export const useSpellingApp = () => {
  const [currentMode, setCurrentMode] = useState('menu'); // 'menu', 'learn', 'copy'
  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);

  // Reset state when changing modes
  const resetState = () => {
    setUserInput('');
    setIsCorrect(null);
  };

  // Check if spelling is correct
  const checkSpelling = (input, targetWord) => {
    return input.toLowerCase().trim() === targetWord.toLowerCase();
  };

  // Handle mode changes
  const changeMode = (newMode) => {
    resetState();
    setCurrentMode(newMode);
  };

  return {
    currentMode,
    currentWord,
    userInput,
    isCorrect,
    score,
    wordsCompleted,
    isNavigationLocked,
    setCurrentMode: changeMode,
    setCurrentWord,
    setUserInput,
    setIsCorrect,
    setScore,
    setWordsCompleted,
    setIsNavigationLocked,
    resetState,
    checkSpelling
  };
};

// Custom hook for keyboard navigation
export const useKeyboardNavigation = (onEnter, onEscape) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && onEnter) {
        onEnter();
      }
      if (event.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onEnter, onEscape]);
};

// Custom hook for navigation lock functionality (not screen lock)
export const useNavigationLock = () => {
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);
  const [lockCode, setLockCode] = useState('1234'); // Simple default code

  const lockNavigation = () => {
    setIsNavigationLocked(true);
    // Request fullscreen for better focus
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen might fail, but navigation lock still works
      });
    }
  };

  const unlockNavigation = (inputCode) => {
    if (inputCode === lockCode) {
      setIsNavigationLocked(false);
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          // Exit fullscreen might fail, but that's okay
        });
      }
      return true;
    }
    return false;
  };

  // Prevent navigation shortcuts when locked, but allow app interaction
  useEffect(() => {
    if (isNavigationLocked) {
      const preventNavigation = (event) => {
        // Prevent browser navigation shortcuts
        if (
          event.altKey || 
          (event.ctrlKey && (event.key === 'w' || event.key === 't' || event.key === 'r')) ||
          event.key === 'F5' ||
          event.key === 'F11' ||
          (event.ctrlKey && event.key === 'l') // Address bar
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      };

      const preventBrowserBack = (event) => {
        // Prevent browser back button
        event.preventDefault();
        event.returnValue = '';
        return '';
      };

      window.addEventListener('keydown', preventNavigation, true);
      window.addEventListener('beforeunload', preventBrowserBack);
      
      return () => {
        window.removeEventListener('keydown', preventNavigation, true);
        window.removeEventListener('beforeunload', preventBrowserBack);
      };
    }
  }, [isNavigationLocked]);

  return {
    isNavigationLocked,
    lockNavigation,
    unlockNavigation,
    setLockCode
  };
};

