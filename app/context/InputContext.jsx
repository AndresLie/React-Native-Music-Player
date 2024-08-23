import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { ToastAndroid } from 'react-native';
import {renamePlaylistLabel} from '@/label/toastLabel'
import {ip} from '@/backend_ip'
const InputContext = createContext();

export function InputProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [searchBar, setSearchBar] = useState("");
  const [searchBy, setSearchBy] = useState("TrackInfo");
  const [playing, setPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState({ id: { videoId: 0 } });
  const [showMusic, setShowMusic] = useState(false);
  const [searchResults, setsearchResults] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    // Fetch playlists from the server
    axios.get(`http://${ip}/playlists`)
      .then(response => {
        // Store only the playlist names, ids, and song counts
        const fetchedPlaylists = response.data.map(pl => ({
          id: pl.id,
          name: pl.name,
          songCount: pl.songCount,
        }));
        setPlaylists(fetchedPlaylists);
      })
      .catch(error => console.error('Error fetching playlists:', error));
  }, []);

  const handleLanguage = (lang) => setLanguage(lang);
  const handleSearchBar = (val) => setSearchBar(val);
  const handleSearchBy = (type) => setSearchBy(type);
  const handleShowMusic = (showVal) => setShowMusic(showVal);
  const handleCurrentSong = (song, fromSearch) => {
    setCurrentSong(song);
    if (fromSearch) {
      setQueue(() => searchResults);
    } else {
      setQueue(() => currentPlaylist);
    }
  };
  const handleQueue = (songs) => {
    setQueue(songs);
  };
  const handleSearchResults = (songs) => setsearchResults(songs);
  const handleCurrentPlaylist = (songs) => setCurrentPlaylist(songs);

  const playNext = () => {
    const idx = queue.indexOf(currentSong);
    if (!queue[idx + 1]) return;
    setCurrentSong(queue[idx + 1]);
  };

  const playPrev = () => {
    const idx = queue.indexOf(currentSong);
    if (!queue[idx - 1]) return;
    setCurrentSong(queue[idx - 1]);
  };

  const handlePlaylist = (song, selectedPlaylistIds, unselectedPlaylistIds) => {
    axios.post(`http://${ip}/update-playlist`, { song, selectedPlaylistIds, unselectedPlaylistIds })
      .then(response => {
        const updatedPlaylists = response.data.updated_playlists;

        setPlaylists(prevPlaylists => {
          const newPlaylists = prevPlaylists.map(pl => {
            const updatedPlaylist = updatedPlaylists.find(up => up.id === pl.id);
            if (updatedPlaylist) {
              return {
                ...pl,
                songCount: updatedPlaylist.songCount,
                songIds: updatedPlaylist.songIds
              };
            }
            return pl;
          });
          return newPlaylists;
        });
      })
      .catch(error => {
        if (error.response && error.response.data.message === 'Song already exists in playlist') {
          ToastAndroid.show('Song already exists in playlist', ToastAndroid.SHORT);
        } else {
          console.error(error);
        }
      });
  };

  const handlePlaylists = (newPlaylist) => {
    // Update the server with the new playlist
    axios.post(`http://${ip}/add-playlist`, { playlist: newPlaylist })
      .then(response => {
        // Update state with the new playlist name and id
        setPlaylists([...playlists, { id: response.data.id, name: newPlaylist.name }]);
      })
      .catch(error => console.error(error));
  };

  const fetchPlaylists = () => {
    axios.get(`http://${ip}/playlists`)
      .then(response => {
        setPlaylists(response.data);
      })
      .catch(error => console.error('Error fetching playlists:', error));
  };

  const handleDelete = (songId, playlistId) => {
    axios.post(`http://${ip}/delete-song`, { songId, playlistId })
      .then(response => {
        if (response.data.message === 'Song deleted') {
          setCurrentPlaylist(prevSongs => prevSongs.filter(song => song.id.videoId !== songId));
          setPlaylists(prevPlaylists =>
            prevPlaylists.map(playlist =>
              playlist.id === playlistId
                ? { ...playlist, songCount: playlist.songCount - 1 }
                : playlist
            )
          );
        }
      })
      .catch(error => console.error('Error deleting song:', error));
  };

  const renamePlaylist = (playlistId, newName) => {
    axios.post(`http://${ip}/rename-playlist`, { playlistId, newName })
      .then(response => {
        if (response.status === 200) {
          console.log(response);
          setPlaylists(prevPlaylists =>
            prevPlaylists.map(playlist =>
              playlist.id === playlistId ? { ...playlist, name: newName } : playlist
            )
          );
          ToastAndroid.show(renamePlaylistLabel[language], ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('Failed to rename playlist', ToastAndroid.SHORT);
        }
      })
      .catch(error => {
        
      });
  };


  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <InputContext.Provider value={{
      currentPlaylist,
      queue,
      language,
      searchBar,
      searchBy,
      playing,
      currentSong,
      showMusic,
      searchResults,
      handleSearchResults,
      handleCurrentPlaylist,
      handleQueue,
      playlists, handlePlaylists, handlePlaylist,
      handleDelete,
      renamePlaylist,
      handleLanguage,
      handleSearchBar,
      handleSearchBy,
      setPlaying,
      handleShowMusic,
      handleCurrentSong,
      setCurrentSong,
      playNext,
      playPrev,
      fetchPlaylists
    }}>
      {children}
    </InputContext.Provider>
  );
}

export function useInput() {
  return useContext(InputContext);
}
