/* eslint-disable no-undef */
// A simple, self-contained Text-to-Speech utility that uses ResponsiveVoice when available,
// otherwise falls back to browser's built-in speech synthesis

// Wait for ResponsiveVoice to be ready
let responsiveVoiceReady = false;

if (typeof responsiveVoice !== 'undefined') {
  responsiveVoice.init();
  // Check if ResponsiveVoice is ready
  const checkInterval = setInterval(() => {
    if (responsiveVoice.voiceSupport()) {
      responsiveVoiceReady = true;
      console.log('ResponsiveVoice is ready!');
      clearInterval(checkInterval);
    }
  }, 100);
}

export const speak = (text, { rate = 1, pitch = 1, voice = 'US English Female', onend } = {}) => {
  // Try ResponsiveVoice first if it's loaded and ready
  if (typeof responsiveVoice !== 'undefined' && responsiveVoiceReady) {
    console.log('Using ResponsiveVoice with voice:', voice);
    
    // Try different US voice options
    const voiceOptions = [
      'US English Female',
      'US English',
      'English (America)',
      'en-US',
      'English (United States)'
    ];
    
    // Check which voices are available
    const availableVoices = responsiveVoice.getVoices();
    console.log('Available ResponsiveVoice voices:', availableVoices.map(v => v.name));
    
    // Find the first matching US voice
    let selectedVoice = voice;
    for (const option of voiceOptions) {
      if (availableVoices.find(v => v.name === option)) {
        selectedVoice = option;
        break;
      }
    }
    
    console.log('Selected voice:', selectedVoice);
    
    // Use the selected voice
    responsiveVoice.speak(text, selectedVoice, {
      rate: rate,
      pitch: pitch,
      onend: onend || function() {}
    });
    return;
  }
  
  // Fall back to browser's built-in speech synthesis
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    // Try to find a female English voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
    const englishVoice = femaleVoice || voices.find(v => v.lang.startsWith('en'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    if (onend) {
      utterance.onend = onend;
    }
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('No speech synthesis available.');
    if (onend) onend();
  }
};

export const cancel = () => {
  // Cancel ResponsiveVoice if available
  if (typeof responsiveVoice !== 'undefined') {
    responsiveVoice.cancel();
  }
  // Also cancel browser speech synthesis
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Debug function to list available voices
export const listVoices = () => {
  console.log('=== Available Voices ===');
  
  if (typeof responsiveVoice !== 'undefined' && responsiveVoiceReady) {
    console.log('ResponsiveVoice voices:', responsiveVoice.getVoices());
  } else {
    console.log('ResponsiveVoice not ready yet');
  }
  
  if ('speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    console.log('Browser voices:', voices.map(v => `${v.name} (${v.lang})`));
  }
};

// Expose for debugging
window.listVoices = listVoices; 