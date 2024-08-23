import base64 from 'react-native-base64';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { stt_key } from './key';

class STTClient {
  constructor() {
    this.token = stt_key;
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
      "segment": "False",
      "correction": "False",
      "streaming_id": null
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

// Function to record audio and get base64 string
async function recordAudio() {
  const recording = new Audio.Recording();
  try {
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();

    console.log('Recording...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Record for 3 seconds
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    console.log('Recording stopped and saved at:', uri);

    const file = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Recording converted to base64');
    return file;
  } catch (error) {
    console.error('Failed to record audio', error);
  }
}

export { STTClient, recordAudio };
