# Multi-Lingual Music Player

A comprehensive music player application with multi-lingual support (English, Chinese, Indonesian). This project includes features such as a Music Player, Music Detector (similar to Shazam), Speech-to-Text (including support for 台語), Personal Playlist management with full CRUD capabilities, and a Playing Queue system.

## Demo

[![Watch the demo video](https://drive.google.com/file/d/1FYx2QTh-rHPETgsCMaUu0FJMrq6HJT6R/view?usp=sharing)


## Features

- **Music Player**: Play and control your favorite tracks with a built-in player.
- **Music Detector**: Identify songs similar to Shazam, using audio recognition.
- **Speech-to-Text**: Convert spoken words into text, with support for multiple languages including 台語.
- **Personal Playlist Management**: Create, read, update, and delete (CRUD) your personal playlists to manage your music collection.
- **Playing Queue**: Organize and queue your tracks for seamless playback.

## Tech Stack

- **Frontend**: [React Native](https://reactnative.dev/) (using the Expo framework)
- **Backend**: [Flask](https://flask.palletsprojects.com/) - a lightweight WSGI web application framework in Python.
- **Database**: [MongoDB](https://www.mongodb.com/) - a NoSQL database for storing user data and playlists.

## Installation

### Prerequisites

- Node.js and npm
- Python 3.x
- MongoDB


### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/music-player.git
   cd React-Native-Music-Player
   cd app
   ```

2. **Install dependencies**:

   Run the following command to install all the necessary dependencies for the frontend:

   ```bash
   npm install
   ```

3. **Start the Expo development server**:

   Use the command below to start the Expo development server:

   ```bash
   npx expo start
   ```

### Backend Setup

1. **Navigate to the backend directory**:

   Change to the backend directory:

   ```bash
   cd server
   ```

2. **Create a virtual environment**:

   Set up a virtual environment for Python dependencies:

   ```bash
   python -m venv venv
   source venv/bin/activate 
   ```

3. **Install Flask and other dependencies**:

   Install the required Python packages listed in `requirements.txt`:

   ```bash
   pip install -r requirements.txt
   ```

4. **Start the Flask server**:

   Launch the backend server with Flask:

   ```bash
   python server.py
   ```

### Database Setup

1. **Ensure MongoDB is installed and running**:

   Make sure MongoDB is properly installed and running on your machine.

2. **Configure MongoDB connection**:

   Update the MongoDB connection settings in the `config.py` file located in the backend directory.

