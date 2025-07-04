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

export const speak = async (text, { audioPath = null, rate = 1, pitch = 1, volume = 0.8, voice = 'US English Female', onend } = {}) => {
  const textToSpeak = pronunciationFixes[text.toLowerCase()] || text;

  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  
  // --- Try custom audio clip first ---
  if (audioPath) {
    try {
      console.log(`Playing custom audio for "${textToSpeak}" from path: ${audioPath}`);
      const audio = new Audio(audioPath);
      
      // Set MIME type for m4a files if needed
      if (audioPath.endsWith('.m4a')) {
        audio.type = 'audio/mp4';
      }
      
      // Create a promise to handle audio loading
      const audioLoadPromise = new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', (e) => reject(e), { once: true });
      });
      
      // Boost volume for letter audio files
      if (audioPath.includes('/audio/') && audioPath.match(/\/[a-z]\.m4a$/)) {
        // Use Web Audio API to amplify letter audio beyond normal limits
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audio);
        const gainNode = audioContext.createGain();
        
        // Triple the volume (3x amplification - 1.5x louder than previous 2x)
        gainNode.gain.value = 3.0;
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        audio.volume = 1.0; // Still set to max
        console.log('Amplifying letter audio with 3x gain');
      } else {
        audio.volume = 0.8; // Normal volume for other audio
      }
      
      // Wait for audio to be ready before playing
      await audioLoadPromise;
      
      currentAudio = audio;
      await audio.play();
      if (onend) audio.onended = onend;
      return; // Exit if custom audio succeeded
    } catch (error) {
      console.warn('Failed to play custom audio, but NOT falling back to TTS since custom audio was provided.', error);
      // If custom audio was explicitly provided but failed, don't fall back to TTS
      // This prevents both TTS and recorded audio from playing
      if (onend) onend();
      return;
    }
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
      volume: volume,
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
    utterance.volume = volume;
    
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
        onend: () => setTimeout(() => speakItem(index + 1), delay),
        audioPath: currentItem.audioPath // Pass audioPath for sequence
      };
      
      speak(currentItem.text, parameters); // Pass text only if the item is an object with text property, otherwise pass the item directly
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