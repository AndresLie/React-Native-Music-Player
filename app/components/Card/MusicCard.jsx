import React, { useCallback, useEffect, useState } from 'react';
import { Box, HStack, Text, Flex, Pressable, Icon, Modal, Button, Checkbox, VStack ,useToast} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useInput } from "@/context/InputContext";
import {addToPlaylistLabel} from '@/label/indexLabel'

export function MusicCard({ song, fromSearch = true, isSelect = false, setSelectedPlaylists, selectedPlaylists}) {
  const { playing, setPlaying, handleCurrentSong, currentSong, handleShowMusic, playlists, handlePlaylist,language } = useInput();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [existed, setExisted] = useState({});
  const toast=useToast()
  useEffect(() => {
    if (currentSong.id.videoId !== 0) {
      handleShowMusic(true);
    }
  }, [currentSong]);

  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  const togglePlaying = useCallback(() => {
    if (isSelect) return;
    if (currentSong.id.videoId === song.id.videoId) {
      setPlaying((prev) => !prev);
    } else {
      handleCurrentSong(song, fromSearch);
      setPlaying(true);
    }
  }, [currentSong, song, handleCurrentSong, setPlaying, isSelect]);

  const openModal = () => {
    const playlistExistedState = playlists.reduce((acc, playlist) => {
      acc[playlist.id] = playlist.songIds && playlist.songIds.includes(song.id.videoId);
      return acc;
    }, {});
    setExisted(playlistExistedState);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };
  
  const handleCheckboxChange = (playlistId) => {
    setSelectedPlaylists((prevSelected) => ({
      ...prevSelected,
      [playlistId]: !prevSelected[playlistId],
    }));
  };


  const handleExisted = (playlistId) => {
    setExisted((prevExisted) => ({
      ...prevExisted,
      [playlistId]: !prevExisted[playlistId],
    }));
  };

  const handleOkPress = () => {
    const selectedPlaylistIds = Object.keys(existed).filter((id) => existed[id]);
    const unselectedPlaylistIds = Object.keys(existed).filter((id) => !existed[id]);

    console.log(`Selected playlists: ${selectedPlaylistIds}`);
    console.log(`Unselected playlists: ${unselectedPlaylistIds}`);

    handlePlaylist(song, selectedPlaylistIds, unselectedPlaylistIds);
    if (selectedPlaylistIds.length > 0) {
      const playlistNames = selectedPlaylistIds.map(id => playlists.find(pl => pl.id === id).name).join(', ');
      toast.show({
          description: `Successfully added to playlist(s): ${playlistNames}`,
          status: "success",
          duration: 3000,
          isClosable: true,
          placement: "top",
          variant:'sucess'

      });
  }
    closeModal();
  };

  return (
    <Box style={styles.container}>
      <Pressable onPress={togglePlaying} onLongPress={openModal} style={styles.pressable} disabled={isSelect}>
        {({ isHovered, isFocused, isPressed }) => (
          <Box
            bg={isPressed ? 'coolGray.200' : isHovered ? 'coolGray.200' : 'coolGray.100'}
            style={{ transform: [{ scale: isPressed ? 0.96 : 1 }] }}
            p="5"
            rounded="8"
            shadow={3}
            borderWidth="1"
            borderColor="coolGray.300"
            width="100%"
            maxHeight="100%" // Ensure a fixed max height
          >
            <HStack alignItems="center" justifyContent="space-between">
              <Text 
                color="coolGray.800" 
                mt="3" 
                fontWeight="medium" 
                style={styles.title} 
                numberOfLines={1} 
                ellipsizeMode="tail"
              >
                {song.snippet.title}
              </Text>
              {isSelect && (
                <Checkbox
                  value={song.id.videoId}
                  isChecked={selectedPlaylists[song.id.videoId] || false}
                  onChange={() => handleCheckboxChange(song.id.videoId)}
                  aria-label={`Select ${song.snippet.title}`}
                />
              )}
            </HStack>
            <Text mt="2" fontSize="sm" color="coolGray.700" numberOfLines={1} ellipsizeMode="tail">
              {song.snippet.channelTitle}
            </Text>
            {!isSelect && (
              <Flex direction="row" mt="2" alignItems="center">
                <Icon
                  as={Ionicons}
                  name={currentSong.id.videoId === song.id.videoId && playing ? 'pause' : 'play'}
                  size="md"
                  color="darkBlue.600"
                />
                <Text fontSize="sm" color="darkBlue.600" ml="2">
                  {currentSong.id.videoId === song.id.videoId && playing ? 'Pause' : 'Play'}
                </Text>
                {currentSong.id.videoId === song.id.videoId && playing && (
                  <>
                    <Animatable.View animation="rubberBand" delay={0} easing="ease-out" iterationCount="infinite" style={[styles.wave3]} />
                    <Animatable.View animation="rubberBand" delay={80} easing="ease-out" iterationCount="infinite" style={[styles.wave2]} />
                    <Animatable.View animation="rubberBand" delay={160} easing="ease-out" iterationCount="infinite" style={[styles.wave]} />
                  </>
                )}
                {currentSong.id.videoId === song.id.videoId && !playing && (
                  <>
                    <Animatable.View style={[styles.wave3]} />
                    <Animatable.View style={[styles.wave2]} />
                    <Animatable.View style={[styles.wave]} />
                  </>
                )}
              </Flex>
            )}
          </Box>
        )}
      </Pressable>

      <Modal isOpen={isModalVisible} onClose={closeModal}>
        <Modal.Content maxWidth="400px" style={styles.modalContent}>
          <Modal.CloseButton />
          <Modal.Header style={styles.modalHeader}>{addToPlaylistLabel[language]}</Modal.Header>
          <Modal.Body style={styles.modalBody}>
            <VStack space={4}>
              {playlists.map((item) => (
                <HStack key={item.id} justifyContent="space-between" alignItems="center" mb={2} style={styles.playlistItem}>
                  <Text style={styles.playlistText}>{item.name}</Text>
                  <Checkbox
                    value={item.id}
                    isChecked={existed[item.id] || false}
                    onChange={() => handleExisted(item.id)}
                    aria-label={`Select ${item.name}`}
                    style={styles.checkbox}
                  />
                </HStack>
              ))}
            </VStack>
          </Modal.Body>
          <Modal.Footer style={styles.modalFooter}>
            <Button onPress={handleOkPress} style={styles.okButton}>
              OK
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 5,
  },
  title: {
    overflow: 'hidden',
    fontSize: 16,
    width: '90%'
  },
  pressable: {
    width: '100%',
  },
  wave: {
    position: 'absolute',
    left: '95%',
    top: 7,
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
  wave2: {
    position: 'absolute',
    left: '89%',
    top: 7,
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
  wave3: {
    position: 'absolute',
    left: '83%',
    top: 7,
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalBody: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  modalFooter: {
    justifyContent: 'center',
    paddingBottom: 10,
  },
  okButton: {
    backgroundColor: '#007BFF',
    color: '#fff',
    width: '100%',
    textAlign: 'center',
    paddingVertical: 10,
  },
  playlistItem: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  playlistText: {
    fontSize: 16,
    color: '#333',
  },
  checkbox: {
    borderRadius: 50,
  },
});
