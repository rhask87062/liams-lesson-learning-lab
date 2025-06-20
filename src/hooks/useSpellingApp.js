import { useState, useEffect, useCallback } from 'react';

const APP_VERSION = "1.0"; 

// Custom hook for managing progress data
export const useProgressTracking = () => {
    const [progressData, setProgressData] = useState(() => {
        try {
            const savedData = localStorage.getItem('spellingAppProgress');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Basic migration check
                if (parsedData.version === APP_VERSION) {
                    return parsedData;
                }
            }
        } catch (error) {
            console.error("Error loading progress data:", error);
            return null;
        }
        // Return a fresh object if no valid data is found
        return {
            version: APP_VERSION,
            sessions: [],
            wordStats: {},
            dailyStats: {},
            lastSession: null,
        };
    });

    const [currentSession, setCurrentSession] = useState(null);

    // Save progress to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('spellingAppProgress', JSON.stringify(progressData));
        } catch (error) {
            console.error("Error saving progress data:", error);
        }
    }, [progressData]);

    const startSession = useCallback(() => {
        const newSession = {
            startTime: new Date().toISOString(),
            endTime: null,
            duration: 0,
            wordsAttempted: 0,
            wordsCorrect: 0,
            wordDetails: {} // word: { attempts, correct }
        };
        setCurrentSession(newSession);
    }, []);

    const trackAttempt = useCallback((word, isCorrect) => {
        if (!currentSession) return;

        setCurrentSession(prevSession => {
            const newDetails = { ...(prevSession.wordDetails[word] || { attempts: 0, correct: 0 }) };
            newDetails.attempts += 1;
            if (isCorrect) {
                newDetails.correct += 1;
            }

            return {
                ...prevSession,
                wordsAttempted: prevSession.wordsAttempted + 1,
                wordsCorrect: isCorrect ? prevSession.wordsCorrect + 1 : prevSession.wordsCorrect,
                wordDetails: {
                    ...prevSession.wordDetails,
                    [word]: newDetails,
                }
            };
        });
    }, [currentSession]);
    
    const endSession = useCallback(() => {
        if (!currentSession) return;

        const sessionWithEnd = {
            ...currentSession,
            endTime: new Date().toISOString(),
            duration: new Date() - new Date(currentSession.startTime),
        };

        setProgressData(prevData => {
            // Update word stats
            const newWordStats = { ...prevData.wordStats };
            Object.entries(sessionWithEnd.wordDetails).forEach(([word, stats]) => {
                if (!newWordStats[word]) {
                    newWordStats[word] = { attempts: 0, correct: 0 };
                }
                newWordStats[word].attempts += stats.attempts;
                newWordStats[word].correct += stats.correct;
            });

            // Update daily stats
            const today = new Date().toISOString().split('T')[0];
            const newDailyStats = { ...prevData.dailyStats };
            if (!newDailyStats[today]) {
                newDailyStats[today] = { attempts: 0, correct: 0, timeSpent: 0 };
            }
            newDailyStats[today].attempts += sessionWithEnd.wordsAttempted;
            newDailyStats[today].correct += sessionWithEnd.wordsCorrect;
            newDailyStats[today].timeSpent += sessionWithEnd.duration;
            
            return {
                ...prevData,
                sessions: [...prevData.sessions, sessionWithEnd],
                wordStats: newWordStats,
                dailyStats: newDailyStats,
                lastSession: sessionWithEnd,
            };
        });

        setCurrentSession(null);
    }, [currentSession]);

    return { progressData, startSession, endSession, trackAttempt };
};

// Custom hook for managing app state
export const useSpellingApp = () => {
  const { progressData, startSession, endSession, trackAttempt } = useProgressTracking();
  const [currentMode, setCurrentMode] = useState('menu'); // 'menu', 'learn', 'copy'
  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);

  // Start a session when the component mounts
  useEffect(() => {
    startSession();
    // End the session when the user leaves the page
    return () => endSession();
  }, [startSession, endSession]);

  // Reset state when changing modes
  const resetState = () => {
    setUserInput('');
    setIsCorrect(null);
  };

  // Check if spelling is correct
  const checkSpelling = (input, targetWord) => {
    const isSpellingCorrect = input.toLowerCase().trim() === targetWord.toLowerCase();
    trackAttempt(targetWord, isSpellingCorrect); // Track every attempt
    return isSpellingCorrect;
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
    progressData, // Expose progress data
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

