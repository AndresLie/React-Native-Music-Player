import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Input, Box, Button, FormControl, WarningOutlineIcon, Icon, HStack, Center } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { MusicCard } from '@/components/MusicCard';
import { InputSelector } from '@/components/Selector/InputSelector';
import { LanguageSelector } from '@/components/Selector/LanguageSelector';
import { useInput } from '@/context/InputContext';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import STTClient from '@/features/STT';
import styles from '@/app/styles/indexStyles';
import {headerLabel,searchLabel,errorDetectionLabel,inputPlaceholderLabel} from '@/label/indexLabel'
import { LoadingSpinner } from '../../components/Spinner';
import { MusicCardSkeleton } from '../../components/MusicCardSkeleton';
import { Playing } from '../../components/Playing';


export default function HomeScreen() {
  const { searchBar, handleSearchBar, language, searchBy,showMusic,results,handleResult } = useInput();
  const [emptySearch, setEmptySearch] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [audioPermissionsGranted, setAudioPermissionsGranted] = useState(false);
  const [isLoading,setIsLoading]=useState(false)
  const [isLoadingList,setIsLoadingList]=useState(false)

  useEffect(() => {
    const requestPermissions = async () => {
      console.log("Requesting audio permissions...");
      const { status } = await Audio.requestPermissionsAsync();
      if (status === 'granted') {
        console.log("Audio permissions granted");
        setAudioPermissionsGranted(true);
      } else {
        console.error('Permission to access microphone was denied');
        Alert.alert('Error', 'Permission to access microphone was denied');
      }
    };

    requestPermissions();
  }, []);


  const handleInputChange = (e) => handleSearchBar(e.nativeEvent.text);

  const search = async () => {
    if (!searchBar) {
      setEmptySearch(true);
      return;
    }
    setIsLoadingList(()=>true)
    setEmptySearch(false);
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          part: 'snippet',
          type: 'video',
          q: searchBar,
          videoCategoryId: '10', // Music category
          key: 'AIzaSyAJzV3ZNSlPXpIyP-Vqn4bdHGETaglQHlM', 
          maxResults:8,
        }
      });

      const videoDetailsPromises = response.data.items.map(async (item) => {
        const videoDetailsResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
          params: {
            part: 'contentDetails,status',
            id: item.id.videoId,
            key: 'AIzaSyAJzV3ZNSlPXpIyP-Vqn4bdHGETaglQHlM' // Replace with your YouTube API key
          }
        });

        const videoDetails = videoDetailsResponse.data.items[0];
        return {
          ...item,
          embeddable: videoDetails.status.embeddable
        };
      });

      const detailedResults = await Promise.all(videoDetailsPromises);
      const embeddableResults = detailedResults.filter(item => item.embeddable);
      handleResult(embeddableResults);
      console.log(embeddableResults[0]);
    } catch (error) {
      console.error('Error searching for tracks:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to search for tracks. Please try again later.');
    }
    setIsLoadingList(()=>false)
  };

  const onStartRecord = async () => {
    if (!audioPermissionsGranted) {
      Alert.alert('Error', 'Audio permissions not granted');
      return;
    }

    try {
      console.log("Starting recorder...");
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });
      await recording.startAsync();
      setRecording(recording);
      setIsRecording(true);
      console.log("Recorder started");
    } catch (error) {
      console.error('Failed to start recorder:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const onStopRecord = async () => {
    if (recording) {
        setIsLoading(()=>true)
        console.log("Stopping recorder...");
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped and saved at:', uri);

        if (searchBy === 'TrackInfo') {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            console.log('Recording converted to base64');

            const sttClient = new STTClient();
            try {
                let transcribedText = await sttClient.askForService(base64, language);
                transcribedText = transcribedText.replace("。", "");
                console.log('Transcribed Text:', transcribedText);
                handleSearchBar(transcribedText);
            } catch (error) {
                console.error('STT Error:', error);
                Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
            }
        } else if (searchBy === 'Detector') {
            console.log('Detector On');
            try {
                const formData = new FormData();
                formData.append('file', {
                    uri: uri,
                    name: 'audio.wav',
                    type: 'audio/wav'
                });

                const response = await fetch('http://192.168.137.1:5000/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const res = await response.json();
                console.log(res);
                res!='Unknown Title'?handleSearchBar(res):Alert.alert(errorDetectionLabel[language][0],errorDetectionLabel[language][1] )
            } catch (error) {
                console.error('Detect Song Error:', error);
                Alert.alert('Error', 'Failed to detect song. Please try again.');
            }
        }
        setIsLoading(()=>false)
    } else {
        console.error('No recording instance found');
        Alert.alert('Error', 'No recording instance found. Please try again.');
    }
};

  return (
    <View style={styles.container}>
      <Box style={styles.header}>
        <Text style={styles.headerText}>{headerLabel[language]}</Text>
      </Box>
      <View style={[styles.selectorWrapper, isRecording && styles.disabled]}>
        <InputSelector />
      </View>
      <View style={[styles.inputWrapper, isRecording && styles.disabled]}>
        <FormControl width='75%' isInvalid={emptySearch} style={styles.FormControl}>
          <Input
            variant="rounded"
            placeholder={inputPlaceholderLabel[language]}
            style={styles.input}
            onChange={handleInputChange}
            value={searchBar}
            isDisabled={isRecording} // Disable input when recording
          />
          {emptySearch && (
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />} style={styles.errorMessage}>
              Search must not be empty.
            </FormControl.ErrorMessage>
          )}
        </FormControl>
        <Button size="md" variant="outline" style={styles.button} onPress={search} isDisabled={isRecording}>
          {searchLabel[language]}
        </Button>
      </View>
      {/* style={[styles.languageWrapper, isRecording && styles.disabled]} */}
      <HStack style={styles.controlWrapper}>
        <Center w="50%" style={{ /* Other styles for Center 1 */ }}>
          {showMusic&&<Playing />}
        </Center>
        <Center w="20%" style={{ /* Other styles for Center 2 */ }}>
          <LanguageSelector />
        </Center>
        <Center w="20%" style={{}}>
          <TouchableOpacity onPressIn={onStartRecord} onPressOut={onStopRecord} style={styles.micButton}>
            <Icon as={Ionicons} name={isRecording ? "mic-off" : "mic"} size="md" color={isRecording ? "red" : "black"} />
          </TouchableOpacity>
        </Center>
      </HStack>
      {!isLoading && !isLoadingList?
      <FlatList
        contentContainerStyle={styles.flatListContent}
        data={results}
        keyExtractor={(item) => item.id.videoId}
        renderItem={({ item }) => <MusicCard song={item} />}
        scrollEnabled={!isRecording} 
      />
      :
      (isLoading?<LoadingSpinner />:<MusicCardSkeleton />)
      }
    </View>
  );
}
