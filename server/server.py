from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import base64
import numpy as np
import wave
import struct
from moviepy.editor import AudioFileClip
import tempfile
from pymongo import MongoClient
from bson.objectid import ObjectId
from STT import STT
import MY_KEY as MY_KEY

app = Flask(__name__)
CORS(app)

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
            'x-rapidapi-key': MY_KEY.shazam_token,
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

@app.route('/', methods=['GET'])
def hello_world():
    return "Hello, World!"

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        file_path = temp_file.name
        file.save(file_path)

    result = detect_song(file_path)
    title = result.get('track', {}).get('title', 'Unknown Title')
    print(title)
    return jsonify(title)

@app.route('/upload_stt', methods=['POST'])
def upload_stt():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400
    language = request.form.get('language')
    print(language)
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        file_path = temp_file.name
        file.save(file_path)
        print(f"File saved to: {file_path}")
    if language=='en':
        language='英語'
    elif language=='zh':
        language='華語'
    elif language=='id':
        language='印尼語'
    elif language=='tai':
        language='台語'
    else:
        language='華語'

    print(language)
    try:
        my_token = MY_KEY.stt_token
        segment = "False"
        stt = STT(token=my_token, language=language, segment=segment)
        sentence = stt.request(file_path)
        print(f"Transcription: {sentence}")
        return jsonify({"transcription": sentence})
    except Exception as e:
        print(f"STT error: {e}")
        return jsonify({"error": str(e)}), 500

client = MongoClient('mongodb://localhost:27017/')
db = client.playlists_db
playlists_collection = db.playlists

@app.route('/update-playlist', methods=['POST'])
def update_playlist():
    data = request.json
    song = data['song']
    selected_playlist_ids = data['selectedPlaylistIds']
    unselected_playlist_ids = data['unselectedPlaylistIds']
    updated_playlists = []

    for playlist_id in selected_playlist_ids:
        playlist = playlists_collection.find_one({"_id": ObjectId(playlist_id)})
        if playlist:
            if 'songs' not in playlist:
                playlist['songs'] = []
            if not any(existing_song['id']['videoId'] == song['id']['videoId'] for existing_song in playlist['songs']):
                playlist['songs'].append(song)
                playlists_collection.update_one({"_id": ObjectId(playlist_id)}, {"$set": playlist})
            updated_playlists.append({
                'id': str(playlist['_id']),
                'name': playlist['name'],
                'songCount': len(playlist['songs']),
                'songIds': [existing_song['id']['videoId'] for existing_song in playlist['songs']]
            })

    for playlist_id in unselected_playlist_ids:
        playlist = playlists_collection.find_one({"_id": ObjectId(playlist_id)})
        if playlist and 'songs' in playlist:
            playlist['songs'] = [existing_song for existing_song in playlist['songs'] if existing_song['id']['videoId'] != song['id']['videoId']]
            playlists_collection.update_one({"_id": ObjectId(playlist_id)}, {"$set": playlist})
            updated_playlists.append({
                'id': str(playlist['_id']),
                'name': playlist['name'],
                'songCount': len(playlist['songs']),
                'songIds': [existing_song['id']['videoId'] for existing_song in playlist['songs']]
            })

    return jsonify({'updated_playlists': updated_playlists})

@app.route('/add-playlist', methods=['POST'])
def add_playlist():
    data = request.json
    new_playlist = data['playlist']
    new_playlist['songs'] = []
    new_playlist['songCount'] = 0
    result = playlists_collection.insert_one(new_playlist)
    new_playlist_id = result.inserted_id
    return jsonify({'id': str(new_playlist_id), 'message': 'Playlist added successfully'})

@app.route('/playlists', methods=['GET'])
def get_playlists():
    playlists = playlists_collection.find()
    result = []
    for playlist in playlists:
        result.append({
            'id': str(playlist['_id']),
            'name': playlist['name'],
            'songCount': len(playlist['songs']) if 'songs' in playlist else 0,  # Ensure songCount is calculated
            'songIds': [song['id']['videoId'] for song in playlist['songs']] if 'songs' in playlist else []  # Ensure songIds are included
        })
    return jsonify(result)

@app.route('/playlist/<playlist_id>', methods=['GET'])
def get_playlist_details(playlist_id):
    playlist = playlists_collection.find_one({"_id": ObjectId(playlist_id)})
    if playlist:
        return jsonify({
            'id': str(playlist['_id']),
            'name': playlist['name'],
            'songs': playlist.get('songs', []),
            'songCount': playlist.get('songCount', 0)
        })
    else:
        return jsonify({'message': 'Playlist not found'}), 404
    
@app.route('/delete-song', methods=['POST'])
def delete_song():
    data = request.json
    song_id = data['songId']
    playlist_id = data['playlistId']
    print(f"Received song_id: {song_id}, playlist_id: {playlist_id}")

    # Find the playlist
    playlist = playlists_collection.find_one({"_id": ObjectId(playlist_id)})
    if not playlist:
        print("Playlist not found")
        return jsonify({'message': 'Playlist not found'}), 404

    print(f"Playlist found: {playlist}")

    # Check if 'songs' key exists in the playlist
    if 'songs' not in playlist:
        print("No songs key in playlist")
        return jsonify({'message': 'No songs key in playlist'}), 404

    # Filter out the song to be deleted
    original_song_count = len(playlist['songs'])
    playlist['songs'] = [song for song in playlist['songs'] if song['id']['videoId'] != song_id]
    updated_song_count = len(playlist['songs'])

    if original_song_count == updated_song_count:
        print("Song not found in playlist")
        return jsonify({'message': 'Song not found in playlist'}), 404

    # Update the playlist
    result = playlists_collection.update_one(
        {"_id": ObjectId(playlist_id)},
        {"$set": {"songs": playlist['songs']}}
    )

    print(f"Updated playlist: {result.modified_count} document(s) modified")
    return jsonify({'message': 'Song deleted', 'playlistId': playlist_id})

@app.route('/rename-playlist', methods=['POST'])
def rename_playlist():
    playlist_id = request.json.get('playlistId')
    new_name = request.json.get('newName')
    
    if not playlist_id or not new_name:
        return jsonify({'message': 'Invalid input'}), 400
    
    result = playlists_collection.update_one(
        {"_id": ObjectId(playlist_id)},
        {"$set": {"name": new_name}}
    )
    
    if result.matched_count > 0:
        return jsonify({'message': 'Playlist renamed successfully'})
    else:
        return jsonify({'message': 'Playlist not found'}), 404

@app.route('/delete-playlist', methods=['POST'])
def delete_playlist():
    data = request.json
    playlist_id = data['playlistId']
    result = playlists_collection.delete_one({"_id": ObjectId(playlist_id)})
    if result.deleted_count > 0:
        return jsonify({'message': 'Playlist deleted', 'playlistId': playlist_id})
    return jsonify({'message': 'Playlist not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
