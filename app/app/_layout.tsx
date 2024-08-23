import React, { useEffect, useCallback } from 'react';
import { NativeBaseProvider, View } from 'native-base';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { InputProvider, useInput } from '@/context/InputContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import YoutubePlayer from 'react-native-youtube-iframe';

SplashScreen.preventAutoHideAsync();

const PlayerComponent = React.memo(() => {
  const { playing, currentSong, setPlaying,playNext } = useInput();

  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      playNext()
    }
  }, [setPlaying]);

  return (
    <View style={{ height: 0, overflow: 'hidden' }}>
      <YoutubePlayer
        height={50}
        play={playing}
        videoId={currentSong.id.videoId}
        onChangeState={onStateChange}
      />
    </View>
  );
});

const RootLayoutContent = () => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="PlaylistDetail" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
        <Stack.Screen name="SongDetail" options={{ title: '' }} />
      </Stack>
    </ThemeProvider>
  );
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <NativeBaseProvider>
      <InputProvider>
        <View style={{ flex: 1 }}>
          <RootLayoutContent />
          <PlayerComponent />
        </View>
      </InputProvider>
    </NativeBaseProvider>
  );
}
