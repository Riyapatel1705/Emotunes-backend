import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

export const getAccessToken=async()=>{
    const clientId=process.env.SPOTIFY_CLIENT_ID;
    const clientSecret=process.env.SPOTIFY_CLIENT_SECRET;

    const tokenEndpoint='https://accounts.spotify.com/api/token';
    const authHeader=Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try{
        const response=await axios.post(tokenEndpoint,'grant_type=client_credentials',
            {
                headers:{
                    Authorization:`Basic ${authHeader}`,
                    'Content-Type':'application/x-www-form-urlencoded',
                },
            }
        );
        return response.data.access_token;
    }catch(error){
        console.log('Failed to get spotify access token',error.message);
        throw error;
    }

}

const CACHE_FILE=path.resolve('./db/')