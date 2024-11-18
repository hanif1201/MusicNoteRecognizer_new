// app/processing.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ProcessingOverlay } from "../components/ProcessingOverlay";
import { appwriteService } from "../services/appwrite";
import { THEME } from "../constants/theme";
import { useLocalSearchParams, router } from "expo-router";

export default function Processing() {
  const [progress, setProgress] = useState(0);
  const { fileId, fileName } = useLocalSearchParams();

  useEffect(() => {
    processPDF();
  }, []);

  const processPDF = async () => {
    try {
      setProgress(50);

      const pageData = {
        pageNumber: 1,
        notes: [],
        dimensions: {
          width: 595,
          height: 842,
        },
      };

      const result = await appwriteService.saveResult({
        fileId,
        fileName,
        processedAt: new Date().toISOString(),
        totalPages: 1,
        pageData: JSON.stringify(pageData), // Stringify for storage
      });

      setProgress(100);

      // Pass the stringified data directly
      router.replace({
        pathname: "/results",
        params: {
          fileId,
          fileName,
          resultId: result.$id,
          pageData: JSON.stringify(pageData), // Add stringified pageData to params
        },
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
