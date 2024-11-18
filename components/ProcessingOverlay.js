import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { THEME } from "../constants/theme";

export const ProcessingOverlay = ({ progress }) => (
  <View style={styles.overlay}>
    <ActivityIndicator size='large' color={THEME.colors.primary} />
    <Text style={styles.text}>{`Processing: ${Math.round(progress)}%`}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: THEME.spacing.large,
    fontSize: 18,
    color: THEME.colors.text,
  },
});
