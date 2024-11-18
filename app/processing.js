import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ProcessingOverlay } from "../components/ProcessingOverlay";
import { appwriteService } from "../services/appwrite";
import { THEME } from "../constants/theme";

export default function Processing() {
  const [progress, setProgress] = useState(0);
  const { fileId, fileName } = useLocalSearchParams();

  useEffect(() => {
    processFile();
  }, []);

  const processFile = async () => {
    try {
      setProgress(10);

      // Get file URL from Appwrite
      const fileUrl = appwriteService.getFileUrl(fileId);

      // Simulate processing steps
      await simulateProcessing();

      // Save result
      const result = {
        fileId,
        fileName,
        processedAt: new Date().toISOString(),
        notes: [], // We'll add actual notes later
      };

      await appwriteService.saveResult(result);

      // Navigate to results
      router.replace({
        pathname: "/results",
        params: { result: JSON.stringify(result) },
      });
    } catch (error) {
      console.error("Processing error:", error);
      Alert.alert(
        "Processing Error",
        "Failed to process the file. Please try again.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  };

  const simulateProcessing = async () => {
    // Temporary function to simulate processing steps
    const steps = [30, 50, 70, 90, 100];
    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProgress(step);
    }
  };

  return (
    <View style={styles.container}>
      <ProcessingOverlay progress={progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
});
