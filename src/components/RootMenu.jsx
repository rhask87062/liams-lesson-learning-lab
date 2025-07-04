import { Button } from '@/components/ui/button';
import labBackground from '../assets/lab.png';
import telescope from '../assets/telescope.png';
import microscope from '../assets/microscope.png';
import computer from '../assets/computer.png';
import fossil from '../assets/fossil.png';
import banner from '../assets/banner.png';
import { useIsMobile } from '../hooks/use-mobile';

const RootMenu = ({ onSelectActivity, onProgressDashboard, onInstallApp, deferredPrompt }) => {
  const isMobile = useIsMobile();

  const activities = [
    {
      id: 'spelling',
      title: 'Spelling Games',
      asset: telescope,
      position: 'absolute left-11 top-36',
      size: 'w-28 h-28 md:w-48 md:h-48',
      glow: 'group-hover:drop-shadow-[0_0_15px_#FBBF24]', // Yellow glow to match text-yellow-500
      labelColor: 'text-yellow-500',
      labelGap: '-mt-1', // Custom gap for telescope
      textGlow: 'group-hover:drop-shadow-[0_0_25px_#FBBF24]',
      hoverTransform: 'group-hover:-translate-y-2', // 2px up for spelling
      hoverTextColor: 'group-hover:text-yellow-300' // Brighter yellow
    },
    {
      id: 'matching-game',
      title: 'Matching Game',
      asset: microscope,
      position: 'absolute left-24 bottom-36',
      size: 'w-24 h-24 md:w-40 md:h-40',
      glow: 'group-hover:drop-shadow-[0_0_15px_#3B82F6]', // Blue glow to match text-blue-500
      labelColor: 'text-blue-500',
      labelGap: '-mt-2', // Custom gap for microscope
      textGlow: 'group-hover:drop-shadow-[0_0_25px_#3B82F6]',
      hoverTransform: 'group-hover:-translate-y-2', // 2px up for matching
      hoverTextColor: 'group-hover:text-blue-300' // Brighter blue
    },
    {
      id: 'magic-paint',
      title: 'Magic Paint',
      asset: computer,
      position: 'absolute right-28 top-36',
      size: 'w-24 h-24 md:w-40 md:h-40',
      glow: 'group-hover:drop-shadow-[0_0_15px_#10B981]', // Green glow to match text-green-500
      labelColor: 'text-green-500',
      labelGap: '-mt-2', // Custom gap for computer
      textGlow: 'group-hover:drop-shadow-[0_0_25px_#10B981]',
      hoverTransform: 'group-hover:-translate-y-2', // 2px up for magic paint
      hoverTextColor: 'group-hover:text-green-300' // Brighter green
    },
    {
      id: 'letter-learner',
      title: 'Letter Learner',
      asset: fossil,
      position: 'absolute left-90 bottom-65',
      size: 'w-20 h-20 md:w-88 md:h-88',
      glow: 'group-hover:drop-shadow-[0_0_15px_#F97316]', // Orange glow to match text-orange-500
      labelColor: 'text-orange-500',
      labelGap: '-mt-22', // Custom gap for fossil
      textGlow: 'group-hover:drop-shadow-[0_0_25px_#F97316]',
      hoverTransform: 'group-hover:-translate-y-3', // 4px up for letter learner
      hoverTextColor: 'group-hover:text-orange-300' // Brighter orange
    },
  ];

  // Mobile Layout - Simple Cards
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 overflow-y-auto pb-20">
        {/* Banner at top */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-purple-400 to-transparent pb-4">
          <img 
            src={banner} 
            alt="Liam's Learning Lab" 
            className="h-20 w-auto mx-auto"
          />
        </div>

        {/* Activity Cards */}
        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto px-4">
          {activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => onSelectActivity(activity.id)}
              className="bg-white rounded-2xl p-6 shadow-lg flex items-center space-x-4 transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <img 
                src={activity.asset} 
                alt={activity.title}
                className="w-20 h-20 object-contain"
              />
              <div className="flex-1 text-left">
                <h2 className={`text-xl font-bold ${activity.labelColor}`}>
                  {activity.title}
                </h2>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Actions - Fixed */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 flex justify-between shadow-lg">
          <Button
            onClick={onProgressDashboard}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xl flex items-center justify-center"
          >
            📊 Progress
          </Button>
          
          {deferredPrompt && (
            <Button
              onClick={onInstallApp}
              className="bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-xl flex items-center justify-center"
            >
              📱 Install
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Desktop/Tablet Layout - Original Lab
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${labBackground})` }}
    >
      {/* Banner at top */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
        <img 
          src={banner} 
          alt="Liam's Learning Lab" 
          className="h-16 md:h-24 w-auto transform scale-x-125"
        />
      </div>

      {/* Progress Button - Top Right */}
      <div className="absolute top-4 right-9 group cursor-pointer z-20">
        <Button
          onClick={onProgressDashboard}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xl flex items-center justify-center text-lg font-medium border-2 border-white transition-all duration-300 group-hover:drop-shadow-[0_0_15px_#3B82F6] group-hover:scale-110"
        >
          📊
        </Button>
        
        {/* Progress Button Label */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-blue-500 group-hover:text-blue-300 group-hover:drop-shadow-[0_0_15px_#3B82F6] text-sm font-black whitespace-nowrap text-center transition-all duration-300" style={{ fontFamily: 'Impact, "Arial Black", "Trebuchet MS", sans-serif', letterSpacing: '0.5px' }}>
            Progress Data
          </div>
        </div>
      </div>

      {/* Install App Button - Below Progress */}
      {deferredPrompt && (
        <div className="absolute top-20 right-9 group cursor-pointer z-20">
          <Button
            onClick={onInstallApp}
            className="w-14 h-14 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-xl flex items-center justify-center text-lg font-medium border-2 border-white transition-all duration-300 group-hover:drop-shadow-[0_0_15px_#10B981] group-hover:scale-110"
          >
            📱
          </Button>
          
          {/* Install Button Label */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-green-500 group-hover:text-green-300 group-hover:drop-shadow-[0_0_15px_#10B981] text-sm font-black whitespace-nowrap text-center transition-all duration-300" style={{ fontFamily: 'Impact, "Arial Black", "Trebuchet MS", sans-serif', letterSpacing: '0.5px' }}>
              Install App
            </div>
          </div>
        </div>
      )}

      {/* Activity Buttons */}
      {activities.map((activity) => (
        <div
          key={activity.id}
          className={`${activity.position} group cursor-pointer`}
          onClick={() => onSelectActivity(activity.id)}
        >
          {/* Activity Asset */}
          <div className={`${activity.size} ${activity.hoverTransform} transition-all duration-300`}>
            <img 
              src={activity.asset} 
              alt={activity.title}
              className={`w-full h-full object-contain ${activity.glow} transition-all duration-300`}
            />
          </div>
          
          {/* Activity Label */}
          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 ${activity.labelGap} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
            <div className={`${activity.labelColor} ${activity.hoverTextColor} ${activity.textGlow} text-lg md:text-2xl font-black whitespace-nowrap text-center transition-all duration-300`} style={{ fontFamily: 'Impact, "Arial Black", "Trebuchet MS", sans-serif', letterSpacing: '0.5px' }}>
              {activity.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RootMenu;

