import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';

const KeyboardGuide = () => {
  const shortcuts = [
    { category: 'Global Navigation', items: [
      { keys: 'Escape', action: 'Go back to previous screen or home' },
      { keys: 'Ctrl + Shift + H', action: 'Go to home screen' },
      { keys: 'Ctrl + L', action: 'Lock/unlock navigation' },
      { keys: 'Arrow Left', action: 'Previous word (in spelling modes)' },
      { keys: 'Arrow Right', action: 'Next word (in spelling modes)' },
      { keys: 'Enter', action: 'Next word or submit answer' },
    ]},
    { category: 'Main Menu', items: [
      { keys: '1', action: 'Spelling Games' },
      { keys: '2', action: 'Letter Learner' },
      { keys: '3', action: 'Magic Paint' },
      { keys: '4', action: 'Progress Reports' },
    ]},
    { category: 'Spelling Menu', items: [
      { keys: '1', action: 'Learn Mode' },
      { keys: '2', action: 'Copy Mode' },
      { keys: '3', action: 'Fill in the Blank Mode' },
      { keys: '4', action: 'Test Mode' },
      { keys: '5', action: 'Matching Game' },
    ]},
    { category: 'In Game', items: [
      { keys: 'Ctrl + S', action: 'Speak/hear the current word' },
      { keys: 'Space', action: 'Play sound (in Learn Mode)' },
      { keys: 'A-Z', action: 'Type letters for spelling practice' },
      { keys: 'Backspace', action: 'Delete last letter' },
      { keys: 'Tab', action: 'Move to next input field' },
    ]},
    { category: 'Special Features', items: [
      { keys: 'F11', action: 'Toggle fullscreen' },
      { keys: 'Ctrl + Plus', action: 'Zoom in' },
      { keys: 'Ctrl + Minus', action: 'Zoom out' },
      { keys: 'Ctrl + 0', action: 'Reset zoom' },
    ]},
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 left-4 z-50 bg-white/90 hover:bg-white shadow-lg"
          title="Keyboard shortcuts guide"
        >
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard className="h-6 w-6" />
            Keyboard Shortcuts Guide
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Teaching keyboard shortcuts helps develop typing skills alongside spelling!
            </p>
          </div>

          {shortcuts.map((section, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-800">{section.category}</h3>
              <div className="space-y-1">
                {section.items.map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50">
                    <kbd className="px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow">
                      {shortcut.keys}
                    </kbd>
                    <span className="text-sm text-gray-600 ml-4">{shortcut.action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Practice Tip:</strong> Start with number keys for menu navigation, then gradually introduce letter typing in spelling modes.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardGuide; 