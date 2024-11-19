// components/AnnotatedPDF.js
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { APPWRITE_CONFIG } from "../constants/config";

export const AnnotatedPDF = ({ fileUrl, annotations, onPageChange }) => {
  // Add project ID to headers
  const headers = {
    "X-Appwrite-Project": APPWRITE_CONFIG.projectId,
    "Content-Type": "application/pdf",
    Accept: "application/pdf",
  };

  console.log("Attempting to load PDF with URL:", fileUrl);
  console.log("Using headers:", headers);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
          /* ... styles remain the same ... */
        </style>
      </head>
      <body>
        <div id="viewerContainer">
          <div id="viewer"></div>
        </div>
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

          async function fetchPDF() {
            try {
              console.log('Fetching PDF from:', '${fileUrl}');
              
              const response = await fetch('${fileUrl}', {
                method: 'GET',
                headers: ${JSON.stringify(headers)},
                credentials: 'include',
                mode: 'cors'
              });

              if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
              }

              const pdfData = await response.arrayBuffer();
              return new Uint8Array(pdfData);
            } catch (error) {
              console.error('Error fetching PDF:', error);
              throw error;
            }
          }

          // ... rest of the script remains the same ...
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.webview}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            console.log("Received message from WebView:", message);
            if (message.type === "dimensions") {
              onPageChange && onPageChange(1, message.data);
            } else if (message.type === "error") {
              console.error("PDF viewer error:", message.error);
            }
          } catch (error) {
            console.error("Error handling WebView message:", error);
          }
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={["*"]}
        mixedContentMode='always'
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error:", nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView HTTP error:", nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get("window").width,
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
  },
});
