import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';

const LessonSettings = ({ onWordListManager }) => {
  const [activeSetting, setActiveSetting] = useState(null);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Lesson Settings</h2>
      <p className="text-gray-600 mb-6">This section will allow you to customize word lists and game settings.</p>
      
      <div className="space-y-4">
        <Button 
          onClick={onWordListManager}
          className="w-full justify-start bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200"
        >
          Word List
        </Button>
        {/* Other settings buttons will go here */}
      </div>
    </div>
  );
};

export default LessonSettings; 