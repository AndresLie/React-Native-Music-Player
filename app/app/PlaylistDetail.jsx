import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { MusicCard } from '@/components/Card/MusicCard';
import { useInput } from '@/context/InputContext';
import { Icon } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import {selectLabel,footerLabel} from '@/label/playlistDetailLabel'
import { MusicCardSkeleton } from '@/components/MusicCardSkeleton';
import {ip} from '@/backend_ip'

export default function PlaylistDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { playlistId, playlistName,songCount } = route.params;
  const [songs, setSongs] = useState([]);
  const { handleCurrentPlaylist, handleDelete,handleQueue,language } = useInput();
  const [isSelect, setIsSelect] = useState(false);
  const [selected, setSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => 
    // Fetch playlist details from the server
    getSongs(), [playlistId]);

  const getSongs=() => {
    // Fetch playlist details from the server
    axios.get(`http://${ip}/playlist/${playlistId}`)
      .then(response => {
        setSongs(response.data.songs);
        handleCurrentPlaylist(response.data.songs);
        setIsLoading(()=>false)
      })
      .catch(error => console.error('Error fetching playlist details:', error));
  }

  const toggleRemove = () => {
    const vidIds = Object.keys(selected);
    for(var i=0;i<vidIds.length;i++){
      handleDelete(vidIds[i],playlistId)
    }
    const newSongs = songs.filter(song => !vidIds.includes(song.id.videoId));
    console.log(newSongs);
    setSongs(newSongs)
    setSelected(false)
    setIsSelect(()=>false)
  };

  const toggleAddToQueue = () => {
    const vidIds = Object.keys(selected);
    const newSongs = songs.filter(song => vidIds.includes(song.id.videoId));
    handleQueue((queue) => [...queue, ...newSongs]);
  };

  const handleSelecting=(song)=>{
    setSelected((val)=>[...val,song])

  }


  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon as={Ionicons} name="arrow-back" size="2xl" color="#007BFF" />
        </TouchableOpacity>
        <Text style={styles.header}>{playlistName}</Text>
        <TouchableOpacity onPress={() => { setIsSelect(val => !val) }} style={styles.selectButton}>
          <Text style={styles.selectButtonText}>{isSelect ? selectLabel[language][1] : selectLabel[language][0]}</Text>
        </TouchableOpacity>
      </View>
      {isLoading?
      <MusicCardSkeleton customWidth='100%' count={songCount}/>
      :(<FlatList
        data={songs}
        keyExtractor={(item) => item.id.videoId}
        renderItem={({ item }) => <MusicCard song={item} fromSearch={false} isSelect={isSelect} setSelectedPlaylists={setSelected} selectedPlaylists={selected} />}
        contentContainerStyle={styles.flatListContent}
      />)
      }
      {isSelect && (
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity style={styles.bottomButton} onPress={toggleRemove}>
            <Icon as={Ionicons} name="remove-circle-outline" size="md" color="#ff0000" />
            <Text style={styles.bottomButtonText}>{footerLabel[language][0]}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton} onPress={toggleAddToQueue}>
            <Icon as={Ionicons} name="add-circle-outline" size="md" color="#007BFF" />
            <Text style={styles.bottomButtonText}>{footerLabel[language][1]}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 15,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    flex: 1,
  },
  selectButton: {
    marginLeft: 'auto',
  },
  selectButtonText: {
    color: '#007BFF',
    fontSize: 18,
  },
  flatListContent: {

  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: 'white',
  },
  bottomButton: {
    alignItems: 'center',
    width: '50%',
  },
  bottomButtonText: {
    color: '#007BFF',
    fontSize: 16,
  },
});
