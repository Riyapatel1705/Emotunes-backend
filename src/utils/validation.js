import User from '../db/models/User.js';
import moodMap from '../db/moodMap.json' with { type: 'json' };
import reverseMoodMap from '../db/reversemoodMap.json' with {type:'json'};
import Sentiment from 'sentiment';

const sentiment=new Sentiment();


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
    const moodScores = {};
    const usedIndices = new Set();
  
    const negationWords = ["not", "don't", "didn't", "isn't", "wasn't", "aren't", "weren't", "never", "hardly", "no", "cannot"];
  
    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i];
      const prev1 = words[i - 1] || "";
      const prev2 = words[i - 2] || "";
      const next1 = words[i + 1] || "";
      const next2 = words[i + 2] || "";
  
      for (const [mood, keywords] of Object.entries(moodMap)) {
        for (const keyword of keywords) {
          const lowerKeyword = keyword.toLowerCase();
  
          const isNegated =
            (negationWords.includes(currentWord) &&
              (next1 === lowerKeyword || next2 === lowerKeyword)) ||
            (currentWord === lowerKeyword &&
              (negationWords.includes(prev1) || negationWords.includes(prev2)));
  
          if (isNegated) {
            const reversed = reverseMoodMap[mood];
            if (reversed) {
              moodScores[reversed] = (moodScores[reversed] || 0) + 2;
              usedIndices.add(i);
            }
          } else if (
            currentWord === lowerKeyword &&
            !usedIndices.has(i) &&
            !negationWords.includes(prev1) &&
            !negationWords.includes(prev2)
          ) {
            moodScores[mood] = (moodScores[mood] || 0) + 1;
            usedIndices.add(i);
          }
        }
      }
    }
  
    //Sentiment fallback
    const result = sentiment.analyze(text);
    const score = result.score;
  
    const existingMoods = Object.keys(moodScores);
   if (existingMoods.length === 0) {
  if (score > 2) {
    moodScores["happy"] = (moodScores["happy"] || 0) + 1;
    moodScores["excited"] = (moodScores["excited"] || 0) + 1;
  } else if (score < -2) {
    moodScores["sad"] = (moodScores["sad"] || 0) + 1;
    moodScores["angry"] = (moodScores["angry"] || 0) + 1;
    moodScores["anxious"] = (moodScores["anxious"] || 0) + 1;
  }
}

  
    const sortedMoods = Object.entries(moodScores).sort((a, b) => b[1] - a[1]);
    if (sortedMoods.length === 0) return ["neutral"];
  
    const topScore = sortedMoods[0][1];
    const topMoods = sortedMoods
      .filter(([_, score]) => score === topScore)
      .map(([mood]) => mood);
  
    return topMoods;
  }
  