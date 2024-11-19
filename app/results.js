// app/results.js
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { THEME } from "../constants/theme";
import { AnnotatedPDF } from "../components/AnnotatedPDF";
import { appwriteService } from "../services/appwrite";

export default function Results() {
  const params = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFile();
  }, [params.fileId]);

  const loadFile = async () => {
    try {
      if (!params.fileId) {
        throw new Error("No file ID provided");
      }

      // Get the file URL from Appwrite
      const url = appwriteService.getFileUrl(params.fileId);
      console.log("File URL generated:", url);
      setFileUrl(url);

      // Process the first page
      await processPage(1);
    } catch (err) {
      console.error("Error loading file:", err);
      setError(err.message);
    }
  };

  const processPage = async (pageNumber) => {
    try {
      setIsProcessing(true);

      // For now, using mock annotations
      const mockAnnotations = [
        {
          id: "note1",
          type: "note",
          position: { x: 100, y: 150 },
          value: "C4",
        },
        {
          id: "note2",
          type: "note",
          position: { x: 200, y: 150 },
          value: "E4",
        },
      ];

      setAnnotations(mockAnnotations);
    } catch (err) {
      console.error("Error processing page:", err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePageChange = async (page, dimensions) => {
    console.log("Page changed:", page, "Dimensions:", dimensions);
    setCurrentPage(page);
    await processPage(page);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fileUrl ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Sheet Music Analysis</Text>
            <Text style={styles.subtitle}>Page {currentPage}</Text>
          </View>

          <View style={styles.pdfContainer}>
            <AnnotatedPDF
              fileUrl={fileUrl}
              annotations={annotations}
              onPageChange={handlePageChange}
            />

            {isProcessing && (
              <View style={styles.overlay}>
                <ActivityIndicator size='large' color={THEME.colors.primary} />
                <Text style={styles.processingText}>
                  Processing page {currentPage}...
                </Text>
              </View>
            )}
          </View>

          {!isProcessing && annotations.length > 0 && (
            <View style={styles.resultsBar}>
              <Text style={styles.resultsText}>
                Found {annotations.length} notes
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator size='large' color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading PDF...</Text>
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
    padding: 16,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: THEME.colors.text,
  },
  resultsBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  resultsText: {
    fontSize: 16,
    color: THEME.colors.text,
    textAlign: "center",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: THEME.colors.text,
  },
  errorText: {
    padding: 16,
    color: "red",
    textAlign: "center",
  },
});
