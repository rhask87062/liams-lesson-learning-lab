import { useState, useEffect } from 'react';
import RootMenu from './components/RootMenu.jsx';
import SpellingMenu from './components/SpellingMenu.jsx';
import LearnMode from './components/LearnMode.jsx';
import CopyMode from './components/CopyMode.jsx';
import FillBlankMode from './components/FillBlankMode.jsx';
import TestMode from './components/TestMode.jsx';
import LetterLearner from './components/LetterLearner.jsx';
import NavigationLockPrompt from './components/NavigationLockPrompt.jsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx';
import { ProgressDashboard } from './components/ProgressDashboard.jsx';
import MagicPaint from './components/MagicPaint.jsx';
import MatchingGame from './components/MatchingGame.jsx';
import WordListManager from './components/WordListManager.jsx';
import KeyboardGuide from './components/KeyboardGuide.jsx';
import { getAllWords, speakWord as speak, stopSpeaking } from './lib/unifiedWordDatabase';
import './App.css';
import { useTherapistAuth } from './hooks/useTherapistAuth.js';
import { Button } from '@/components/ui/button';

function App() {
  console.log('App component rendering'); // Debug log
  const [currentActivity, setCurrentActivity] = useState('root'); // 'root', 'spelling', 'magic-paint', 'progress'
  const [currentMode, setCurrentMode] = useState('menu'); // 'menu', 'learn', 'copy', 'fillblank', 'test'
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [showPWAInstallPrompt, setShowPWAInstallPrompt] = useState(false);
  const { createParentAccount } = useTherapistAuth();
  const [wordList, setWordList] = useState(getAllWords());
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Initialize the auth hook. This makes the `createParentAccount` function
  // available on the window object in development mode.
  useTherapistAuth();

  useEffect(() => {
    // This helps initialize ResponsiveVoice and deals with browser restrictions on audio.
    if (window.responsiveVoice) {
      window.responsiveVoice.setDefaultVoice('US English Female');
      window.responsiveVoice.speak(' ', 'US English Female', { volume: 0 });
    }
    
    // Focus the app on load for keyboard navigation
    const appElement = document.querySelector('.App');
    if (appElement) {
      appElement.focus();
    }
  }, []);

  // Add global keyboard listener
  useEffect(() => {
    const handleWindowKeyPress = (e) => {
      console.log('Window key press detected:', e.key);
      
      // Skip keyboard handling if we're in letter-learner activity
      // as it has its own keyboard handler
      if (currentActivity === 'letter-learner') {
        console.log('Skipping global handler - in letter learner');
        return;
      }
      
      handleGlobalKeyPress(e);
    };

    window.addEventListener('keydown', handleWindowKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleWindowKeyPress);
    };
  }, [currentActivity, currentMode, isNavigationLocked]);

  const currentWord = wordList[currentWordIndex];

  // Global keyboard handler
  const handleGlobalKeyPress = (e) => {
    console.log('Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey);
    
    // Prevent handling if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      console.log('Ignoring key press - user is in input field');
      return;
    }

    // Global hotkeys that work everywhere
    if (e.ctrlKey && e.shiftKey && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      handleHome();
      return;
    }
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      handleLock();
      return;
    }

    // Navigation shortcuts (when not locked)
    if (!isNavigationLocked) {
      // Escape key to go back/home
      if (e.key === 'Escape') {
        e.preventDefault();
        handleHome();
        return;
      }

      // Arrow keys for navigation in spelling modes
      if (currentActivity === 'spelling' && currentMode !== 'menu') {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          handleNext();
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleBack();
          return;
        }
      }

      // Number keys for menu selection
      if (currentActivity === 'root') {
        console.log('In root menu, checking number keys');
        if (e.key === '1') {
          console.log('Key 1 pressed - going to spelling');
          e.preventDefault();
          handleActivitySelect('spelling');
          return;
        }
        if (e.key === '2') {
          console.log('Key 2 pressed - going to letter learner');
          e.preventDefault();
          handleActivitySelect('letter-learner');
          return;
        }
        if (e.key === '3') {
          console.log('Key 3 pressed - going to magic paint');
          e.preventDefault();
          handleActivitySelect('magic-paint');
          return;
        }
        if (e.key === '4') {
          console.log('Key 4 pressed - going to progress');
          e.preventDefault();
          handleProgressDashboard();
          return;
        }
      }

      // Spelling menu shortcuts
      if (currentActivity === 'spelling' && currentMode === 'menu') {
        if (e.key === '1') {
          e.preventDefault();
          handleModeSelect('learn');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          handleModeSelect('copy');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          handleModeSelect('fillblank');
          return;
        }
        if (e.key === '4') {
          e.preventDefault();
          handleModeSelect('test');
          return;
        }
        if (e.key === '5') {
          e.preventDefault();
          handleModeSelect('matchingGame');
          return;
        }
      }
    }
  };

  const handleActivitySelect = (activity) => {
    setCurrentActivity(activity);
    if (activity === 'spelling') {
      setCurrentMode('menu');
    }
    // Auto-unlock when leaving an activity
    if (isNavigationLocked) {
      setIsNavigationLocked(false);
    }
  };

  const handleProgressDashboard = () => {
    setCurrentActivity('progress');
    // Auto-unlock when going to progress dashboard
    if (isNavigationLocked) {
      setIsNavigationLocked(false);
    }
  };

  const handleWordListManager = () => {
    setCurrentActivity('word-list-manager');
    if (isNavigationLocked) {
      setIsNavigationLocked(false);
    }
  };

  const handleModeSelect = (mode) => {
    setCurrentMode(mode);
    setCurrentWordIndex(0);
    if (mode === 'fillblank') {
      setDifficulty(1);
    }
  };

  const handleNext = () => {
    setCurrentWordIndex((prev) => {
      const nextIndex = prev < wordList.length - 1 ? prev + 1 : 0;
      
      if (currentMode === 'fillblank' && nextIndex % 5 === 0 && difficulty < 3) {
        setDifficulty(prev => Math.min(prev + 1, 3));
      }
      
      return nextIndex;
    });
  };

  const handleBack = () => {
    if (currentWordIndex === 0) {
      setCurrentMode('menu');
    } else {
      setCurrentWordIndex((prev) => prev - 1);
    }
  };

  const handleHome = () => {
    if (currentActivity === 'spelling' && currentMode !== 'menu') {
      // From spelling mode to spelling menu
      setCurrentMode('menu');
    } else {
      // From any activity to root menu
      setCurrentActivity('root');
      setCurrentMode('menu');
      // Auto-unlock when going to root
      if (isNavigationLocked) {
        setIsNavigationLocked(false);
      }
    }
  };

  const handleCorrectAnswer = () => {
    setScore(prev => prev + 1);
  };

  const handleLock = () => {
    if (isNavigationLocked) {
      setShowUnlockPrompt(true);
    } else {
      setIsNavigationLocked(true);
    }
  };

  const handleUnlock = () => {
    setIsNavigationLocked(false);
    setShowUnlockPrompt(false);
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA installation');
        } else {
          console.log('User dismissed the PWA installation');
        }
        setDeferredPrompt(null);
        setShowPWAInstallPrompt(false);
      });
    }
  };

  const speakWord = (word) => {
    speak(word);
  };

  const renderCurrentScreen = () => {
    switch (currentActivity) {
      case 'root':
        return (
          <RootMenu
            onSelectActivity={handleActivitySelect}
            onProgressDashboard={handleProgressDashboard}
            onLock={handleLock}
            isNavigationLocked={isNavigationLocked}
          />
        );
      case 'progress':
        return (
          <ProgressDashboard
            onHome={handleHome}
            onLock={handleLock}
            isNavigationLocked={isNavigationLocked}
            progressData={{
                // This is placeholder data. In a real app, you'd fetch this
                // from a secure source after authentication.
                sessions: [],
                wordStats: {},
                dailyStats: {}
            }}
            onAddNote={(note) => console.log('Note added:', note)}
          />
        );
      case 'word-list-manager':
        return <WordListManager wordList={wordList} onWordListUpdate={setWordList} onHome={handleHome} />;
      case 'spelling':
        switch (currentMode) {
          case 'menu':
            return (
              <SpellingMenu
                onSelectMode={handleModeSelect}
                onHome={handleHome}
                onLock={handleLock}
                isNavigationLocked={isNavigationLocked}
              />
            );
          case 'learn':
            return (
              <LearnMode
                currentWord={currentWord}
                onNext={handleNext}
                onBack={handleBack}
                onHome={handleHome}
                onLock={handleLock}
                isNavigationLocked={isNavigationLocked}
              />
            );
          case 'copy':
            return (
              <CopyMode
                currentWord={currentWord}
                onNext={handleNext}
                onBack={handleBack}
                onHome={handleHome}
                onCorrect={handleCorrectAnswer}
                isNavigationLocked={isNavigationLocked}
              />
            );
          case 'fillblank':
            return (
              <FillBlankMode
                currentWord={currentWord}
                difficulty={difficulty}
                onNext={handleNext}
                onBack={handleBack}
                onHome={handleHome}
                onLock={handleLock}
                onCorrect={handleCorrectAnswer}
                isNavigationLocked={isNavigationLocked}
              />
            );
          case 'test':
            return (
              <TestMode
                currentWord={currentWord}
                onNext={handleNext}
                onBack={handleBack}
                onHome={handleHome}
                onLock={handleLock}
                onCorrect={handleCorrectAnswer}
                isNavigationLocked={isNavigationLocked}
              />
            );
          case 'matchingGame':
            return (
              <MatchingGame
                onHome={handleHome}
                onLock={handleLock}
                isNavigationLocked={isNavigationLocked}
              />
            );
          default:
            return null;
        }
      case 'letter-learner':
        return (
          <LetterLearner
            wordList={wordList}
            onHome={handleHome}
            onLock={handleLock}
            isNavigationLocked={isNavigationLocked}
          />
        );
      case 'magic-paint':
        return (
          <MagicPaint
            onHome={handleHome}
            onLock={handleLock}
            isNavigationLocked={isNavigationLocked}
          />
        );
      case 'matching-game':
        return (
          <MatchingGame
            onHome={handleHome}
            onLock={handleLock}
            isNavigationLocked={isNavigationLocked}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="App" onKeyDown={handleGlobalKeyPress} tabIndex={0}>
        {/* Score display for spelling activities */}
        {currentActivity === 'spelling' && currentMode !== 'menu' && (
          <div className="fixed top-4 left-4 bg-white rounded-xl p-3 shadow-lg z-40">
            <p className="text-base md:text-lg font-semibold">Score: {score}</p>
            {currentMode === 'fillblank' && (
              <p className="text-sm text-gray-600">Level: {difficulty}</p>
            )}
          </div>
        )}

        {/* Navigation Lock Prompt */}
        {showUnlockPrompt && (
          <NavigationLockPrompt
            onUnlock={handleUnlock}
            onCancel={() => setShowUnlockPrompt(false)}
          />
        )}

        {/* PWA Install Prompt */}
        <PWAInstallPrompt showOnActivity={currentActivity === 'root'} />

        {/* Keyboard Guide */}
        <KeyboardGuide />

        {/* Main Content */}
        {renderCurrentScreen()}
      </div>
    </>
  );
}

export default App;
