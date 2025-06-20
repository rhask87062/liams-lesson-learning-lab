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
      responsiveVoice.setDefaultVoice('US English Female');
      console.log('ResponsiveVoice is ready!');
      clearInterval(checkInterval);
    }
  }, 100);
}

// Pronunciation corrections
const pronunciationFixes = {
  'dino': 'dyeno',
};

// A cache for the audio to avoid re-fetching from the API for the same text.
const audioCache = {};
let currentAudio = null; // To keep track of the currently playing audio

export const speak = async (text, { rate = 1, pitch = 1, voice = 'US English Female', onend } = {}) => {
  const textToSpeak = pronunciationFixes[text.toLowerCase()] || text;

  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  
  // --- Try Google WaveNet TTS first ---
  try {
     // If we have a cached audio, play it directly.
    if (audioCache[textToSpeak]) {
      console.log(`Playing "${textToSpeak}" from cache.`);
      const audio = new Audio(audioCache[textToSpeak]);
      currentAudio = audio;
      audio.play();
      if (onend) audio.onended = onend;
      return;
    }

    console.log(`Fetching WaveNet audio for "${textToSpeak}"`);
    // NOTE: You might need to adjust this URL if you set up a custom domain with Convex
    const convexUrl = import.meta.env.VITE_CONVEX_URL;
    const response = await fetch(`${convexUrl}/generateWavenetAudio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToSpeak }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch audio, status: ${response.status}`);
    }

    const data = await response.json();
    if (data.error || !data.audioContent) {
        throw new Error(`API returned an error: ${data.error || 'No audio content'}`);
    }

    const audioDataUri = `data:audio/mp3;base64,${data.audioContent}`;
    audioCache[textToSpeak] = audioDataUri; // Cache the audio data

    const audio = new Audio(audioDataUri);
    currentAudio = audio;
    audio.play();
    if (onend) audio.onended = onend;
    return; // Exit if WaveNet succeeded

  } catch (error) {
    console.warn('WaveNet TTS failed, falling back to other methods.', error);
    // Continue to the fallback methods
  }


  // --- Fallback to ResponsiveVoice ---
  if (typeof responsiveVoice !== 'undefined' && responsiveVoiceReady) {
    if (textToSpeak !== text) {
      console.log(`Speaking "${textToSpeak}" with ResponsiveVoice (corrected from "${text}")`);
    } else {
      console.log(`Speaking "${textToSpeak}"`);
    }
    
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
    responsiveVoice.speak(textToSpeak, selectedVoice, {
      rate: rate,
      pitch: pitch,
      onend: onend || function() {}
    });
    return;
  }
  
  // --- Fallback to browser's built-in speech synthesis ---
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
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

export const speakSequence = (items, delay = 800) => {
  cancel(); // Stop any previous speech

  // Add a small delay to ensure the speech system is ready
  setTimeout(() => {
    const speakItem = (index) => {
      if (index >= items.length) return;

      const currentItem = items[index];
      const parameters = {
        onend: () => setTimeout(() => speakItem(index + 1), delay)
      };
      
      speak(currentItem, parameters);
    };

    speakItem(0);
  }, 100);
};

export const cancel = () => {
  // Stop our custom audio player
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
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