import React, { useEffect, useRef } from "react";
import { useInput } from "@/context/InputContext";
import { Box, HStack, Text, VStack } from "native-base";
import { StyleSheet, Dimensions, View, Animated, Easing } from "react-native";
import { GestureHandlerRootView, PanGestureHandler, TapGestureHandler, LongPressGestureHandler, State } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export function Playing() {
    const { currentSong, setPlaying,handleCurrentSong,handleShowMusic,playNext,playPrev } = useInput();
    const scrollAnim = useRef(new Animated.Value(0)).current;

    if (!currentSong || !currentSong.snippet) {
        return <Text>Loading...</Text>;
    }

    const titleChunks = currentSong.snippet.title.split(" ");
    const totalTitleLength = currentSong.snippet.title.length;

    // Calculate dynamic gap size based on total title length, reduced by 60%
    const baseGap = 2; // Base gap size
    const reducedFactor = 0.4; // Reduce by 60%
    const dynamicGap = Math.max(baseGap, Math.min(baseGap + (totalTitleLength / titleChunks.length) * reducedFactor, baseGap * 2));

    // Calculate the total width required for the title including gaps
    const totalWidth = titleChunks.reduce((acc, word) => acc + (width * 0.2) + dynamicGap, 0);

    useEffect(() => {
        scrollAnim.setValue(0); // Reset the animation value

        Animated.loop(
            Animated.timing(scrollAnim, {
                toValue: -totalWidth,
                duration: titleChunks.length * 2000, // Adjust speed as needed
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [scrollAnim, titleChunks, totalWidth]);

    const onSingleTap = () => {
        console.log('Single tap detected');
        setPlaying(val => !val);
    };

    const onLongPress = () => {
        console.log('Long press detected');
    };

    const onPanHandlerStateChange = ({ nativeEvent }) => {
        if (nativeEvent.state === State.END) {
            const { translationX, translationY } = nativeEvent;
            if ( Math.abs(translationY)<translationX && translationX > 0) {
                console.log('Swipe right detected');
                playPrev()
            } else if ( Math.abs(translationY)>translationX&&translationX < 0) {
                console.log('Swipe left detected');
                playNext()
            } else if (translationY < 0) {
                handleCurrentSong({id:{videoId:0}})
                handleShowMusic(false)
                setPlaying(val => !val);
            }
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1, width: '100%' }}>
            <TapGestureHandler onHandlerStateChange={({ nativeEvent }) => nativeEvent.state === State.ACTIVE && onSingleTap()}>
                <LongPressGestureHandler onHandlerStateChange={({ nativeEvent }) => nativeEvent.state === State.ACTIVE && onLongPress()} minDurationMs={800}>
                    <PanGestureHandler onHandlerStateChange={onPanHandlerStateChange}>
                        <View style={styles.MusicNav}>
                            <Box
                                maxW="96"
                                borderWidth="1"
                                borderColor="coolGray.300"
                                bg={'coolGray.100'}
                                p="5"
                                rounded="8"
                                style={styles.MusicNav}
                            >
                                <HStack>
                                    <VStack style={{ flex: 1, justifyContent: 'center' }}>
                                        <View style={styles.carouselWrapper}>
                                            <Animated.View
                                                style={[
                                                    styles.carousel,
                                                    { transform: [{ translateX: scrollAnim }] },
                                                ]}
                                            >
                                                {titleChunks.map((item, index) => (
                                                    <View key={index} style={{ ...styles.carouselItem, width: width * 0.2, marginRight: dynamicGap }}>
                                                        <Text fontSize='xs' style={styles.title} numberOfLines={1}>
                                                            {item}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </Animated.View>
                                        </View>
                                        <Text fontSize='xs' style={styles.artist}>
                                            {currentSong.snippet.channelTitle}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        </View>
                    </PanGestureHandler>
                </LongPressGestureHandler>
            </TapGestureHandler>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    MusicNav: {
        
        overflow: 'hidden',
        height: '100%',
        padding: 0,
        zIndex: 9,
        width: '100%',
    },
    title: {
        textAlign: 'center',
    },
    artist: {
        textAlign: 'center', // Center the artist text horizontally
        paddingTop: 10, // Add padding to center vertically
    },
    carouselWrapper: {
        width: '100%',
        overflow: 'hidden',
    },
    carousel: {
        flexDirection: 'row',
    },
    carouselItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Playing;
