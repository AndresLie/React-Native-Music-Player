import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity,Pressable } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useInput } from '@/context/InputContext';
import { Ionicons } from '@expo/vector-icons';
import { Icon, Box, HStack, Flex } from 'native-base';
import {headerLabel} from '@/label/songDetailsLabel'
import * as Animatable from 'react-native-animatable';

const Tab = createMaterialTopTabNavigator();

function SongInfo() {
  const { currentSong, playNext, playPrev, playing, setPlaying } = useInput();

  const togglePlayPause = useCallback(() => {
    setPlaying((val) => !val);
  }, [setPlaying]);

  return (
    <View style={styles.container}>
      <Image source={{ uri: currentSong.snippet.thumbnails.high.url }} style={styles.image} />
      <Text style={styles.title}>{currentSong.snippet.title}</Text>
      <Text style={styles.artist}>{currentSong.snippet.channelTitle}</Text>
      <View style={styles.controls}>
        <Icon as={Ionicons} name="play-skip-back" size="md" color="#007BFF" onPress={playPrev} />
        <Icon as={Ionicons} name={playing ? 'pause' : 'play'} size="md" color="#007BFF" onPress={togglePlayPause} />
        <Icon as={Ionicons} name="play-skip-forward" size="md" color="#007BFF" onPress={playNext} />
      </View>
    </View>
  );
}

function QueueList() {
    const { queue, currentSong, setCurrentSong, setPlaying } = useInput();
  
    const handlePress = (song) => {
      setCurrentSong(song);
      setPlaying(true);
    };
  
    return (
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id.videoId}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handlePress(item)}
            style={({ pressed }) => [
              styles.queueItem,
              pressed ? styles.pressedItem : null,
              currentSong.id.videoId === item.id.videoId ? styles.currentItem : null,
            ]}
          >
            {/* <Animatable.View
              animation={currentSong.id.videoId === item.id.videoId ? "pulse" : undefined}
              iterationCount="infinite"
            > */}
              <Text style={styles.queueTitle}>{item.snippet.title}</Text>
              <Text style={styles.queueArtist}>{item.snippet.channelTitle}</Text>
            {/* </Animatable.View> */}
          </Pressable>
        )}
      />
    );
  }

export default function SongDetail() {
    const { language} = useInput();
  return (
    <Tab.Navigator>
      <Tab.Screen name="SongInfo" component={SongInfo} options={{ title: headerLabel[language][0] }} />
      <Tab.Screen name="QueueList" component={QueueList} options={{ title: headerLabel[language][1] }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  queueItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  pressedItem: {
    backgroundColor: '#e0e0e0',
  },
  currentItem: {
    backgroundColor: '#d1e7ff',
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  queueArtist: {
    fontSize: 14,
    color: 'gray',
  },
});
