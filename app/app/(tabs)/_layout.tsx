import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { InputProvider, useInput } from '@/context/InputContext';
import { Playing } from '@/components/Playing';

const TabLayoutContent = () => {
  const colorScheme = useColorScheme();
  const { playing, currentSong, setPlaying, language, showMusic } = useInput();

  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, [setPlaying]);

  const tabLabel = {
    en: ['Home', 'My List'],
    zh: ['首頁', '我的列表'],
    id: ['Halaman Utama', 'Lagu Saya'],
    tai: ['', ''],
  };

  return (
    <View style={styles.container}>
      <View style={{ height: 0, overflow: 'hidden' }}>
        <YoutubePlayer
          height={50}
          play={playing}
          videoId={currentSong.id.videoId}
          onChangeState={onStateChange}
        />
      </View>
      <View style={styles.tabContainer}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: tabLabel[language][0],
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="myList"
            options={{
              title: tabLabel[language][1],
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>

    </View>
  );
};

export default function TabLayout() {
  return (
    <InputProvider>
      <NativeBaseProvider>
        <TabLayoutContent />
      </NativeBaseProvider>
    </InputProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
  },
  playingContainer: {
    position: 'absolute',
    bottom: '7.5%',
    width: '100%',
    height:'10%',
    zIndex: 1,
    backgroundColor: 'white', 
  },
});
