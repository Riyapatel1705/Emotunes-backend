import express from 'express';
import {suggestSongsByMood,getMood,suggestSongsByText,getTracks} from '../Controllers/SpotifyController.js';

const musicRouter=express.Router();

musicRouter.get('/api/get-Mood',getMood);//get only mood
musicRouter.get('/api/suggest-songs/:mood',suggestSongsByMood);//suggest songs based on mood only
//musicRouter.get('/api/get-songs-by-filter',getSongByFiler);
musicRouter.get('/api/suggest-songs-by-text',suggestSongsByText);//suggest songs based on text language artist year etc
musicRouter.get('/api/get-tracks',getTracks);//get random tracks

export default musicRouter;
