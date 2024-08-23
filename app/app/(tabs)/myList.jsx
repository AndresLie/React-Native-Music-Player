import React, { useState, useEffect } from 'react';
import { useInput } from '@/context/InputContext';
import { Box, HStack, Center, Icon, FlatList, Input, Button, Select, CheckIcon } from 'native-base';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { headerLabel } from '@/label/playlistLabel';
import { LanguageSelector } from '@/components/Selector/LanguageSelector';
import { PlaylistSelector } from '@/components/Selector/PlaylistSelector';
import { Ionicons } from '@expo/vector-icons';
import { PlaylistCard } from '@/components/Card/PlaylistCard';
import { Playing } from '../../components/Playing';
import axios from 'axios';
import {ip} from '@/backend_ip'

export default function TabTwoScreen() {
  const { language, playlists, handlePlaylists, showMusic, fetchPlaylists } = useInput();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setNewPlaylistName('');
  };

  const addPlaylist = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = {
        id: (playlists.length + 1).toString(),
        image: null, // Default to null for placeholder
        name: newPlaylistName,
        songCount: 0,
        songs: []
      };

      // Add the new playlist to the backend
      handlePlaylists(newPlaylist);
      
      closeModal();
    }
  };

  const toggleOption = (playlistId) => {
    setSelectedPlaylist(playlistId);
    setIsOptionsVisible(true);
  };

  const deletePlaylist = (id) => {
    // Call the backend to delete the playlist
    axios.post(`http://${ip}/delete-playlist`, { playlistId: id })
      .then(response => {
        fetchPlaylists(); // Re-fetch the playlists to ensure state is updated
        setIsOptionsVisible(false);
      })
      .catch(error => console.error('Error deleting playlist:', error));
  };

  return (
    <View style={styles.container}>
      <Box style={styles.header}>
        <Text style={styles.headerText}>{headerLabel[language]}</Text>
      </Box>
      <HStack style={styles.controlWrapper}>
        <Center w="50%" style={{ /* Other styles for Center 1 */ }}>
          {showMusic && <Playing />}
        </Center>
        <Center w="20%" style={{ /* Other styles for Center 2 */ }}>
          <LanguageSelector />
        </Center>
        <Center w="20%" style={{}}>
          <TouchableOpacity style={styles.addPlaylistButton} onPress={openModal}>
            <Icon as={Ionicons} name={'add'} size="md" />
          </TouchableOpacity>
        </Center>
      </HStack>
      <FlatList
        style={styles.playlist}
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlaylistCard
            playlistImage={item.image}
            playlistName={item.name}
            songCount={item.songCount ? item.songCount : 0} // Access songCount directly from item
            playlistId={item.id}
            deletePlaylist={()=>deletePlaylist(item.id)}
          />
        )}
        scrollEnabled
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Playlist</Text>
            <Input
              placeholder="Playlist Name"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              style={styles.input}
            />
            <HStack space={2} justifyContent="flex-end" style={styles.buttonContainer}>
              <Button onPress={closeModal} variant="outline">
                Cancel
              </Button>
              <Button onPress={addPlaylist}>
                Add
              </Button>
            </HStack>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: {
    paddingTop: '7%',
    backgroundColor: '#4e6af5',
    width: '100%',
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
  headerText: {
    color: 'white',
    fontSize: 25,
  },
  controlWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: '88%',
    height: '12%',
    zIndex: 9,
  },
  addPlaylistButton: {
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 20,
    zIndex: 9,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker semi-transparent background
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20, // More rounded corners for a modern look
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3, // Slightly stronger shadow
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20, // More space below the title
  },
  input: {
    width: '100%',
    marginBottom: 20, // Ensure space between the input and buttons
  },
  buttonContainer: {
    marginTop: 10, // Space between the input and the buttons
  },
  playlist: {
    width: '95%',
  },
});

