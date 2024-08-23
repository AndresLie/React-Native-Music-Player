import { Select, Box, CheckIcon } from "native-base";
import { StyleSheet, View } from "react-native";
import React from 'react';
import { useInput } from "@/context/InputContext";

export function PlaylistSelector() {
  const { searchBy, handleSearchBy, language } = useInput();
  const selectItemLabel = {
    en: ["Delete Playlist"],
    zh: ["刪除列表"],
    id: ['Hapus Koleksi']
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
