import os
import requests
import base64
import numpy as np
import wave
import struct
from moviepy.editor import AudioFileClip

converted_audio_path = os.path.abspath('converted_audio.wav')
output_audio_path = os.path.abspath('output.raw')

def convert_to_wav(input_path, output_path):
    try:
        audio = AudioFileClip(input_path)
        audio.write_audiofile(output_path, codec='pcm_s16le')
        print(f"File converted to WAV: {output_path}")
    except Exception as e:
        print(f"Error converting file: {e}")
        raise

def is_wav_file(file_path):
    try:
        with wave.open(file_path, 'rb') as wav_file:
            return True
    except wave.Error:
        return False

def decode_wav(file_path):
    try:
        with wave.open(file_path, 'rb') as wav_file:
            sample_rate = wav_file.getframerate()
            n_channels = wav_file.getnchannels()
            n_samples = wav_file.getnframes()
            audio_data = wav_file.readframes(n_samples)
            
            if n_channels == 2:
                audio_data = np.frombuffer(audio_data, dtype=np.int16)
                audio_data = audio_data.reshape((-1, 2))
                audio_data = audio_data[:, 0]
            else:
                audio_data = np.frombuffer(audio_data, dtype=np.int16)

        return sample_rate, audio_data
    except wave.Error as e:
        print(f"Wave error: {e}")
        raise
    except Exception as e:
        print(f"Error decoding WAV file: {e}")
        raise

def encode_to_raw_pcm(audio_data, sample_rate, file_path):
    with open(file_path, 'wb') as raw_file:
        for sample in audio_data:
            raw_file.write(struct.pack('<h', sample))

def read_and_encode_to_base64(file_path):
    with open(file_path, 'rb') as raw_file:
        file_data = raw_file.read()
    return base64.b64encode(file_data).decode('utf-8')

def detect_song(input_audio_path):
    try:
        if not is_wav_file(input_audio_path):
            print("Input file is not a valid WAV file. Converting to WAV...")
            convert_to_wav(input_audio_path, converted_audio_path)
            audio_file_path = converted_audio_path
        else:
            audio_file_path = input_audio_path

        sample_rate, audio_data = decode_wav(audio_file_path)
        encode_to_raw_pcm(audio_data, sample_rate, output_audio_path)
        audio_data_base64 = read_and_encode_to_base64(output_audio_path)

        url = 'https://shazam.p.rapidapi.com/songs/v2/detect'
        headers = {
            'x-rapidapi-key': 'cbf2457315msh63ef19f2050181cp19c4e5jsn270172b532c3',
            'x-rapidapi-host': 'shazam.p.rapidapi.com',
            'Content-Type': 'text/plain'
        }
        params = {
            'timezone': 'America/Chicago',
            'locale': 'en-US'
        }
        data = audio_data_base64

        response = requests.post(url, headers=headers, params=params, data=data)
        response.raise_for_status()
        return response.json()
    except Exception as error:
        return {'error': str(error)}
