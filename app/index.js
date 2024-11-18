import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { THEME } from "../constants/theme";
import { FileUpload } from "../components/FileUpload";
import { router } from "expo-router";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (file) => {
    try {
      setIsLoading(true);
      // We'll implement the actual file upload later
      router.push({
        pathname: "/processing",
        params: {
          fileId: "test",
          fileName: file.name || "Selected PDF",
        },
      });
    } catch (error) {
      console.error(error);
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
