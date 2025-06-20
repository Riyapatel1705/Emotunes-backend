import env from 'dotenv';
import Sentiment from 'sentiment';
import queryMap from '../db/query.json' with { type: 'json' };
import { getAccessToken } from '../utils/helpers.js';
import { detectMood } from '../utils/validation.js';
import axios from 'axios';
import qs from 'qs';
env.config();
const sentiment=new Sentiment();

const songCache={};

//get the mood from the text [optional]
export const getMood=async(req,res)=>{
    try{
        const {text}=req.body;
    if(!text){
        return res.status(400).json({message:"Please provide a mood"});
     }
     var result= sentiment.analyze(text);
     const moodFromWords= detectMood(result.words);
     const score=result.score;

     let finalMood;
     if(moodFromWords){
        finalMood=moodFromWords;
     }else{
        finalMood=score>0?"positive":score<0?"negative":"neutral";
     }


     return res.status(200).json({message:`Mood detected:${finalMood}`,
      mood:finalMood,
      score});
    }catch(err){
        console.log("unable to detect the mood",err.message);
        return res.status(500).json({message:"Internal server error"});
    }

}

//suggest songs based on mood
export const suggestSongsByMood=async(req,res)=>{
    try {
        const {mood}=req.params;
        if(!mood){
            return res.status(400).json ({message:"Please provide a mood"});
        }

        //initialize or update cache counter
        if(!songCache[mood]){
            songCache[mood]={count:1,tracks:null};
        }else{
            songCache[mood].count++;
        }

        //if already fetched 3+ times use cache instead
        if(songCache[mood].count>=4&&songCache[mood].tracks){
            return res.status(200).json({mood,tracks:songCache[mood].tracks,source:"cache"});
        }
        const accessToken=await getAccessToken();
        const query=queryMap[mood.toLowerCase()]||mood;
        const response=await axios.get("https://api.spotify.com/v1/search",{
            headers:{
                Authorization:`Bearer ${accessToken}`
            },
            params:{
                q:query,
                type:"track",
                limit:50,
                market:"US",
            }
        });
        const tracks = response.data.tracks.items
  .filter(track => track.preview_url) // Only include tracks with preview
  .map(track => ({
    name: track.name,
    artist: track.artists[0].name,
    albumArt: track.album.images[0]?.url || null,
    spotifyUrl: track.external_urls.spotify
  }));

        //store in cache if 3+ requests
        if(songCache[mood].count>=3){
            songCache[mood].tracks=tracks;
            songCache[mood].count=0;
        }
        return res.status(200).json({mood,tracks,source:"api"});
     }catch(err){
        console.log("unable to suggest songs",err.message);
        return res.status(500).json({message:"Internal server error"});
     }
}

/*export const getSongByFiler=async(req,res)=>{
    try{
        const {mood,Artists,album,year}=req.query;
        if(!mood||!Artists||!album||!year){
            return res.status(400).json({message:"Please provide all required parameters"});
        }
        const accessToken=await getAccessToken();
        const response=await axios.get("https://api.spotify.com/v1/search",{
            headers:{
                Authorization:`Bearer ${accessToken}`
            },
            params:{
                q:`${Artists} ${album} ${year}`,
                type:"track",
                limit:50,
                market:"IN",

            }
    
        });
        const tracks=response.data.tracks.items.map((track)=>({
            name:track.name,
            Artists:track.artists[0].name,
            albumArt:track.preview_url,
            spotifyUrl:track.external_urls.spotify
        }));
        return res.status(200).json({mood,Artists,album,year,tracks});
    }catch(err){
        console.log("unable to get songs by filter",err.message);
        return res.status(500).json({message:"Internal server error"});
    }
} */

