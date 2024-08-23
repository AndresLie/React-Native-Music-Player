import React, { useCallback } from 'react';
import { View } from 'native-base';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useInput } from '@/context/InputContext';

const PlayerComponent = React.memo(() => {
  const { playing, currentSong, setPlaying } = useInput();

  const onStateChange = useCallback((state) => {
    console.log(`Player state changed: ${state}`);
    if (state === 'ended') {
      setPlaying(false);
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

export default PlayerComponent;
