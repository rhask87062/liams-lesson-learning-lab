// Google Sheets API integration using browser-based Google APIs
export class GoogleSheetsAPI {
  constructor() {
    this.isInitialized = false;
    this.isAuthenticated = false;
    this.spreadsheetId = localStorage.getItem('therapistSpreadsheetId') || null;
    this.therapistEmail = localStorage.getItem('therapistEmail') || '';
  }

  // Initialize Google API
  async initialize() {
    try {
      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      // Initialize the API
      await new Promise((resolve, reject) => {
        window.gapi.load('client:auth2', {
          callback: resolve,
          onerror: reject
        });
      });

      // Initialize the client
      await window.gapi.client.init({
        apiKey: 'AIzaSyBvOkBwNzwC8ODdt2_Vc8W_Hs1cxs6Y5_8', // Public API key for Sheets
        clientId: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // OAuth client ID
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
      });

      this.isInitialized = true;
      
      // Check if user is already signed in
      const authInstance = window.gapi.auth2.getAuthInstance();
      this.isAuthenticated = authInstance.isSignedIn.get();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Google API:', error);
      return false;
    }
  }

  // Load Google API script
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Authenticate user
  async authenticate() {
    if (!this.isInitialized) {
      throw new Error('Google API not initialized');
    }

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      this.isAuthenticated = user.isSignedIn();
      return this.isAuthenticated;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  // Create a new spreadsheet for progress tracking
  async createProgressSpreadsheet() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with Google');
    }

