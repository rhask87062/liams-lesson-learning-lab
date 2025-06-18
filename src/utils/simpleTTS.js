/* eslint-disable no-undef */
// A simple, self-contained Text-to-Speech utility that wraps ResponsiveVoice.

export const speak = (text, { rate = 1, pitch = 1, voice = 'UK English Female', onend } = {}) => {
  if (typeof responsiveVoice === 'undefined') {
    console.warn('ResponsiveVoice not loaded.');
    if (onend) onend(); // Call onend immediately if ResponsiveVoice isn't loaded
    return;
  }
  
  responsiveVoice.speak(text, voice, {
    rate: rate,
    pitch: pitch,
    onend: onend // Pass the onend callback directly to ResponsiveVoice
  });
};

export const cancel = () => {
  if (typeof responsiveVoice === 'undefined') {
    return;
  }
  responsiveVoice.cancel();
}; 