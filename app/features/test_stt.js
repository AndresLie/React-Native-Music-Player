const fs = require('fs').promises;

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

  async wavToBase64(filePath) {
    const fileBuffer = await fs.readFile(filePath);
    return fileBuffer.toString('base64');
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
    const response = await fetch('http://140.116.245.149:2802/asr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "audio_data": base64String,
        "token": this.token,
        "service_id": this.language2ServiceID[language],
        "audio_format": "wav",
        "mode": "Segmentation"
      })
    });

    if (response.ok) {
      console.log(response.status.toString());
      const resultMap = await response.json();
      const sentence = resultMap['words_list'][0].replace(/\([^)]*\)/g, "").replace(/ /g, "");
      return sentence;
    } else {
      console.log(response.status.toString());
      throw new Error('Failed to request server.');
    }
  }
}

// Example usage:
const client = new STTClient();
const filePath = 'D:\\Programming\\.vscode\\Wde\\Rct\\Thunder\\audio.wav';
const language = 'en'; // Set the language as needed

client.wavToBase64(filePath)
  .then(base64Audio => client.askForService(base64Audio, language))
  .then(sentence => {
    console.log('Transcribed sentence:', sentence);
  })
  .catch(error => {
    console.error('Error:', error);
  });
