import requests
import pyaudio
import wave
import base64
import json

'''
API description:

1. Please set token and language first.
2. language can be set "華語"、"台語"、"華台雙語"、"客語"、"英語"、"印尼語"、"粵語".
3. Supports any audio file format, the default is wav.
4. If you want to set the punctuation function, please set the 'segment' parameter to 'True'.
5. You can set the path of the audio file or record it directly.
'''
class STT:
    
    def __init__(self, token="", language="華語", segment="False", streaming_id = None):

        self.token = token
        self.language = language
        self.segment = segment
        self.streaming_id = streaming_id
        self.lang2service = {
            "華語": "A017",
            "台語": "A018",
            "華台雙語": "A019",
            "客語": "A020",
            "英語": "A021",
            "印尼語": "A022",
            "粵語": "A023"
        }

    def request(self, audio_path):
  
        with open(audio_path, 'rb') as file:
            raw_audio = file.read()
        audio_data = base64.b64encode(raw_audio)

        data = {
            "token": self.token,
            "audio_data": audio_data.decode(),
            "audio_format": audio_path.split(".")[-1],
            "service_id": self.lang2service[self.language],
            "segment": self.segment,
            "correction": "False",
            "streaming_id": None
        }

        response = requests.post("http://140.116.245.149:2802/asr", json=data)

        if response.status_code == 200:
            # decode success
            sentence = json.loads(response.text)["words_list"][0].replace("<SPOKEN_NOISE>", "").replace(" ","")
            ## print(sentence)
            return sentence
        elif response.status_code == 400:
            # bad request
            print(response.text)
            return "Request failed!"
        elif response.status_code == 500:
            # server internal error
            print(response.text)
            return "Request failed!"

    def record(self, record_seconds = 5):
        
        sample_format = pyaudio.paInt16
        channels = 1
        sample_rate = 16000
        chunk = 1024
        output_file = "audio.wav"

        audio = pyaudio.PyAudio()

        stream = audio.open(format=sample_format,
                            channels=channels,
                            rate=sample_rate,
                            input=True,
                            frames_per_buffer=chunk)

        print("Recording...")

        frames = []

        # 開始錄音
        for _ in range(0, int(sample_rate / chunk * record_seconds)):
            data = stream.read(chunk)
            frames.append(data)

        # 停止錄音
        print("Recording finished.")


        stream.stop_stream()
        stream.close()
        audio.terminate()

        # 儲存音檔
        with wave.open(output_file, 'wb') as wf:
            wf.setnchannels(channels)
            wf.setsampwidth(audio.get_sample_size(sample_format))
            wf.setframerate(sample_rate)
            wf.writeframes(b''.join(frames))

        ## print(f"Audio saved as {output_file}")
        return output_file


