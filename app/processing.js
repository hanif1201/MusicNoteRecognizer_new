import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { THEME } from "../constants/theme";
import { useLocalSearchParams } from "expo-router";

export default function Processing() {
  const { fileName } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Processing {fileName}...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
  },
  text: {
    fontSize: 18,
    color: THEME.colors.text,
  },
});
