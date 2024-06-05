import axios from 'axios';

async function detectSong(base64) {
  try {
    console.log('Starting song detection with base64 data');

    // Prepare the request options
    const options = {
      method: 'POST',
      url: 'https://shazam.p.rapidapi.com/songs/v2/detect',
      params: {
        timezone: 'America/Chicago',
        locale: 'en-US'
      },
      headers: {
        'x-rapidapi-key': 'cbf2457315msh63ef19f2050181cp19c4e5jsn270172b532c3',
        'x-rapidapi-host': 'shazam.p.rapidapi.com',
        'Content-Type': 'text/plain'
      },
      data: base64
    };

    // Send the request to the API
    const response = await axios.request(options);
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Detect Song Error:', error);
    throw error;
  }
}

export default detectSong;
