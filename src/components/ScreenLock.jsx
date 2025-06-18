import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Unlock, Download, X } from 'lucide-react';

const ScreenLock = ({ onUnlock }) => {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const correctCode = '1234'; // Simple unlock code

  const handleUnlock = () => {
    if (inputCode === correctCode) {
      onUnlock();
      setInputCode('');
      setError('');
      setAttempts(0);
    } else {
      setError(`Wrong code! Try 1234 (${3 - attempts - 1} attempts left)`);
      setInputCode('');
      setAttempts(prev => prev + 1);
      
      // Lock for longer after multiple failed attempts
      if (attempts >= 2) {
        setError('Too many failed attempts. Wait 10 seconds...');
        setTimeout(() => {
          setError('');
          setAttempts(0);
        }, 10000);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
    // Prevent other keyboard shortcuts when locked
    if (e.key === 'Escape' || e.altKey || e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Prevent browser back button and other navigation
  useEffect(() => {
    const preventNavigation = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    const preventKeyboardShortcuts = (e) => {
      // Prevent common exit shortcuts
      if (
        e.altKey || 
        (e.ctrlKey && (e.key === 'w' || e.key === 't' || e.key === 'r')) ||
        e.key === 'F5' ||
        e.key === 'F11'
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', preventNavigation);
    window.addEventListener('keydown', preventKeyboardShortcuts, true);

    return () => {
      window.removeEventListener('beforeunload', preventNavigation);
      window.removeEventListener('keydown', preventKeyboardShortcuts, true);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 screen-lock-overlay">
      <div className="bg-white rounded-3xl p-8 md:p-12 text-center space-y-6 md:space-y-8 max-w-md mx-4">
        <div className="text-4xl md:text-6xl mb-4">🔒</div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Screen Locked</h2>
        <p className="text-base md:text-lg text-gray-600">
          Enter the unlock code to continue
        </p>
        
        <div className="space-y-4">
          <input
            type="password"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            onKeyDown={handleKeyPress}
            className="text-xl md:text-2xl text-center p-3 md:p-4 border-4 border-gray-300 rounded-xl w-full focus:border-blue-500 focus:outline-none tablet-input"
            placeholder="Enter code"
            autoFocus
            maxLength={4}
            disabled={attempts >= 3}
          />
          
          {error && (
            <p className="text-red-500 text-sm md:text-lg">{error}</p>
          )}
        </div>

        <Button
          onClick={handleUnlock}
          size="lg"
          className="text-lg md:text-xl px-6 md:px-8 py-3 md:py-4 bg-blue-500 hover:bg-blue-600 tablet-button"
          disabled={attempts >= 3}
        >
          <Unlock className="h-5 w-5 md:h-6 md:w-6 mr-2" />
          Unlock
        </Button>
        
        <div className="text-xs md:text-sm text-gray-500 space-y-1">
          <p>Default code: 1234</p>
          <p>This prevents accidental app closure</p>
        </div>
      </div>
    </div>
  );
};

export default ScreenLock;

