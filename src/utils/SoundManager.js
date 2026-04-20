// Simple sound utility for StudySync
const sounds = {
  focus: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Start Focus
  break: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Start Break
  complete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Session Complete
};

export const playSound = (type) => {
  if (sounds[type]) {
    const audio = new Audio(sounds[type]);
    audio.volume = 0.4;
    audio.play().catch(err => console.log('Audio playback blocked by browser. Interact with the page first.'));
  }
};
