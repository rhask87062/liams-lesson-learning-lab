import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, LockOpen } from 'lucide-react';

const MathLockDialog = ({ isOpen, onClose, onUnlock }) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState(false);

  // Generate new math problem when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNum1(Math.floor(Math.random() * 9) + 1); // 1-9
      setNum2(Math.floor(Math.random() * 9) + 1); // 1-9
      setUserAnswer('');
      setError(false);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctAnswer = num1 + num2;
    if (parseInt(userAnswer) === correctAnswer) {
      onUnlock();
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Unlock Navigation
          </DialogTitle>
          <DialogDescription>
            Solve this math problem to unlock navigation
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">
              {num1} + {num2} = ?
            </p>
          </div>
          <div>
            <Input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter your answer"
              className={`text-center text-2xl ${error ? 'border-red-500' : ''}`}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-1 text-center">
                Incorrect! Try again.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!userAnswer}>
              <LockOpen className="w-4 h-4 mr-2" />
              Unlock
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MathLockDialog; 