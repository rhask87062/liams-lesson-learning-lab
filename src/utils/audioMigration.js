// Utility to migrate audio from base64 localStorage to files
export const migrateAudioToFiles = async () => {
  try {
    // Get custom word list from localStorage
    const customWordList = JSON.parse(localStorage.getItem('customWordList') || '[]');
    
    let migratedCount = 0;
    const updatedList = [];
    
    for (const word of customWordList) {
      let updatedWord = { ...word };
      
      // If audio is base64, convert to file path
      if (word.audioPath && word.audioPath.startsWith('data:')) {
        // For now, we'll keep base64 in localStorage but prepare the path
        // In a real implementation, this would save to server
        const audioFileName = `${word.word.replace(/\s+/g, '_')}.wav`;
        updatedWord.audioPath = `/audio/${audioFileName}`;
        migratedCount++;
        
        console.log(`Prepared migration for: ${word.word} -> ${audioFileName}`);
      }
      
      // Update image paths to use .png format
      if (word.image && !word.image.startsWith('/') && !word.image.startsWith('data:') && word.image.length > 2) {
        // It's an emoji, update to png path
        updatedWord.image = `/images/words/${word.word.replace(/\s+/g, '_')}.png`;
      } else if (word.image && word.image.endsWith('.jpg')) {
        // Convert jpg to png
        updatedWord.image = word.image.replace('.jpg', '.png');
      }
      
      updatedList.push(updatedWord);
    }
    
    // Update localStorage with new paths
    localStorage.setItem('customWordList', JSON.stringify(updatedList));
    
    console.log(`Migration prepared for ${migratedCount} audio files`);
    return { success: true, migratedCount };
  } catch (error) {
    console.error('Audio migration failed:', error);
    return { success: false, error: error.message };
  }
};

// Function to save base64 audio as a file (would need server implementation)
export const saveAudioFile = async (base64Audio, fileName) => {
  // This would typically make an API call to save the file
  // For now, we'll just log it
  console.log(`Would save audio file: ${fileName}`);
  
  // In a real implementation:
  // 1. Convert base64 to blob
  // 2. Send to server endpoint
  // 3. Server saves to public/audio directory
  
  return `/audio/${fileName}`;
}; 