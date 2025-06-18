import { useState, useEffect } from 'react';

// Google Sheets integration for automatic progress sharing
export function useGoogleSheetsIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [sheetId, setSheetId] = useState(localStorage.getItem('googleSheetId') || '');
  const [therapistEmail, setTherapistEmail] = useState(localStorage.getItem('therapistEmail') || '');
  const [lastSync, setLastSync] = useState(localStorage.getItem('lastGoogleSync') || null);

  // Initialize Google Sheets API
  const initializeGoogleAPI = async () => {
    try {
      // Load Google API script
      if (!window.gapi) {
        await loadGoogleAPI();
      }

      await window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-client-id-here'
        });
      });

      await window.gapi.load('client', () => {
        window.gapi.client.init({
          apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'your-api-key-here',
          clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-client-id-here',
          discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
          scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
        });
      });

      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize Google API:', error);
      return false;
    }
  };

  // Load Google API script dynamically
  const loadGoogleAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve(window.gapi);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve(window.gapi);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Authenticate with Google
  const authenticateGoogle = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      return user.isSignedIn();
    } catch (error) {
      console.error('Google authentication failed:', error);
      return false;
    }
  };

  // Create a new Google Sheet for progress tracking
  const createProgressSheet = async () => {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.create({
        properties: {
          title: `Liam's Spelling Progress - ${new Date().toLocaleDateString()}`
        },
        sheets: [
          {
            properties: {
              title: 'Daily Progress',
              gridProperties: {
                rowCount: 1000,
                columnCount: 10
              }
            }
          },
          {
            properties: {
              title: 'Word Performance',
              gridProperties: {
                rowCount: 1000,
                columnCount: 8
              }
            }
          },
          {
            properties: {
              title: 'Session Summary',
              gridProperties: {
                rowCount: 1000,
                columnCount: 12
              }
            }
          }
        ]
      });

      const newSheetId = response.result.spreadsheetId;
      setSheetId(newSheetId);
      localStorage.setItem('googleSheetId', newSheetId);

      // Set up headers
      await setupSheetHeaders(newSheetId);
      
      // Share with therapist if email provided
      if (therapistEmail) {
        await shareSheetWithTherapist(newSheetId, therapistEmail);
      }

      return newSheetId;
    } catch (error) {
      console.error('Failed to create Google Sheet:', error);
      return null;
    }
  };

  // Set up headers for the progress sheets
  const setupSheetHeaders = async (spreadsheetId) => {
    const requests = [
      // Daily Progress headers
      {
        updateCells: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 10
          },
          rows: [{
            values: [
              { userEnteredValue: { stringValue: 'Date' } },
              { userEnteredValue: { stringValue: 'Mode' } },
              { userEnteredValue: { stringValue: 'Words Attempted' } },
              { userEnteredValue: { stringValue: 'Words Correct' } },
              { userEnteredValue: { stringValue: 'Accuracy %' } },
              { userEnteredValue: { stringValue: 'Time Spent (min)' } },
              { userEnteredValue: { stringValue: 'Difficulty Level' } },
              { userEnteredValue: { stringValue: 'Session Duration (min)' } },
              { userEnteredValue: { stringValue: 'Notes' } },
              { userEnteredValue: { stringValue: 'Timestamp' } }
            ]
          }],
          fields: 'userEnteredValue'
        }
      },
      // Word Performance headers
      {
        updateCells: {
          range: {
            sheetId: 1,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 8
          },
          rows: [{
            values: [
              { userEnteredValue: { stringValue: 'Word' } },
              { userEnteredValue: { stringValue: 'Total Attempts' } },
              { userEnteredValue: { stringValue: 'Correct Attempts' } },
              { userEnteredValue: { stringValue: 'Accuracy %' } },
              { userEnteredValue: { stringValue: 'Last Attempted' } },
              { userEnteredValue: { stringValue: 'Needs Work' } },
              { userEnteredValue: { stringValue: 'Mode Used' } },
              { userEnteredValue: { stringValue: 'Notes' } }
            ]
          }],
          fields: 'userEnteredValue'
        }
      },
      // Session Summary headers
      {
        updateCells: {
          range: {
            sheetId: 2,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 12
          },
          rows: [{
            values: [
              { userEnteredValue: { stringValue: 'Session Date' } },
              { userEnteredValue: { stringValue: 'Start Time' } },
              { userEnteredValue: { stringValue: 'End Time' } },
              { userEnteredValue: { stringValue: 'Duration (min)' } },
              { userEnteredValue: { stringValue: 'Primary Mode' } },
              { userEnteredValue: { stringValue: 'Words Attempted' } },
              { userEnteredValue: { stringValue: 'Words Correct' } },
              { userEnteredValue: { stringValue: 'Overall Accuracy %' } },
              { userEnteredValue: { stringValue: 'Modes Used' } },
              { userEnteredValue: { stringValue: 'Difficulty Progression' } },
              { userEnteredValue: { stringValue: 'Engagement Level' } },
              { userEnteredValue: { stringValue: 'Therapist Notes' } }
            ]
          }],
          fields: 'userEnteredValue'
        }
      }
    ];

    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requests
    });
  };

  // Share sheet with therapist
  const shareSheetWithTherapist = async (spreadsheetId, email) => {
    try {
      await window.gapi.client.request({
        path: `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`,
        method: 'POST',
        body: {
          role: 'writer',
          type: 'user',
          emailAddress: email
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to share sheet with therapist:', error);
      return false;
    }
  };

  // Sync progress data to Google Sheets
  const syncProgressData = async (progressData) => {
    if (!sheetId || !isConnected) {
      console.warn('Google Sheets not connected or sheet ID missing');
      return false;
    }

    try {
      // Prepare daily progress data
      const dailyData = Object.entries(progressData.dailyStats).map(([date, stats]) => [
        date,
        Array.from(stats.modesUsed).join(', '),
        stats.attempts,
        stats.correct,
        stats.attempts > 0 ? ((stats.correct / stats.attempts) * 100).toFixed(1) : '0',
        Math.round(stats.timeSpent / 60000),
        '', // Difficulty level (calculated separately)
        Math.round(stats.timeSpent / 60000),
        '', // Notes
        new Date().toISOString()
      ]);

      // Prepare word performance data
      const wordData = Object.entries(progressData.wordStats).map(([word, stats]) => [
        word,
        stats.attempts,
        stats.correct,
        ((stats.correct / stats.attempts) * 100).toFixed(1),
        new Date(stats.lastAttempt).toLocaleDateString(),
        (stats.correct / stats.attempts) < 0.7 ? 'Yes' : 'No',
        '', // Mode used (would need to track this)
        ''  // Notes
      ]);

      // Prepare session summary data
      const sessionData = progressData.sessions.slice(-10).map(session => [
        new Date(session.startTime).toLocaleDateString(),
        new Date(session.startTime).toLocaleTimeString(),
        new Date(session.endTime).toLocaleTimeString(),
        Math.round(session.duration / 60000),
        session.mode,
        session.wordsAttempted,
        session.wordsCorrect,
        session.wordsAttempted > 0 ? ((session.wordsCorrect / session.wordsAttempted) * 100).toFixed(1) : '0',
        session.mode,
        '', // Difficulty progression
        'Good', // Engagement level (could be calculated)
        '' // Therapist notes
      ]);

      // Update sheets
      const requests = [];

      if (dailyData.length > 0) {
        requests.push({
          updateCells: {
            range: {
              sheetId: 0,
              startRowIndex: 1,
              endRowIndex: 1 + dailyData.length,
              startColumnIndex: 0,
              endColumnIndex: 10
            },
            rows: dailyData.map(row => ({
              values: row.map(cell => ({ userEnteredValue: { stringValue: String(cell) } }))
            })),
            fields: 'userEnteredValue'
          }
        });
      }

      if (wordData.length > 0) {
        requests.push({
          updateCells: {
            range: {
              sheetId: 1,
              startRowIndex: 1,
              endRowIndex: 1 + wordData.length,
              startColumnIndex: 0,
              endColumnIndex: 8
            },
            rows: wordData.map(row => ({
              values: row.map(cell => ({ userEnteredValue: { stringValue: String(cell) } }))
            })),
            fields: 'userEnteredValue'
          }
        });
      }

      if (sessionData.length > 0) {
        requests.push({
          updateCells: {
            range: {
              sheetId: 2,
              startRowIndex: 1,
              endRowIndex: 1 + sessionData.length,
              startColumnIndex: 0,
              endColumnIndex: 12
            },
            rows: sessionData.map(row => ({
              values: row.map(cell => ({ userEnteredValue: { stringValue: String(cell) } }))
            })),
            fields: 'userEnteredValue'
          }
        });
      }

      if (requests.length > 0) {
        await window.gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          requests
        });

        setLastSync(new Date().toISOString());
        localStorage.setItem('lastGoogleSync', new Date().toISOString());
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to sync data to Google Sheets:', error);
      return false;
    }
  };

  // Set therapist email
  const setTherapistEmailAddress = (email) => {
    setTherapistEmail(email);
    localStorage.setItem('therapistEmail', email);
  };

  // Auto-sync functionality
  const enableAutoSync = (progressData) => {
    const syncInterval = setInterval(async () => {
      if (isConnected && sheetId) {
        await syncProgressData(progressData);
      }
    }, 5 * 60 * 1000); // Sync every 5 minutes

    return () => clearInterval(syncInterval);
  };

  return {
    isConnected,
    sheetId,
    therapistEmail,
    lastSync,
    initializeGoogleAPI,
    authenticateGoogle,
    createProgressSheet,
    syncProgressData,
    setTherapistEmailAddress,
    enableAutoSync,
    shareSheetWithTherapist
  };
}

