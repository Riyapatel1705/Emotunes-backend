import mongoose from 'mongoose';

export const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  spotifyId: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  followers: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true
});

export const Artist = mongoose.model('Artist', artistSchema);
