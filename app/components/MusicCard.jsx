import React, { useCallback, useEffect } from 'react';
import { Box, HStack, Text, Flex, Pressable, Icon } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useInput } from "@/context/InputContext";

export function MusicCard({ song }) {
  const { playing, setPlaying, handleCurrentSong, currentSong,handleShowMusic,playNext } = useInput();

  useEffect(
    ()=>{
      if(currentSong['id']['videoId']!=0){
        handleShowMusic(true)
      }
    },[currentSong]
  )
  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  const togglePlaying = useCallback(() => {
    if (currentSong.id.videoId === song.id.videoId) {
      setPlaying((prev) => !prev);
    } else {
      console.log(song);
      handleCurrentSong(song);
      setPlaying(true);
    }
  }, [currentSong, song, handleCurrentSong, setPlaying]);

  return (
    <Box style={styles.container}>
      <Pressable onPress={togglePlaying} style={styles.pressable}>
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
          >
            <HStack alignItems="center">
              <Text color="coolGray.800" mt="3" fontWeight="medium" style={styles.title}>
                {song.snippet.title}
              </Text>
            </HStack>
            <Text mt="2" fontSize="sm" color="coolGray.700">
              {song.snippet.channelTitle}
            </Text>
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
                  <Animatable.View animation="rubberBand" delay={0} easing="ease-out" iterationCount="infinite"  style={[styles.wave3]} />
                  <Animatable.View animation="rubberBand" delay={80} easing="ease-out" iterationCount="infinite"  style={[styles.wave2]} />
                  <Animatable.View animation="rubberBand" delay={160} easing="ease-out" iterationCount="infinite"  style={[styles.wave]} />
                </>
              )}
              {currentSong.id.videoId === song.id.videoId && !playing && (
                <>
                  <Animatable.View animation="" delay={0} easing="ease-out" iterationCount="infinite"  style={[styles.wave3]} />
                  <Animatable.View animation="" delay={80} easing="ease-out" iterationCount="infinite"  style={[styles.wave2]} />
                  <Animatable.View animation="" delay={160} easing="ease-out" iterationCount="infinite"  style={[styles.wave]} />
                </>
              )}
            </Flex>
          </Box>
        )}
      </Pressable>
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
});
