import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Unlock, X } from 'lucide-react';

const NavigationLockPrompt = ({ onUnlock, onCancel }) => {
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
      
      // Auto-close after multiple failed attempts
      if (attempts >= 2) {
        setError('Too many failed attempts. Closing...');
        setTimeout(() => {
          onCancel();
        }, 2000);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border-4 border-orange-400 rounded-xl shadow-lg p-4 z-50 max-w-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🔒</div>
          <h3 className="font-bold text-gray-800">Navigation Locked</h3>
        </div>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="p-1 h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        Enter unlock code to disable navigation protection:
      </p>
      
      <div className="space-y-2">
        <input
          type="password"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          onKeyDown={handleKeyPress}
          className="text-lg text-center p-2 border-2 border-gray-300 rounded-lg w-full focus:border-orange-500 focus:outline-none"
          placeholder="Code"
          autoFocus
          maxLength={4}
          disabled={attempts >= 3}
        />
        
        {error && (
          <p className="text-red-500 text-xs">{error}</p>
        )}
      </div>

      <div className="flex space-x-2 mt-3">
        <Button
          onClick={handleUnlock}
          size="sm"
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          disabled={attempts >= 3}
        >
          <Unlock className="h-4 w-4 mr-1" />
          Unlock
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Default: 1234
      </p>
    </div>
  );
};

export default NavigationLockPrompt;

