import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Calendar, Clock, TrendingUp, Award, BookOpen, 
  Target, MessageSquare, Download, LogOut, User,
  CheckCircle, AlertCircle, Activity, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const TherapistDashboard = ({ 
  progressData, 
  onLogout, 
  therapistInfo, 
  onAddNote,
  onExtendSession,
  sessionTimeRemaining 
}) => {
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [notes, setNotes] = useState([]);

  // Load therapist notes
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('therapistNotes') || '[]');
    setNotes(savedNotes);
  }, []);

  // Calculate key metrics
  const calculateMetrics = () => {
    const totalSessions = progressData.sessions.length;
    const totalWords = Object.keys(progressData.wordStats).length;
    const totalAttempts = Object.values(progressData.wordStats).reduce((sum, word) => sum + word.attempts, 0);
    const totalCorrect = Object.values(progressData.wordStats).reduce((sum, word) => sum + word.correct, 0);
    const overallAccuracy = totalAttempts > 0 ? ((totalCorrect / totalAttempts) * 100).toFixed(1) : 0;
    
    const recentSessions = progressData.sessions.slice(-7);
    const recentAccuracy = recentSessions.length > 0 ? 
      recentSessions.reduce((sum, session) => {
        return sum + (session.wordsAttempted > 0 ? (session.wordsCorrect / session.wordsAttempted) * 100 : 0);
      }, 0) / recentSessions.length : 0;

    const masteredWords = Object.values(progressData.wordStats).filter(word => 
      word.attempts >= 3 && (word.correct / word.attempts) >= 0.9
    ).length;

    const strugglingWords = Object.values(progressData.wordStats).filter(word => 
      word.attempts >= 3 && (word.correct / word.attempts) < 0.5
    ).length;

    return {
      totalSessions,
      totalWords,
      overallAccuracy,
      recentAccuracy,
      masteredWords,
      strugglingWords,
      totalAttempts,
      totalCorrect
    };
  };

  // Prepare chart data
  const prepareChartData = () => {
    const dailyData = Object.entries(progressData.dailyStats).map(([date, stats]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      accuracy: stats.attempts > 0 ? ((stats.correct / stats.attempts) * 100).toFixed(1) : 0,
      attempts: stats.attempts,
      timeSpent: Math.round(stats.timeSpent / 60000) // Convert to minutes
    })).slice(-14); // Last 14 days

    const wordPerformanceData = Object.entries(progressData.wordStats)
      .map(([word, stats]) => ({
        word,
        accuracy: ((stats.correct / stats.attempts) * 100).toFixed(1),
        attempts: stats.attempts,
        needsWork: (stats.correct / stats.attempts) < 0.7
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10); // Top 10 challenging words

    const modeUsageData = [
      { name: 'Learn Mode', value: 25, color: '#3B82F6' },
      { name: 'Copy Mode', value: 35, color: '#8B5CF6' },
      { name: 'Fill Blanks', value: 30, color: '#F59E0B' },
      { name: 'Test Mode', value: 10, color: '#EF4444' }
    ];

    return { dailyData, wordPerformanceData, modeUsageData };
  };

  const metrics = calculateMetrics();
  const chartData = prepareChartData();

  // Format session time remaining
  const formatTimeRemaining = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Add therapist note
  const handleAddNote = (noteText) => {
    const newNote = {
      id: Date.now(),
      text: noteText,
      timestamp: new Date().toISOString(),
      therapistName: therapistInfo.name,
      type: 'observation'
    };
    
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem('therapistNotes', JSON.stringify(updatedNotes));
    onAddNote(newNote);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">Therapist Dashboard</h1>
              </div>
              <div className="text-sm text-gray-500">
                Liam's Spelling Progress
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Session info */}
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{therapistInfo.name}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="h-4 w-4" />
                  <span>Session: {formatTimeRemaining(sessionTimeRemaining)}</span>
                </div>
              </div>
              
              {/* Extend session button */}
              {sessionTimeRemaining < (60 * 60 * 1000) && (
                <Button
                  onClick={onExtendSession}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  Extend Session
                </Button>
              )}
              
              {/* Logout button */}
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'progress', label: 'Progress Tracking', icon: TrendingUp },
              { id: 'words', label: 'Word Analysis', icon: BookOpen },
              { id: 'sessions', label: 'Session Details', icon: Calendar },
              { id: 'notes', label: 'Notes & Observations', icon: MessageSquare }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedView(id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  selectedView === id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-3xl font-bold text-gray-900">{metrics.totalSessions}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overall Accuracy</p>
                    <p className="text-3xl font-bold text-gray-900">{metrics.overallAccuracy}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Words Mastered</p>
                    <p className="text-3xl font-bold text-gray-900">{metrics.masteredWords}</p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Needs Practice</p>
                    <p className="text-3xl font-bold text-gray-900">{metrics.strugglingWords}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Progress Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Mode Usage Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Mode Usage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.modeUsageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {chartData.modeUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {metrics.masteredWords > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-800">Mastered {metrics.masteredWords} words with 90%+ accuracy</span>
                  </div>
                )}
                {metrics.recentAccuracy > 75 && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span className="text-blue-800">Recent accuracy improved to {metrics.recentAccuracy.toFixed(1)}%</span>
                  </div>
                )}
                {metrics.totalSessions >= 10 && (
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Award className="h-5 w-5 text-purple-500" />
                    <span className="text-purple-800">Completed {metrics.totalSessions} practice sessions</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other views would be implemented similarly */}
        {selectedView === 'notes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Observation</h3>
              <div className="space-y-4">
                <textarea
                  placeholder="Enter your observations about Liam's progress, behavior, or recommendations..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                  id="newNote"
                />
                <Button
                  onClick={() => {
                    const noteText = document.getElementById('newNote').value;
                    if (noteText.trim()) {
                      handleAddNote(noteText);
                      document.getElementById('newNote').value = '';
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Note
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Notes</h3>
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <p className="text-gray-500 italic">No notes yet. Add your first observation above.</p>
                ) : (
                  notes.slice().reverse().map((note) => (
                    <div key={note.id} className="border-l-4 border-indigo-400 pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-indigo-600">{note.therapistName}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(note.timestamp).toLocaleDateString()} at {new Date(note.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-800">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistDashboard;

