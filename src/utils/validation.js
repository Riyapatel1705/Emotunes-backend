import User from '../db/models/User.js';



// Email validation
export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{6,}$/;
  return regex.test(password);
};

// Username validation
export const validateUsername = (first_name, last_name) => {
  const regex1 = /^[a-zA-Z]{3,}$/;
  const regex2 = /^[a-zA-Z]{4,}$/;
  return regex1.test(first_name) && regex2.test(last_name);
};

// Check if email exists in MongoDB
export const checkEmailExists = async (email) => {
  const user = await User.findOne({ email });
  return !!user; // true if found
};

// Check if username (first + last) exists
export const checkUsernameExists = async (first_name, last_name) => {
  const user = await User.findOne({ first_name, last_name });
  return !!user;
};

//check the mood based on tokens 
export function detectMood(text) {
    const words = text.toLowerCase().split(/\s+/);
    const detectedMoods = new Set(); // use Set to avoid duplicates
  
    for (const [mood, keywords] of Object.entries(moodMap)) {
      for (const word of words) {
        if (keywords.includes(word)) {
          detectedMoods.add(mood);
        }
      }
    }
  
    return Array.from(detectedMoods); // return as array
  }
  
