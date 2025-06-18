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
import TherapistDashboard from './components/TherapistDashboard.jsx';
import MagicPaint from './components/MagicPaint.jsx';
import MatchingGame from './components/MatchingGame.jsx';
import WordListManager from './components/WordListManager.jsx';
import { wordDatabase } from './lib/wordDatabase';
import { unifiedWords as initialWords } from './lib/unifiedWordLibrary';
import './App.css';
import { useTherapistAuth } from './hooks/useTherapistAuth';

// Helper to transform the initial grouped words into a flat array
const transformInitialWords = (words) => {
  return Object.values(words).flat();
};

function App() {
  const [currentActivity, setCurrentActivity] = useState('root'); // 'root', 'spelling', 'magic-paint', 'progress', 'therapist'
  const [currentMode, setCurrentMode] = useState('menu'); // 'menu', 'learn', 'copy', 'fillblank', 'test'
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [showPWAInstallPrompt, setShowPWAInstallPrompt] = useState(false);
  const { isAuthenticated, login, logout } = useTherapistAuth();
  const [wordList, setWordList] = useState(transformInitialWords(initialWords));

  useEffect(() => {
    // This helps initialize ResponsiveVoice and deals with browser restrictions on audio.
    if (window.responsiveVoice) {
      window.responsiveVoice.setDefaultVoice('US English Female');
      window.responsiveVoice.speak(' ', 'US English Female', { volume: 0 });
    }
  }, []);

  const currentWord = wordDatabase[currentWordIndex];

  // Global keyboard handler
  const handleGlobalKeyPress = (e) => {
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
  };

  const handleActivitySelect = (activity) => {
    setCurrentActivity(activity);
    if (activity === 'spelling') {
      setCurrentMode('menu');
    }
    // Auto-unlock when leaving spelling section
    if (activity !== 'spelling' && isNavigationLocked) {
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

  const handleTherapistDashboard = () => {
    setCurrentActivity('therapist');
    // Auto-unlock when going to therapist dashboard
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
      const nextIndex = prev < wordDatabase.length - 1 ? prev + 1 : 0;
      
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
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setShowPWAInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

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
            progressData={{
              totalSessions: 3,
              totalWordsAttempted: 33,
              totalWordsCorrect: 27,
              timeSpent: 720000,
              sessions: [
                {
                  startTime: new Date().toISOString(),
                  mode: 'learn',
                  wordsAttempted: 15,
                  wordsCorrect: 12,
                  duration: 300000,
                  difficulty: 1
                },
                {
                  startTime: new Date(Date.now() - 86400000).toISOString(),
                  mode: 'copy',
                  wordsAttempted: 10,
                  wordsCorrect: 9,
                  duration: 240000,
                  difficulty: 1
                },
                {
                  startTime: new Date(Date.now() - 172800000).toISOString(),
                  mode: 'test',
                  wordsAttempted: 8,
                  wordsCorrect: 6,
                  duration: 180000,
                  difficulty: 2
                }
              ]
            }}
            generateReport={(timeframe) => ({
              totalSessions: 3,
              totalWordsAttempted: 33,
              totalWordsCorrect: 27,
              timeSpent: 720000,
              recentSession: {
                wordsAttempted: 8,
                wordsCorrect: 6,
                difficulty: 2
              },
              ...(timeframe === 'week' && { totalSessions: 2 }),
              ...(timeframe === 'month' && { totalSessions: 3 })
            })}
            isAuthenticated={isAuthenticated}
            handleTherapistDashboard={handleTherapistDashboard}
            onWordListManager={handleWordListManager}
            exportToCSV={() => ''}
            clearAllData={() => console.log('Data cleared')}
            onHome={handleHome}
            onLock={handleLock}
            isNavigationLocked={isNavigationLocked}
          />
        );
      case 'therapist':
        return (
          <TherapistDashboard
            onHome={handleHome}
            onLock={handleLock}
            isNavigationLocked={isNavigationLocked}
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

        {/* Main Content */}
        {renderCurrentScreen()}
      </div>
    </>
  );
}

export default App;
