// app/results.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { THEME } from "../constants/theme";
import { AnnotatedPDF } from "../components/AnnotatedPDF";
import { appwriteService } from "../services/appwrite";
import { processMusicSheet } from "../services/musicRecognition";

export default function Results() {
  const params = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const fileUrl = appwriteService.getFileUrl(params.fileId);

  useEffect(() => {
    processPage();
  }, [currentPage]);

  const processPage = async () => {
    try {
      setIsProcessing(true);
      // Here we'll add the music note recognition logic
      const notes = await processMusicSheet(fileUrl, currentPage);
      setAnnotations(notes);
    } catch (error) {
      console.error("Processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <AnnotatedPDF
        fileUrl={fileUrl}
        annotations={annotations}
        onPageChange={(page) => setCurrentPage(page)}
      />
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size='large' color={THEME.colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});
