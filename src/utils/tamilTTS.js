/**
 * Tamil Text-to-Speech Utility
 * Handles Tamil language speech synthesis with fallbacks
 */

// Tamil character to phonetic mapping for better pronunciation
const tamilPhoneticMap = {
  'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ii', 'உ': 'u', 'ஊ': 'uu',
  'எ': 'e', 'ஏ': 'ee', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oo', 'ஔ': 'au',
  'க': 'ka', 'கா': 'kaa', 'கி': 'ki', 'கீ': 'kii', 'கு': 'ku', 'கூ': 'kuu',
  'கே': 'ke', 'கை': 'kai', 'கொ': 'ko', 'கோ': 'ko', 'கௌ': 'kau',
  'ச': 'cha', 'சா': 'chaa', 'சி': 'chi', 'சீ': 'chii', 'சு': 'chu', 'சூ': 'chuu',
  'ட': 'ta', 'டா': 'taa', 'டி': 'ti', 'டீ': 'tii', 'டு': 'tu', 'டூ': 'tuu',
  'த': 'tha', 'தா': 'thaa', 'தி': 'thi', 'தீ': 'thii', 'து': 'thu', 'தூ': 'thuu',
  'ந': 'na', 'நா': 'naa', 'நி': 'ni', 'நீ': 'nii', 'நு': 'nu', 'நூ': 'nuu',
  'ப': 'pa', 'பா': 'paa', 'பி': 'pi', 'பீ': 'pii', 'பு': 'pu', 'பூ': 'puu',
  'ம': 'ma', 'மா': 'maa', 'மி': 'mi', 'மீ': 'mii', 'மு': 'mu', 'மூ': 'muu',
  'ய': 'ya', 'யா': 'yaa', 'யி': 'yi', 'யீ': 'yii', 'யு': 'yu', 'யூ': 'yuu',
  'ர': 'ra', 'ரா': 'raa', 'రി': 'ri', 'রீ': 'rii', 'रु': 'ru', 'रू': 'ruu',
  'ல': 'la', 'லா': 'laa', 'லி': 'li', 'லீ': 'lii', 'லு': 'lu', 'லூ': 'luu',
  'வ': 'va', 'வா': 'vaa', 'வி': 'vi', 'வீ': 'vii', 'வு': 'vu', 'வூ': 'vuu',
  'ழ': 'zha', 'ழா': 'zhaa', 'ழி': 'zhi', 'ழீ': 'zhii', 'ழு': 'zhu', 'ழூ': 'zhuu',
  'ள': 'la', 'ளா': 'laa', 'ளி': 'li', 'ளீ': 'lii', 'ளு': 'lu', 'ளூ': 'luu',
  'ற': 'rra', 'றா': 'rraa', 'றி': 'rri', 'றீ': 'rrii', 'று': 'rru', 'றூ': 'rruu',
  'ன': 'na', 'னா': 'naa', 'னி': 'ni', 'னீ': 'nii', 'னு': 'nu', 'னூ': 'nuu',
  '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
  '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
};

/**
 * Convert Tamil text to phonetic English for better TTS
 */
export const convertTamilToPhonetic = (tamilText) => {
  let phonetic = tamilText;
  
  // Replace Tamil characters with phonetic equivalents
  for (const [tamil, english] of Object.entries(tamilPhoneticMap)) {
    phonetic = phonetic.replaceAll(tamil, english);
  }
  
  return phonetic;
};

/**
 * Speak Tamil text using Web Speech API
 * Tries native Tamil support first, falls back to phonetic English
 */
export const speakTamil = (text, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const {
      rate = 0.8,
      pitch = 1.0,
      volume = 1.0,
      usePhonetic = false,
      onStart = () => {},
      onEnd = () => {},
      onError = () => {}
    } = options;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance();
    
    // Try to use Tamil voice first
    if (!usePhonetic) {
      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = voices.find(voice => 
        voice.lang.includes('ta') || 
        voice.lang.includes('tam') ||
        voice.name.toLowerCase().includes('tamil')
      );
      
      if (tamilVoice) {
        utterance.voice = tamilVoice;
        utterance.lang = 'ta-IN';
        utterance.text = text;
      } else {
        // Fallback to phonetic English
        utterance.text = convertTamilToPhonetic(text);
        utterance.lang = 'en-US';
      }
    } else {
      // Use phonetic conversion
      utterance.text = convertTamilToPhonetic(text);
      utterance.lang = 'en-US';
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      console.log('Tamil TTS started:', text);
      onStart();
    };

    utterance.onend = () => {
      console.log('Tamil TTS ended');
      onEnd();
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('Tamil TTS error:', event.error);
      onError(event.error);
      reject(new Error(event.error));
    };

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Get all available voices and filter for Tamil
 */
export const getAvailableVoices = () => {
  if (!('speechSynthesis' in window)) {
    return { all: [], tamil: [], english: [] };
  }

  const voices = window.speechSynthesis.getVoices();
  
  return {
    all: voices,
    tamil: voices.filter(v => v.lang.includes('ta') || v.lang.includes('tam')),
    english: voices.filter(v => v.lang.includes('en')),
  };
};

/**
 * Check if Tamil voice is available
 */
export const isTamilVoiceAvailable = () => {
  const { tamil } = getAvailableVoices();
  return tamil.length > 0;
};

/**
 * Stop all ongoing speech
 */
export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Speak English text with proper settings
 */
export const speakEnglish = (text, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const {
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
      onStart = () => {},
      onEnd = () => {},
      onError = () => {}
    } = options;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      console.log('English TTS started:', text);
      onStart();
    };

    utterance.onend = () => {
      console.log('English TTS ended');
      onEnd();
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('English TTS error:', event.error);
      onError(event.error);
      reject(new Error(event.error));
    };

    window.speechSynthesis.speak(utterance);
  });
};
