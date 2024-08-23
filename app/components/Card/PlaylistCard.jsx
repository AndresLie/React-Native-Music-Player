import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet,Alert  } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Menu, Pressable, Box, Modal, FormControl, Input, Button } from 'native-base';
import { useInput } from '@/context/InputContext';

export const PlaylistCard = ({ playlistImage, playlistName, songCount, deletePlaylist, playlistId }) => {
  const navigation = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState(playlistName);
  const {renamePlaylist}=useInput()

  const handlePress = () => {
    if (songCount > 0) {
      navigation.navigate('PlaylistDetail', { playlistId, playlistName,songCount });
    } else {
      alert('This playlist is empty.');
    }
  };

  const handleRename = () => {
    setIsModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleRenameConfirm = () => {
    if (newPlaylistName.trim().length === 0) {
      Alert.alert('Error', 'Playlist name cannot be empty.');
      return;
    }
    renamePlaylist(playlistId, newPlaylistName);
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    deletePlaylist(playlistId);
    setIsMenuOpen(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={handlePress} style={styles.card}>
        {playlistImage ? (
          <Image source={{ uri: playlistImage }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>{playlistName.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{playlistName}</Text>
          <Text style={styles.count}>{songCount} songs</Text>
        </View>
        <Menu
          w="190"
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          trigger={(triggerProps) => {
            return (
              <Pressable {...triggerProps} onPress={() => setIsMenuOpen(true)}>
                <MaterialIcons name="more-vert" size={24} color="#000" />
              </Pressable>
            );
          }}
        >
          <Menu.Item onPress={handleDelete}>Delete </Menu.Item>
          <Menu.Item onPress={handleRename}>Rename </Menu.Item>
        </Menu>
      </TouchableOpacity>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Rename Playlist</Modal.Header>
          <Modal.Body>
            <FormControl>
              <FormControl.Label>New Playlist Name</FormControl.Label>
              <Input
                value={newPlaylistName}
                onChangeText={(text) => setNewPlaylistName(text)}
                placeholder="Enter new playlist name"
              />
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button onPress={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onPress={handleRenameConfirm}>Confirm</Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    height: 80,  // Adjust as needed
    width: '95%',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: '#fff',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
  optionsButton: {
    padding: 10,
  },
});
