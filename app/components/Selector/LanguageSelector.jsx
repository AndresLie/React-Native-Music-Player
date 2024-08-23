import React, { useState } from 'react';
import { Modal, Pressable, Text, View, StyleSheet } from 'react-native';
import { Box, Button, Center } from 'native-base';
import { useInput } from '@/context/InputContext';

export function LanguageSelector() {
  const [modalVisible, setModalVisible] = useState(false);
  const{language,handleLanguage}=useInput()
  const languageLabels = {
    en: "En",
    zh: "中",
    id: "Id",
    tai:'台'
  };
  const closeLabel={
    en:'Close',
    zh:'關閉',
    id:"Tutup",
    tai:"關閉"
  }

  const handleLanguageChange = (value) => {
    handleLanguage(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.languageSelector}>
      <Pressable onPress={() => setModalVisible(true)} style={styles.pressable}>
        <Text>{languageLabels[language] || "Language"}</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Center style={styles.modalView}>
          <Box style={styles.modalBox}>
            <Button onPress={() => handleLanguageChange("en")}>
              English
            </Button>
            <Button onPress={() => handleLanguageChange("zh")}>
              中文
            </Button>
            <Button onPress={() => handleLanguageChange("tai")}>
              台語
            </Button>
            <Button onPress={() => handleLanguageChange("id")}>
              Indonesia
            </Button>
          </Box>
          <Button onPress={() => setModalVisible(false)} style={styles.closeButton}>
            {closeLabel[language]}
          </Button>
        </Center>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  languageSelector: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    zIndex:1,
    flex:1
  },
  pressable: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    height: '40%', // Set modal height to 20%
    justifyContent: 'space-around',
  },
  closeButton: {
    marginTop: 10,
  },
});
