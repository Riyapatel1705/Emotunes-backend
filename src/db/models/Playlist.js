import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // this will let you populate user info
    required: true
  },

  createdBy: {
    type: String,   // store user name separately for quick view
    required: true
  },

  songs: [
    {
      name: String,
      artist: String,
      spotifyUrl: String,
      albumArt: String,
      previewUrl: String
    }
  ],

  description: {
    type: String,     // fixed from Text
    minlength: 20
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Export model
export const Playlist = mongoose.model('Playlist', playlistSchema);
