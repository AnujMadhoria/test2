// Create and configure audio context
let audioContext = null;
let tickBuffer = null;

// Initialize audio context
const initAudio = async () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a simple tick sound
    const sampleRate = audioContext.sampleRate;
    const duration = 0.1; // 100ms
    const numSamples = Math.floor(sampleRate * duration);
    
    tickBuffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = tickBuffer.getChannelData(0);
    
    // Generate a simple tick sound with lower volume (0.3 instead of 1.0)
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-10 * t) * 0.3;
    }
  }
};

// Play tick sound
const playTick = () => {
  if (!audioContext || !tickBuffer) return;
  
  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.3; // Additional volume control
  
  source.buffer = tickBuffer;
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  source.start();
};

// Stop all sounds
const stopAllSounds = () => {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
    tickBuffer = null;
  }
};

export { initAudio, playTick, stopAllSounds }; 