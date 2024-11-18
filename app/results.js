import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { THEME } from "../constants/theme";

export default function Results() {
  const { result } = useLocalSearchParams();
  const parsedResult = JSON.parse(result);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Processing Complete</Text>
      <Text style={styles.text}>File: {parsedResult.fileName}</Text>
      <Text style={styles.text}>Processed at: {parsedResult.processedAt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: THEME.spacing.large,
    backgroundColor: THEME.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: THEME.spacing.large,
    color: THEME.colors.text,
  },
  text: {
    fontSize: 16,
    marginBottom: THEME.spacing.medium,
    color: THEME.colors.text,
  },
});
