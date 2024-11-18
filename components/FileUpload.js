import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { THEME } from "../constants/theme";

export const FileUpload = ({ onFileSelect, isLoading }) => {
  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      console.log("Document picker result:", result);

      if (!result.canceled && result.assets && result.assets[0]) {
        // Maintain the exact structure with mimeType
        const file = {
          uri: result.assets[0].uri,
          mimeType: result.assets[0].mimeType, // Keep as mimeType
          name: result.assets[0].name,
          size: result.assets[0].size,
        };

        console.log("Processed file:", file);
        onFileSelect(file);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error("Document picking error:", err);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={handleFilePick}
      disabled={isLoading}
    >
      <Text style={styles.buttonText}>
        {isLoading ? "Processing..." : "Select Sheet Music PDF"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: THEME.spacing.medium,
    paddingHorizontal: THEME.spacing.xlarge,
    borderRadius: 25,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: THEME.colors.background,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
