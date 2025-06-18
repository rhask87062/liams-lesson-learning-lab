import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Download, Mail, FileText, BarChart3, Calendar, Home, Lock, LockOpen, CheckCircle } from 'lucide-react';
import LessonSettings from '@/components/LessonSettings';

export function ProgressDashboard({ 
  progressData, 
  generateReport, 
  exportToCSV, 
  clearAllData,
  onHome,
  onLock,
  isNavigationLocked,
  handleTherapistDashboard,
  onWordListManager
}) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [showReport, setShowReport] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [activeTab, setActiveTab] = useState('statistics');

  const handleGenerateReport = () => {
    const report = generateReport(selectedTimeframe);
    setCurrentReport(report);
    setShowReport(true);
  };

  const handleExportCSV = () => {
    const csvData = exportToCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liam-spelling-progress-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleEmailReport = () => {
    if (!currentReport) return;
    
    const subject = `Liam's Spelling Progress Report - ${currentReport.timeframe}`;
    const body = `
Progress Report Summary:
- Time Period: ${new Date(currentReport.startDate).toLocaleDateString()} to ${new Date(currentReport.endDate).toLocaleDateString()}
- Total Sessions: ${currentReport.summary.totalSessions}
- Words Attempted: ${currentReport.summary.totalWordsAttempted}
- Words Correct: ${currentReport.summary.totalWordsCorrect}
- Average Accuracy: ${currentReport.summary.averageAccuracy.toFixed(1)}%
- Total Time Spent: ${Math.round(currentReport.summary.totalTimeSpent / 60000)} minutes

Mode Performance:
${Object.entries(currentReport.modeBreakdown).map(([mode, stats]) => 
  `- ${mode}: ${stats.accuracy.toFixed(1)}% accuracy (${stats.wordsCorrect}/${stats.wordsAttempted} words)`
).join('\n')}

Recommendations:
${currentReport.recommendations.map(rec => `- ${rec}`).join('\n')}

This report was generated automatically by Liam's Spelling App.
    `.trim();
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatAccuracy = (correct, total) => {
    if (total === 0) return '0%';
    return `${((correct / total) * 100).toFixed(1)}%`;
  };

  if (showReport && currentReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => setShowReport(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 text-lg"
          >
            ← Back to Dashboard
          </Button>
        </div>
        
        <div className="fixed bottom-4 right-4 z-50 flex gap-2">
          <Button
            onClick={onLock}
            className={`px-4 py-2 ${isNavigationLocked ? 'bg-orange-500/70 hover:bg-orange-600/70' : 'bg-gray-500/70 hover:bg-gray-600/70'} text-white border-0`}
            title={isNavigationLocked ? "Unlock Navigation (Ctrl+L)" : "Lock Navigation (Ctrl+L)"}
          >
            {isNavigationLocked ? <Lock size={20} /> : <LockOpen size={20} />}
          </Button>
          <Button
            onClick={onHome}
            className="bg-green-500/70 hover:bg-green-600/70 text-white px-4 py-2 border-0"
            title="Home (Ctrl+Shift+H)"
          >
            <Home size={20} />
          </Button>
        </div>

        {/* Report Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📊 Liam's Spelling Progress Report
            </h1>
            <p className="text-gray-600">
              {new Date(currentReport.startDate).toLocaleDateString()} to {new Date(currentReport.endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{currentReport.summary.totalSessions}</div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatAccuracy(currentReport.summary.totalWordsCorrect, currentReport.summary.totalWordsAttempted)}
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{currentReport.summary.totalWordsAttempted}</div>
              <div className="text-sm text-gray-600">Words Attempted</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(currentReport.summary.totalTimeSpent)}
              </div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
          </div>

          {/* Mode Performance */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📚 Mode Performance</h2>
            <div className="space-y-3">
              {Object.entries(currentReport.modeBreakdown).map(([mode, stats]) => (
                <div key={mode} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold capitalize">{mode} Mode</span>
                    <span className="text-lg font-bold">{formatAccuracy(stats.wordsCorrect, stats.wordsAttempted)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {stats.wordsCorrect}/{stats.wordsAttempted} words correct • {stats.sessions} sessions • {formatTime(stats.timeSpent)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Challenging Words */}
          {Object.keys(currentReport.wordPerformance).length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 Word Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(currentReport.wordPerformance)
                  .sort(([,a], [,b]) => a.accuracy - b.accuracy)
                  .slice(0, 9)
                  .map(([word, stats]) => (
                    <div key={word} className={`p-3 rounded-lg ${stats.needsWork ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                      <div className="font-semibold">{word}</div>
                      <div className="text-sm text-gray-600">
                        {formatAccuracy(stats.correct, stats.attempts)} ({stats.correct}/{stats.attempts})
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {currentReport.recommendations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">💡 Recommendations</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {currentReport.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Export Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleEmailReport}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3"
            >
              <Mail size={20} className="mr-2" />
              Email to Therapist
            </Button>
            <Button
              onClick={handleExportCSV}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
            >
              <Download size={20} className="mr-2" />
              Export CSV Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 Progress Dashboard</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="flex p-1 bg-gray-200 rounded-lg">
            <Button
              onClick={() => setActiveTab('statistics')}
              className={`px-6 py-2 transition-colors duration-300 ${activeTab === 'statistics' ? 'bg-white text-blue-600 shadow rounded-md' : 'bg-transparent text-gray-600'}`}
            >
              Statistics
            </Button>
            <Button
              onClick={() => setActiveTab('lessons')}
              className={`px-6 py-2 transition-colors duration-300 ${activeTab === 'lessons' ? 'bg-white text-blue-600 shadow rounded-md' : 'bg-transparent text-gray-600'}`}
            >
              Lessons
            </Button>
          </div>
        </div>

        {activeTab === 'statistics' ? (
          <div>
            {/* Stats Content Here */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Progress at a Glance 🚀</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 <div className="bg-indigo-50 p-6 rounded-xl shadow-md flex items-center justify-between">
                   <div className="text-left">
                     <p className="text-sm text-gray-500">Total Sessions</p>
                     <p className="text-3xl font-bold text-indigo-700">{progressData.totalSessions}</p>
                   </div>
                   <BarChart3 className="text-indigo-400" size={48} />
                 </div>
                 <div className="bg-purple-50 p-6 rounded-xl shadow-md flex items-center justify-between">
                   <div className="text-left">
                     <p className="text-sm text-gray-500">Words Attempted</p>
                     <p className="text-3xl font-bold text-purple-700">{progressData.totalWordsAttempted}</p>
                   </div>
                   <FileText className="text-purple-400" size={48} />
                 </div>
                 <div className="bg-green-50 p-6 rounded-xl shadow-md flex items-center justify-between">
                   <div className="text-left">
                     <p className="text-sm text-gray-500">Words Correct</p>
                     <p className="text-3xl font-bold text-green-700">{progressData.totalWordsCorrect}</p>
                   </div>
                   <CheckCircle className="text-green-400" size={48} />
                 </div>
                 <div className="bg-yellow-50 p-6 rounded-xl shadow-md flex items-center justify-between">
                   <div className="text-left">
                     <p className="text-sm text-gray-500">Time Spent</p>
                     <p className="text-3xl font-bold text-yellow-700">{formatTime(progressData.timeSpent)}</p>
                   </div>
                   <Calendar className="text-yellow-400" size={48} />
                 </div>
               </div>
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button 
                  onClick={handleGenerateReport} 
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  <Download className="mr-2" size={20} /> Generate Detailed Report
                </Button>
                <Button 
                  onClick={handleExportCSV}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  <FileText className="mr-2" size={20} /> Export CSV
                </Button>
              </div>
              {/* Future home for Therapist Dashboard button if needed */}
            </div>
          </div>
        ) : (
          <LessonSettings onWordListManager={onWordListManager} />
        )}
      </div>
      
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <Button
          onClick={onLock}
          className={`px-4 py-2 ${isNavigationLocked ? 'bg-orange-500/70 hover:bg-orange-600/70' : 'bg-gray-500/70 hover:bg-gray-600/70'} text-white border-0`}
          title={isNavigationLocked ? "Unlock Navigation (Ctrl+L)" : "Lock Navigation (Ctrl+L)"}
        >
          {isNavigationLocked ? <Lock size={20} /> : <LockOpen size={20} />}
        </Button>
        <Button
          onClick={onHome}
          className="bg-green-500/70 hover:bg-green-600/70 text-white px-4 py-2 border-0"
          title="Home (Ctrl+Shift+H)"
        >
          <Home size={20} />
        </Button>
      </div>
    </div>
  );
}

export default ProgressDashboard;