//suggest song based on text 
export const suggestSongsByText = async (req, res) => {
    try {
      const { text } = req.body;
      const { language, artist, album, year } = req.query; // <-- from query string
  
      if (!text) {
        return res.status(400).json({ message: "Please provide a text" });
      }
  
      const detectedMood = detectMood(text);
      if (!detectedMood) {
        return res.status(400).json({ message: "No mood detected in the text" });
      }
  
      const accessToken = await getAccessToken();
  
      // Build query parts
      const queryParts = [];
      const moodStr=typeof detectedMood==="string"?detectedMood:String(detectedMood|| "");
      const moodQuery=queryMap[moodStr.toLowerCase()]||moodStr;
      if (moodQuery) queryParts.push(moodQuery);
      else queryParts.push(detectedMood);
  
      // Attach optional dynamic filters
      if (language) queryParts.push(language);
      if (artist) queryParts.push(artist);
      if (album) queryParts.push(album);
      if (year) queryParts.push(year);
  
      // Join all into a single Spotify search query
      const finalQuery = queryParts.join(" ").trim();
  
      // Spotify API call
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: finalQuery,
          type: "track",
          limit: 50,
          market: "IN"
        }
      });
  
      const items = response.data?.tracks?.items || [];
  
      const tracks = items.map((track) => ({
        name: track.name,
        artist: track.artists?.[0]?.name || "Unknown Artist",
        albumArt: track.album?.images?.[0]?.url || null,
        spotifyUrl: track.external_urls?.spotify || "#"
      }));
  
      return res.status(200).json({
        mood: detectedMood,
        queryUsed: finalQuery,
        tracks
      });
  
    } catch (err) {
      console.error("Error in suggestSongsByText:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

  //get tracks by streaming using random queries
  export const getTracks = async (req, res) => {
    try {
      const accessToken = await getAccessToken();
  
      const randomQueries = [
        "happy upbeat hindi",
        "lofi chill english",
        "romantic soft melody",
        "energetic workout mix",
        "sad emotional arijit",
        "bollywood trending"
      ];
  
      const randomQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)];
  
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          q: randomQuery,
          type: "track",
          limit: 10,
          market: "IN"
        }
      });
  
      const tracks = response.data.tracks.items.map(track => ({
        name: track.name,
        artist: track.artists[0]?.name,
        url: track.external_urls.spotify,
        albumArt: track.album.images[0]?.url,
      }));
  
      return res.status(200).json({ queryUsed: randomQuery, tracks });
  
    } catch (err) {
      console.error("Spotify search error:");
      console.error(err.response?.data || err.message);
      res.status(500).json({ message: "Streaming-style search failed" });
    }
  };

  //create playlist
  export const createPlaylist=async(req,res)=>{
    try {
        const {name,description,createdBy,songs}=req.body;
        if(!name||!createdBy||!songs){
            return res.status(400).json({message:"Please provide all the fields"});
        }
        const newPlaylist=new Playlist({
            name,
            description,
            createdBy,
            songs
        });
        await newPlaylist.save();
        return res.status(201).json({message:"Playlist created successfully",playlist:newPlaylist});
    }catch(err){
        console.log("unable to create playlist",err.message);
        return res.status(500).json({message:"internal server error"});
    }
  }

  //add songs to the playlist
  export const addSongsToPlaylist=async(req,res)=>{
    try{
        const {playlistId,songs}=req.body;
        if(!playlistId||!songs){
            return res.status(400).json({message:"Please provide all the fields"});
        }
        const playlist=await Playlist.findById(playlistId);
        if(!playlist){
            return res.status(404).json({message:"Playlist of this id doesnt match any record"})
        }
        const newSongs=songs.map((song)=>{
            return{
                name:song.name,
                artist:song.artist,
                spotifyUrl:song.spotifyUrl,
                albumArt:song.albumArt,
                previewUrl: track.preview_url || null,
                market:"US" 
            }
        });
        playlist.songs.push(...newSongs);
        await playlist.save();
        return res.status(200).json({message:"Songs added to the playlist successfully",playlist});
    
    }catch(err){
        return res.status(500).json({message:"Internal server error"});
    }
  }

//get playlist 
export const getPlaylist=async(req,res)=>{
    try{
        const {playlistId}=req.params;
        if(!playlistId){
            return res.status(400).json({message:"Please provide a playlist id"});
        }
        const playlist=await playlist.findById(playlistId);
        if(!playlist){
            return res.status(404).json({message:"Playlist of this id doesnt match any record"});
        }
        return res.status(200).json({playlist});
    }catch(err){
        return res.status(500).json({message:"Internal server error"});
    }
}


//get the play(lists of any user
export const getUserPlaylists=async(req,res)=>{
    try{
        const{userId}=req.params;
        if(!userId){
            return res.status(400).json({message:"Please provide  a userId"})
        }
        const playlists=await Playlist.find({userId});
        if(!playlists||playlists.length===0){
            return res.status(404).json({message:"No playlists found for this user"});
        } 
        return res.status(200).json({playlists});
    }catch(err){
        console.log("error in getting user playlists",err.message);
        return res.status(500).json({message:"Internal server error"});
    }

}
//delete playlist
export const deletePlaylist=async(req,res)=>{
    try{
        const{playlistId}=req.params;
        if(!playlistId){
            return res.status(400).json({message:"Please provide a playlist id "})
        }
        const playlist=await Playlist.findByIdAndDelete(playlistId);
        if(!playlist){
            return res.status(404).json({message:"Playlist of this id is not available "})
        }
        return res.status(200).json({message:"Playlist deleted successfully",playlist});
    }catch(err){
        return res.status(500).json({message:"Internal server error"});
    }
}


/*//add artists[optional]
export const addArtists=async(req,res)=>{
    try{

    }
}*/