    try {
      const response = await window.gapi.client.sheets.spreadsheets.create({
        properties: {
          title: `Liam's Spelling Progress - ${new Date().toLocaleDateString()}`
        },
        sheets: [
          {
            properties: {
              title: 'Daily Progress',
              gridProperties: { rowCount: 1000, columnCount: 15 }
            }
          },
          {
            properties: {
              title: 'Word Performance',
              gridProperties: { rowCount: 1000, columnCount: 10 }
            }
          },
          {
            properties: {
              title: 'Session Details',
              gridProperties: { rowCount: 1000, columnCount: 12 }
            }
          },
          {
            properties: {
              title: 'Weekly Summary',
              gridProperties: { rowCount: 100, columnCount: 8 }
            }
          }
        ]
      });

      this.spreadsheetId = response.result.spreadsheetId;
      localStorage.setItem('therapistSpreadsheetId', this.spreadsheetId);

      // Set up headers and formatting
      await this.setupSpreadsheetHeaders();
      
      // Share with therapist if email is provided
      if (this.therapistEmail) {
        await this.shareWithTherapist(this.therapistEmail);
      }

      return {
        spreadsheetId: this.spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`
      };
    } catch (error) {
      console.error('Failed to create spreadsheet:', error);
      throw error;
    }
  }

  // Set up headers and formatting for all sheets
  async setupSpreadsheetHeaders() {
    const requests = [
      // Daily Progress sheet headers
      {
        updateCells: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 15
          },
          rows: [{
            values: [
              { userEnteredValue: { stringValue: 'Date' } },
              { userEnteredValue: { stringValue: 'Day of Week' } },
              { userEnteredValue: { stringValue: 'Session Count' } },
              { userEnteredValue: { stringValue: 'Total Time (min)' } },
              { userEnteredValue: { stringValue: 'Words Attempted' } },
              { userEnteredValue: { stringValue: 'Words Correct' } },
              { userEnteredValue: { stringValue: 'Accuracy %' } },
              { userEnteredValue: { stringValue: 'Learn Mode Time' } },
              { userEnteredValue: { stringValue: 'Copy Mode Time' } },
              { userEnteredValue: { stringValue: 'Fill Blanks Time' } },
              { userEnteredValue: { stringValue: 'Test Mode Time' } },
              { userEnteredValue: { stringValue: 'Highest Difficulty' } },
              { userEnteredValue: { stringValue: 'Engagement Level' } },
              { userEnteredValue: { stringValue: 'Notes' } },
              { userEnteredValue: { stringValue: 'Last Updated' } }
            ].map(cell => ({
              ...cell,
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.6, blue: 1.0 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            }))
          }],
          fields: 'userEnteredValue,userEnteredFormat'
        }
      },
      // Word Performance sheet headers
      {
        updateCells: {
          range: {
            sheetId: 1,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 10
          },
          rows: [{
            values: [
              { userEnteredValue: { stringValue: 'Word' } },
              { userEnteredValue: { stringValue: 'Category' } },
              { userEnteredValue: { stringValue: 'Total Attempts' } },
              { userEnteredValue: { stringValue: 'Correct Attempts' } },
              { userEnteredValue: { stringValue: 'Accuracy %' } },
              { userEnteredValue: { stringValue: 'First Attempt Date' } },
              { userEnteredValue: { stringValue: 'Last Attempt Date' } },
              { userEnteredValue: { stringValue: 'Needs Practice' } },
              { userEnteredValue: { stringValue: 'Preferred Mode' } },
              { userEnteredValue: { stringValue: 'Progress Trend' } }
            ].map(cell => ({
              ...cell,
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.8, blue: 0.2 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            }))
          }],
          fields: 'userEnteredValue,userEnteredFormat'
        }
      },
      // Session Details sheet headers
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
              { userEnteredValue: { stringValue: 'Session ID' } },
              { userEnteredValue: { stringValue: 'Date' } },
              { userEnteredValue: { stringValue: 'Start Time' } },
              { userEnteredValue: { stringValue: 'End Time' } },
              { userEnteredValue: { stringValue: 'Duration (min)' } },
              { userEnteredValue: { stringValue: 'Primary Mode' } },
              { userEnteredValue: { stringValue: 'Words Attempted' } },
              { userEnteredValue: { stringValue: 'Words Correct' } },
              { userEnteredValue: { stringValue: 'Accuracy %' } },
              { userEnteredValue: { stringValue: 'Difficulty Reached' } },
              { userEnteredValue: { stringValue: 'Modes Used' } },
              { userEnteredValue: { stringValue: 'Session Quality' } }
            ].map(cell => ({
              ...cell,
              userEnteredFormat: {
                backgroundColor: { red: 0.8, green: 0.4, blue: 0.8 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            }))
          }],
          fields: 'userEnteredValue,userEnteredFormat'
        }
      },
      // Weekly Summary sheet headers
      {
        updateCells: {
          range: {
            sheetId: 3,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 8
          },
          rows: [{
            values: [
              { userEnteredValue: { stringValue: 'Week Starting' } },
              { userEnteredValue: { stringValue: 'Total Sessions' } },
              { userEnteredValue: { stringValue: 'Total Time (hours)' } },
              { userEnteredValue: { stringValue: 'Words Mastered' } },
              { userEnteredValue: { stringValue: 'Overall Accuracy %' } },
              { userEnteredValue: { stringValue: 'Improvement Areas' } },
              { userEnteredValue: { stringValue: 'Achievements' } },
              { userEnteredValue: { stringValue: 'Therapist Notes' } }
            ].map(cell => ({
              ...cell,
              userEnteredFormat: {
                backgroundColor: { red: 1.0, green: 0.6, blue: 0.2 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            }))
          }],
          fields: 'userEnteredValue,userEnteredFormat'
        }
      }
    ];

    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requests
    });
  }

  // Share spreadsheet with therapist
  async shareWithTherapist(email) {
    try {
      // Use Drive API to share the spreadsheet
      await window.gapi.client.request({
        path: `https://www.googleapis.com/drive/v3/files/${this.spreadsheetId}/permissions`,
        method: 'POST',
        body: {
          role: 'writer',
          type: 'user',
          emailAddress: email,
          sendNotificationEmail: true,
          emailMessage: `Hi! I'm sharing Liam's spelling progress spreadsheet with you. This will automatically update with his daily practice data. You can view his progress, add notes, and track his improvement over time.`
        }
      });

