// app/results.js
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
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
  const [dimensions, setDimensions] = useState(null);
  const [error, setError] = useState(null);

  const fileUrl = appwriteService.getFileUrl(params.fileId);

  useEffect(() => {
    processPage();
  }, [currentPage]);

  const processPage = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      console.log(
        "Processing page",
        currentPage,
        "with dimensions:",
        dimensions
      );

      const notes = await processMusicSheet(fileUrl, currentPage, dimensions);
      console.log("Detected notes:", notes);

      setAnnotations(notes);
    } catch (error) {
      console.error("Processing error:", error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePageChange = (page, pageDimensions) => {
    console.log("Page changed to:", page, "with dimensions:", pageDimensions);
    setCurrentPage(page);
    setDimensions(pageDimensions);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sheet Music Analysis</Text>
        <Text style={styles.subtitle}>
          {params.fileName} - Page {currentPage}
        </Text>
      </View>

      <View style={styles.pdfContainer}>
        <AnnotatedPDF
          fileUrl={fileUrl}
          annotations={annotations}
          onPageChange={handlePageChange}
        />
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size='large' color={THEME.colors.primary} />
            <Text style={styles.processingText}>Processing Sheet Music...</Text>
          </View>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={processPage}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isProcessing && !error && annotations.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            Found {annotations.length} musical notes
          </Text>
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
  header: {
    padding: THEME.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  pdfContainer: {
    flex: 1,
    position: "relative",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    marginTop: THEME.spacing.medium,
    color: THEME.colors.text,
    fontSize: 16,
  },
  errorContainer: {
    padding: THEME.spacing.medium,
    backgroundColor: "#ffebee",
    alignItems: "center",
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: THEME.spacing.small,
  },
  retryButton: {
    padding: THEME.spacing.small,
    backgroundColor: THEME.colors.primary,
    borderRadius: 4,
  },
  retryText: {
    color: "#fff",
  },
  resultsContainer: {
    padding: THEME.spacing.medium,
    backgroundColor: "#e3f2fd",
  },
  resultsText: {
    color: THEME.colors.text,
    textAlign: "center",
  },
});
