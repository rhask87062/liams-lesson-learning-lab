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
      position: 'absolute left-[12%] top-[25%]',
      size: 'w-[15%] h-auto',
      glow: 'group-hover:drop-shadow-[0_0_15px_#FBBF24]', // Yellow glow to match text-yellow-500
      labelColor: 'text-yellow-500',
      labelGap: 'mt-1', // Custom gap for telescope
      textGlow: 'group-hover:drop-shadow-[0_0_25px_#FBBF24]',
      hoverTransform: 'group-hover:-translate-y-2', // 2px up for spelling
      hoverTextColor: 'group-hover:text-yellow-300' // Brighter yellow
    },
    {
      id: 'matching-game',
      title: 'Matching Game',
      asset: microscope,
      position: 'absolute left-[20%] bottom-[25%]',
      size: 'w-[12%] h-auto',
      glow: 'group-hover:drop-shadow-[0_0_15px_#3B82F6]', // Blue glow to match text-blue-500
      labelColor: 'text-blue-500',
      labelGap: 'mt-1', // Custom gap for microscope
      textGlow: 'group-hover:drop-shadow-[0_0_25px_#3B82F6]',
      hoverTransform: 'group-hover:-translate-y-2', // 2px up for matching
      hoverTextColor: 'group-hover:text-blue-300' // Brighter blue
    },
    {
      id: 'magic-paint',
      title: 'Magic Paint',
      asset: computer,
      position: 'absolute right-[20%] top-[25%]',
      size: 'w-[12%] h-auto',
      glow: 'group-hover:drop-shadow-[0_0_15px_#10B981]', // Green glow to match text-green-500
      labelColor: 'text-green-500',
      labelGap: 'mt-1', // Custom gap for computer
      textGlow: 'group-hover:drop-shadow-[0_0_25px_#10B981]',
      hoverTransform: 'group-hover:-translate-y-2', // 2px up for magic paint
      hoverTextColor: 'group-hover:text-green-300' // Brighter green
    },
    {
      id: 'letter-learner',
      title: 'Letter Learner',
      asset: fossil,
      position: 'absolute left-[55%] bottom-[30%]',
      size: 'w-[10%] h-auto',
      glow: 'group-hover:drop-shadow-[0_0_15px_#F97316]', // Orange glow to match text-orange-500
      labelColor: 'text-orange-500',
      labelGap: 'mt-1', // Custom gap for fossil
      textGlow: 'group-hover:drop-shadow-[0_0_25px_#F97316]',
      hoverTransform: 'group-hover:-translate-y-3', // 4px up for letter learner
      hoverTextColor: 'group-hover:text-orange-300' // Brighter orange
    },
  ];

  // Function to render child-like text
  const renderChildlikeText = (text, colorClass) => {
    return text.split('').map((char, index) => {
      if (char === ' ') return <span key={index}>&nbsp;</span>;
      
      // Random transformations for each letter
      const transforms = [
        'rotate-[-8deg]',
        'rotate-[12deg]',
        'rotate-[-15deg]',
        'rotate-[10deg]',
        'rotate-[-5deg]',
        'scale-x-[-1]', // backwards
        'skew-x-[-10deg]',
        'skew-x-[8deg]',
        'translate-y-[-2px]',
        'translate-y-[3px]',
      ];
      
      const randomTransform = transforms[Math.floor(Math.random() * transforms.length)];
      
      return (
        <span
          key={index}
          className={`inline-block transition-all duration-300 group-hover:rotate-0 group-hover:scale-x-100 group-hover:skew-x-0 group-hover:translate-y-0 ${randomTransform} ${colorClass}`}
        >
          {char}
        </span>
      );
    });
  };

  // Mobile Layout - Simple Cards
  if (isMobile) {
    return (
      <>
        <style>{`
          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
          .child-text-mobile {
            display: inline-block;
            transition: all 0.3s ease;
            transform: rotate(0deg) translateY(0) scale(1) scaleX(1) skewX(0deg);
          }
          button:hover .child-text-mobile:nth-child(odd),
          button:active .child-text-mobile:nth-child(odd) {
            transform: rotate(-8deg) translateY(-2px);
          }
          button:hover .child-text-mobile:nth-child(even),
          button:active .child-text-mobile:nth-child(even) {
            transform: rotate(6deg) translateY(2px);
          }
          button:hover .child-text-mobile:nth-child(3n),
          button:active .child-text-mobile:nth-child(3n) {
            transform: rotate(-12deg) scale(1.1);
          }
          button:hover .child-text-mobile:nth-child(4n),
          button:active .child-text-mobile:nth-child(4n) {
            transform: scaleX(-1) rotate(5deg);
          }
          button:hover .child-text-mobile:nth-child(5n),
          button:active .child-text-mobile:nth-child(5n) {
            transform: skewX(-15deg) rotate(-3deg);
          }
        `}</style>
        <div className="min-h-screen bg-gradient-to-b from-gray-800 via-yellow-500 to-orange-500 overflow-y-auto pb-20">
          {/* Banner at top */}
          <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-800 to-transparent pb-4">
            <img 
              src={banner} 
              alt="Liam's Learning Lab" 
              className="h-64 w-auto mx-auto"
            />
          </div>

          {/* Activity Cards */}
          <div className="grid grid-cols-1 gap-4 max-w-md mx-auto px-4">
            {activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => onSelectActivity(activity.id)}
                className="bg-white rounded-2xl p-6 shadow-lg flex items-center space-x-4 transform transition-all duration-200 hover:scale-105 active:scale-95 group"
              >
                <img 
                  src={activity.asset} 
                  alt={activity.title}
                  className="w-20 h-20 object-contain"
                />
                <div className="flex-1 text-left">
                  <h2 className={`text-xl font-bold ${activity.labelColor}`}>
                    {activity.title.split('').map((char, i) => (
                      <span key={i} className="child-text-mobile">
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    ))}
                  </h2>
                </div>
              </button>
            ))}
            
            {/* Progress Card */}
            <button
              onClick={onProgressDashboard}
              className="bg-white rounded-2xl p-6 shadow-lg flex items-center space-x-4 transform transition-all duration-200 hover:scale-105 active:scale-95 group"
            >
              <div className="w-20 h-20 flex items-center justify-center text-5xl">
                📊
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-xl font-bold text-blue-500">
                  {'Progress'.split('').map((char, i) => (
                    <span key={i} className="child-text-mobile">
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </h2>
              </div>
            </button>
          </div>

          {/* Bottom Actions - Fixed */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 flex justify-center shadow-lg">
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
      </>
    );
  }

  // Desktop/Tablet Layout - Original Lab
  return (
    <>
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .child-text {
          display: inline-block;
          transition: all 0.3s ease;
          transform: rotate(0deg) translateY(0) scale(1) scaleX(1) skewX(0deg);
        }
        .group:hover .child-text:nth-child(odd) {
          transform: rotate(-8deg) translateY(-2px);
        }
        .group:hover .child-text:nth-child(even) {
          transform: rotate(6deg) translateY(2px);
        }
        .group:hover .child-text:nth-child(3n) {
          transform: rotate(-12deg) scale(1.1);
        }
        .group:hover .child-text:nth-child(4n) {
          transform: scaleX(-1) rotate(5deg);
        }
        .group:hover .child-text:nth-child(5n) {
          transform: skewX(-15deg) rotate(-3deg);
        }
      `}</style>
      <div 
        className="flex items-center justify-center min-h-screen p-4 md:p-8 relative overflow-hidden"
      >
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${labBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Content Container - maintains aspect ratio */}
        <div className="relative w-full h-full min-h-screen">
          {/* Banner at top */}
          <div className="absolute top-[2%] left-1/2 transform -translate-x-1/2 z-10 w-[20%]">
            <img 
              src={banner} 
              alt="Liam's Learning Lab" 
              className="w-full h-auto"
            />
          </div>

          {/* Progress Button - Top Right */}
          <div className="absolute top-[5%] right-[5%] group cursor-pointer z-20">
            <Button
              onClick={onProgressDashboard}
              className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xl flex items-center justify-center text-lg font-medium border-2 border-white transition-all duration-300 group-hover:scale-110"
            >
              📊
            </Button>
            
            {/* Progress Button Label */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-blue-500 group-hover:text-blue-300 text-sm font-black whitespace-nowrap text-center transition-all duration-300" style={{ fontFamily: 'Impact, "Arial Black", "Trebuchet MS", sans-serif', letterSpacing: '0.5px' }}>
                Progress Data
              </div>
            </div>
          </div>

          {/* Install App Button - Below Progress */}
          {deferredPrompt && (
            <div className="absolute top-[13%] right-[5%] group cursor-pointer z-20">
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
              
              {/* Activity Label - positioned below the asset */}
              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 ${activity.labelGap} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
                <div className={`${activity.labelColor} ${activity.hoverTextColor} ${activity.textGlow} text-[1.2vw] font-black whitespace-nowrap text-center transition-all duration-300`} style={{ fontFamily: 'Impact, "Arial Black", "Trebuchet MS", sans-serif', letterSpacing: '0.5px' }}>
                  {activity.title.split('').map((char, i) => (
                    <span key={i} className="child-text">
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RootMenu;

