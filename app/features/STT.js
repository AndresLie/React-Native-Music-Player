class STTClient {
  // token 有效期限 113/3/25 ~ 113/9/1
  constructor() {
    this.token = "5FcW6E8HcOUNyRcfxFJe8H0J4AudU8wWqPGqka5gPmNTSWQwGGRfENaTCL8qyd8W";
    this.language2ServiceID = {
      "華語": "A017",
      "台語": "A018",
      "客語": "A020",
      "英語": "A021",
      "印尼語": "A022",
      "粵語": "A023"
    };
  }

  async askForService(base64String, language) {
    switch (language) {
      case 'en':
        language = '英語';
        break;
      case 'zh':
        language = '華語';
        break;
      case 'id':
        language = '印尼語';
        break;
      default:
        language = '華語';
        break;
    }
    const requestBody = {
      "audio_data": base64String,
      "token": this.token,
      "service_id": this.language2ServiceID[language],
      "audio_format": "wav",
      "mode": "Segmentation"
    };
    console.log('Request Body:', requestBody);

    try {
      const response = await fetch('http://140.116.245.149:2802/asr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response Status:', response.status);
      if (response.ok) {
        const resultMap = await response.json();
        console.log('Response Data:', resultMap);
        const sentence = resultMap['words_list'][0].replace(/\([^)]。*.,。\)/g, "").replace(/ /g, "");
        return sentence;
      } else {
        const errorData = await response.text();
        console.error('Response Error Data:', errorData);
        throw new Error('Failed to request server.');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}

// Example usage:
const client = new STTClient();
const base64Audio = 'your_base64_audio_string_here';
const language = 'en'; // Use the appropriate language code

client.askForService(base64Audio, language)
  .then(sentence => {
    console.log('Transcribed sentence:', sentence);
  })
  .catch(error => {
    console.error('Error:', error);
  });

export default STTClient;
