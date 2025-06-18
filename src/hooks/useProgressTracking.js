import { useState, useEffect } from 'react';

// Progress tracking hook for educational data collection
export function useProgressTracking() {
  const [progressData, setProgressData] = useState(() => {
    const saved = localStorage.getItem('liamProgressData');
    return saved ? JSON.parse(saved) : {
      sessions: [],
      totalWordsAttempted: 0,
      totalWordsCorrect: 0,
      timeSpent: 0,
      modeStats: {
        learn: { attempts: 0, timeSpent: 0 },
        copy: { attempts: 0, correct: 0, timeSpent: 0 },
        fillBlanks: { attempts: 0, correct: 0, timeSpent: 0, difficultyProgression: [] },
        test: { attempts: 0, correct: 0, timeSpent: 0 }
      },
      wordStats: {},
      dailyStats: {},
      createdAt: new Date().toISOString()
    };
  });

  const [currentSession, setCurrentSession] = useState({
    startTime: Date.now(),
    mode: null,
    wordsAttempted: 0,
    wordsCorrect: 0,
    activities: []
  });

  // Save progress data to localStorage
  useEffect(() => {
    localStorage.setItem('liamProgressData', JSON.stringify(progressData));
  }, [progressData]);

  // Start a new session
  const startSession = (mode) => {
    setCurrentSession({
      startTime: Date.now(),
      mode,
      wordsAttempted: 0,
      wordsCorrect: 0,
      activities: []
    });
  };

  // Log word attempt
  const logWordAttempt = (word, isCorrect, mode, difficulty = null) => {
    const timestamp = Date.now();
    const today = new Date().toDateString();
    
    setProgressData(prev => {
      const newData = { ...prev };
      
      // Update totals
      newData.totalWordsAttempted++;
      if (isCorrect) newData.totalWordsCorrect++;
      
      // Update mode stats
      if (!newData.modeStats[mode]) {
        newData.modeStats[mode] = { attempts: 0, correct: 0, timeSpent: 0 };
      }
      newData.modeStats[mode].attempts++;
      if (isCorrect) newData.modeStats[mode].correct++;
      
      // Track difficulty progression for Fill Blanks
      if (mode === 'fillBlanks' && difficulty) {
        newData.modeStats[mode].difficultyProgression.push({
          timestamp,
          difficulty,
          word,
          correct: isCorrect
        });
      }
      
      // Update word-specific stats
      if (!newData.wordStats[word]) {
        newData.wordStats[word] = { attempts: 0, correct: 0, lastAttempt: null };
      }
      newData.wordStats[word].attempts++;
      if (isCorrect) newData.wordStats[word].correct++;
      newData.wordStats[word].lastAttempt = timestamp;
      
      // Update daily stats
      if (!newData.dailyStats[today]) {
        newData.dailyStats[today] = { 
          attempts: 0, 
          correct: 0, 
          timeSpent: 0, 
          modesUsed: new Set() 
        };
      }
      newData.dailyStats[today].attempts++;
      if (isCorrect) newData.dailyStats[today].correct++;
      newData.dailyStats[today].modesUsed.add(mode);
      
      return newData;
    });

    // Update current session
    setCurrentSession(prev => ({
      ...prev,
      wordsAttempted: prev.wordsAttempted + 1,
      wordsCorrect: prev.wordsCorrect + (isCorrect ? 1 : 0),
      activities: [...prev.activities, {
        timestamp,
        word,
        isCorrect,
        mode,
        difficulty
      }]
    }));
  };

  // End current session
  const endSession = () => {
    const sessionDuration = Date.now() - currentSession.startTime;
    const today = new Date().toDateString();
    
    setProgressData(prev => {
      const newData = { ...prev };
      
      // Add session to history
      newData.sessions.push({
        ...currentSession,
        endTime: Date.now(),
        duration: sessionDuration
      });
      
      // Update total time spent
      newData.timeSpent += sessionDuration;
      
      // Update mode time spent
      if (currentSession.mode && newData.modeStats[currentSession.mode]) {
        newData.modeStats[currentSession.mode].timeSpent += sessionDuration;
      }
      
      // Update daily time spent
      if (newData.dailyStats[today]) {
        newData.dailyStats[today].timeSpent += sessionDuration;
      }
      
      return newData;
    });

    // Reset current session
    setCurrentSession({
      startTime: Date.now(),
      mode: null,
      wordsAttempted: 0,
      wordsCorrect: 0,
      activities: []
    });
  };

  // Generate progress report
  const generateReport = (timeframe = 'week') => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setFullYear(2000); // All time
    }
    
    const relevantSessions = progressData.sessions.filter(
      session => new Date(session.startTime) >= startDate
    );
    
    const report = {
      timeframe,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      summary: {
        totalSessions: relevantSessions.length,
        totalTimeSpent: relevantSessions.reduce((sum, s) => sum + s.duration, 0),
        totalWordsAttempted: relevantSessions.reduce((sum, s) => sum + s.wordsAttempted, 0),
        totalWordsCorrect: relevantSessions.reduce((sum, s) => sum + s.wordsCorrect, 0),
        averageAccuracy: 0
      },
      modeBreakdown: {},
      wordPerformance: {},
      difficultyProgression: [],
      recommendations: []
    };
    
    // Calculate accuracy
    if (report.summary.totalWordsAttempted > 0) {
      report.summary.averageAccuracy = 
        (report.summary.totalWordsCorrect / report.summary.totalWordsAttempted) * 100;
    }
    
    // Mode breakdown
    relevantSessions.forEach(session => {
      if (!report.modeBreakdown[session.mode]) {
        report.modeBreakdown[session.mode] = {
          sessions: 0,
          timeSpent: 0,
          wordsAttempted: 0,
          wordsCorrect: 0,
          accuracy: 0
        };
      }
      const mode = report.modeBreakdown[session.mode];
      mode.sessions++;
      mode.timeSpent += session.duration;
      mode.wordsAttempted += session.wordsAttempted;
      mode.wordsCorrect += session.wordsCorrect;
      mode.accuracy = mode.wordsAttempted > 0 ? (mode.wordsCorrect / mode.wordsAttempted) * 100 : 0;
    });
    
    // Word performance analysis
    Object.entries(progressData.wordStats).forEach(([word, stats]) => {
      if (stats.lastAttempt && new Date(stats.lastAttempt) >= startDate) {
        report.wordPerformance[word] = {
          attempts: stats.attempts,
          correct: stats.correct,
          accuracy: (stats.correct / stats.attempts) * 100,
          needsWork: (stats.correct / stats.attempts) < 0.7
        };
      }
    });
    
    // Generate recommendations
    if (report.summary.averageAccuracy < 70) {
      report.recommendations.push("Consider spending more time in Learn Mode to reinforce word recognition");
    }
    if (report.modeBreakdown.fillBlanks && report.modeBreakdown.fillBlanks.accuracy < 60) {
      report.recommendations.push("Fill Blanks mode shows room for improvement - practice letter patterns");
    }
    
    const strugglingWords = Object.entries(report.wordPerformance)
      .filter(([_, stats]) => stats.needsWork)
      .map(([word, _]) => word);
    
    if (strugglingWords.length > 0) {
      report.recommendations.push(`Focus on these challenging words: ${strugglingWords.slice(0, 5).join(', ')}`);
    }
    
    return report;
  };

  // Export data as CSV
  const exportToCSV = () => {
    const headers = [
      'Date', 'Mode', 'Word', 'Correct', 'Difficulty', 'Session Duration (ms)'
    ];
    
    const rows = progressData.sessions.flatMap(session => 
      session.activities.map(activity => [
        new Date(activity.timestamp).toLocaleDateString(),
        session.mode,
        activity.word,
        activity.isCorrect ? 'Yes' : 'No',
        activity.difficulty || 'N/A',
        session.duration
      ])
    );
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csvContent;
  };

  // Clear all data (for privacy)
  const clearAllData = () => {
    const emptyData = {
      sessions: [],
      totalWordsAttempted: 0,
      totalWordsCorrect: 0,
      timeSpent: 0,
      modeStats: {
        learn: { attempts: 0, timeSpent: 0 },
        copy: { attempts: 0, correct: 0, timeSpent: 0 },
        fillBlanks: { attempts: 0, correct: 0, timeSpent: 0, difficultyProgression: [] },
        test: { attempts: 0, correct: 0, timeSpent: 0 }
      },
      wordStats: {},
      dailyStats: {},
      createdAt: new Date().toISOString()
    };
    setProgressData(emptyData);
    localStorage.removeItem('liamProgressData');
  };

  return {
    progressData,
    currentSession,
    startSession,
    endSession,
    logWordAttempt,
    generateReport,
    exportToCSV,
    clearAllData
  };
}