      this.therapistEmail = email;
      localStorage.setItem('therapistEmail', email);
      return true;
    } catch (error) {
      console.error('Failed to share with therapist:', error);
      return false;
    }
  }

  // Sync progress data to spreadsheet
  async syncProgressData(progressData) {
    if (!this.spreadsheetId || !this.isAuthenticated) {
      throw new Error('Spreadsheet not set up or not authenticated');
    }

    try {
      const requests = [];

      // Sync daily progress data
      const dailyData = this.prepareDailyData(progressData);
      if (dailyData.length > 0) {
        requests.push({
          updateCells: {
            range: {
              sheetId: 0,
              startRowIndex: 1,
              endRowIndex: 1 + dailyData.length,
              startColumnIndex: 0,
              endColumnIndex: 15
            },
            rows: dailyData.map(row => ({
              values: row.map(cell => ({ userEnteredValue: { stringValue: String(cell) } }))
            })),
            fields: 'userEnteredValue'
          }
        });
      }

      // Sync word performance data
      const wordData = this.prepareWordData(progressData);
      if (wordData.length > 0) {
        requests.push({
          updateCells: {
            range: {
              sheetId: 1,
              startRowIndex: 1,
              endRowIndex: 1 + wordData.length,
              startColumnIndex: 0,
              endColumnIndex: 10
            },
            rows: wordData.map(row => ({
              values: row.map(cell => ({ userEnteredValue: { stringValue: String(cell) } }))
            })),
            fields: 'userEnteredValue'
          }
        });
      }

      // Sync session details
      const sessionData = this.prepareSessionData(progressData);
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
          spreadsheetId: this.spreadsheetId,
          requests
        });

        localStorage.setItem('lastGoogleSync', new Date().toISOString());
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to sync data:', error);
      throw error;
    }
  }

  // Prepare daily progress data for spreadsheet
  prepareDailyData(progressData) {
    return Object.entries(progressData.dailyStats).map(([date, stats]) => {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const accuracy = stats.attempts > 0 ? ((stats.correct / stats.attempts) * 100).toFixed(1) : '0';
      const totalTimeMin = Math.round(stats.timeSpent / 60000);
      
      return [
        date,
        dayOfWeek,
        '1', // Session count (simplified)
        totalTimeMin,
        stats.attempts,
        stats.correct,
        accuracy + '%',
        '', // Learn mode time (would need to track separately)
        '', // Copy mode time
        '', // Fill blanks time
        '', // Test mode time
        '', // Highest difficulty
        totalTimeMin > 10 ? 'High' : totalTimeMin > 5 ? 'Medium' : 'Low',
        '', // Notes
        new Date().toISOString()
      ];
    });
  }

  // Prepare word performance data for spreadsheet
  prepareWordData(progressData) {
    return Object.entries(progressData.wordStats).map(([word, stats]) => {
      const accuracy = ((stats.correct / stats.attempts) * 100).toFixed(1);
      const needsPractice = (stats.correct / stats.attempts) < 0.7 ? 'Yes' : 'No';
      const trend = stats.correct === stats.attempts ? 'Mastered' : 
                   accuracy > 70 ? 'Improving' : 'Needs Work';
      
      return [
        word,
        '', // Category (would need to add this to word database)
        stats.attempts,
        stats.correct,
        accuracy + '%',
        new Date(stats.lastAttempt).toLocaleDateString(),
        new Date(stats.lastAttempt).toLocaleDateString(),
        needsPractice,
        '', // Preferred mode
        trend
      ];
    });
  }

  // Prepare session data for spreadsheet
  prepareSessionData(progressData) {
    return progressData.sessions.slice(-20).map((session, index) => {
      const accuracy = session.wordsAttempted > 0 ? 
        ((session.wordsCorrect / session.wordsAttempted) * 100).toFixed(1) : '0';
      const durationMin = Math.round(session.duration / 60000);
      const quality = accuracy > 80 ? 'Excellent' : 
                     accuracy > 60 ? 'Good' : 
                     accuracy > 40 ? 'Fair' : 'Needs Support';
      
      return [
        `S${String(index + 1).padStart(3, '0')}`,
        new Date(session.startTime).toLocaleDateString(),
        new Date(session.startTime).toLocaleTimeString(),
        new Date(session.endTime).toLocaleTimeString(),
        durationMin,
        session.mode,
        session.wordsAttempted,
        session.wordsCorrect,
        accuracy + '%',
        '', // Difficulty reached
        session.mode,
        quality
      ];
    });
  }

  // Get spreadsheet URL
  getSpreadsheetUrl() {
    return this.spreadsheetId ? 
      `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit` : null;
  }
}

