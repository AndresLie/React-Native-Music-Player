import { Select, Box, CheckIcon } from "native-base";
import { StyleSheet, View } from "react-native";
import React from 'react';
import { useInput } from "@/context/InputContext";

export function InputSelector() {
  const { searchBy, handleSearchBy, language } = useInput();
  const selectItemLabel = {
    en: ["By Track Name", 'Song Detector'],
    zh: ["歌名搜尋", '歌曲偵測器'],
    id: ['Cari Lagu', 'Pendeteksi Lagu']
  };

  return (
    <View style={style.selector}>
      <Box w="100%">
        <Select
          selectedValue={searchBy}
          minWidth="100%"
          accessibilityLabel="Choose Input Type"
          placeholder="Choose Input Type"
          _selectedItem={{
            bg: "teal.600",
            endIcon: <CheckIcon size="5" />,
          }}
          height="36px" // Set a fixed height for the Select component
          onValueChange={(itemValue) => handleSearchBy(itemValue)}
          borderRadius={50}
        >
          <Select.Item label={selectItemLabel[language][0]} value="TrackInfo" />
          <Select.Item label={selectItemLabel[language][1]} value="Detector" />
        </Select>
      </Box>
    </View>
  );
}

const style = StyleSheet.create({
  selector: {
    flex: 1,
  },
});
