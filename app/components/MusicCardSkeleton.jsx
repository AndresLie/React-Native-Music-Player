import React from 'react';
import { Box, Skeleton } from 'native-base';
import { StyleSheet } from 'react-native';

export function MusicCardSkeleton({ customWidth = '95%',count=6 }) {
  const styles = StyleSheet.create({
    container: {
      width: customWidth,
      alignItems: 'center',
      marginVertical: 5,
      borderRadius: 10,
    },
  });

  return (
    <>
      {Array.from({ length:count }).map((_, index) => (
        <Box style={styles.container} key={index}>
          <Box
            paddingTop={38}
            bg="coolGray.100"
            p="5"
            rounded="8"
            shadow={3}
            borderWidth="1"
            borderColor="coolGray.300"
            width="100%"
            height="150px" // Set a higher height for the first box
          >
            <Skeleton.Text lines={2} />
            <Skeleton mt="4" height="20px" />
          </Box>
        </Box>
      ))}
    </>
  );
}
