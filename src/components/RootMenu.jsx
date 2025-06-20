import { useState } from 'react';
import { BookOpen, Sparkles, BarChart3, Type } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const RootMenu = ({ onSelectActivity, onProgressDashboard }) => {
  const activities = [
    {
      id: 'spelling',
      title: 'Spelling Games',
      icon: BookOpen,
      color: 'from-blue-400 to-purple-600',
      emoji: '📚'
    },
    {
      id: 'matching-game',
      title: 'Matching Game',
      icon: Sparkles,
      color: 'from-teal-400 to-cyan-500',
      emoji: '🧩'
    },
    {
      id: 'letter-learner',
      title: 'Letter Learner',
      icon: Type,
      color: 'from-orange-400 to-pink-500',
      emoji: '🔤'
    },
    {
      id: 'magic-paint',
      title: 'Magic Paint',
      icon: Sparkles,
      color: 'from-pink-400 to-orange-500',
      emoji: '✨'
    },
    {
      id: 'progress',
      title: 'Progress Reports',
      icon: BarChart3,
      color: 'from-green-400 to-green-600',
      emoji: '📊'
    }
  ];

  // Keyboard handling is now done at the App level

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100"
    >
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="text-8xl md:text-9xl mb-4">🎮</div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Activity Center
        </h1>
        <p className="text-xl md:text-2xl text-gray-600">
          Choose your adventure!
        </p>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-7xl">
        {activities.map((activity, index) => (
          <Button
            key={activity.id}
            onClick={() => {
              if (activity.id === 'progress') {
                onProgressDashboard();
              } else {
                onSelectActivity(activity.id);
              }
            }}
            className={`relative h-48 md:h-64 p-8 md:p-12 bg-gradient-to-br ${activity.color} hover:scale-105 transform transition-all duration-300 shadow-xl hover:shadow-2xl rounded-3xl border-0 text-white group overflow-hidden`}
            tabIndex={index + 1}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="text-6xl md:text-7xl mb-2">{activity.emoji}</div>
              <activity.icon className="h-8 w-8 md:h-12 md:w-12 mb-2" />
              <h2 className="text-2xl md:text-3xl font-bold">{activity.title}</h2>
            </div>

            {/* Number indicator */}
            <div className="absolute top-4 right-4 bg-white/20 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
              <span className="text-lg md:text-xl font-bold">{index + 1}</span>
            </div>
          </Button>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-8 md:mt-12 text-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg">
          <p className="text-base md:text-lg text-gray-700">
            <strong>How to play:</strong> Touch an activity or press the number keys
          </p>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            <strong>Keyboard shortcuts:</strong> 1 = Spelling Games, 2 = Matching Game, 3 = Letter Learner, 4 = Magic Paint, 5 = Progress, Ctrl+Shift+H = Home
          </p>
        </div>
      </div>
    </div>
  );
};

export default RootMenu;

