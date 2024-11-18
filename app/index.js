import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { FileUpload } from "../components/FileUpload";
import { appwriteService } from "../services/appwrite";
import { THEME } from "../constants/theme";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (fileInfo) => {
    try {
      setIsLoading(true);
      console.log("Processing file:", fileInfo);

      const fileId = await appwriteService.uploadPDF(fileInfo);
      console.log("Upload completed, received ID:", fileId);

      if (!fileId) {
        throw new Error("No file ID received from upload");
      }

      router.push({
        pathname: "/processing",
        params: {
          fileId: fileId,
          fileName: fileInfo.name,
        },
      });
    } catch (error) {
      console.error("File upload failed:", error);
      Alert.alert("Upload Error", "Failed to upload file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sheet Music Scanner</Text>
      <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.large,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: THEME.spacing.xlarge,
    color: THEME.colors.text,
  },
});
