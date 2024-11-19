// components/AnnotatedPDF.js
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";

export const AnnotatedPDF = ({ fileUrl, annotations, onPageChange }) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.8.335/pdf.min.js"></script>
        <style>
          body { margin: 0; }
          #viewer { width: 100%; height: 100vh; }
          .annotation {
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: rgba(33, 150, 243, 0.3);
            border: 1px solid #2196F3;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div id="viewer"></div>
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.8.335/pdf.worker.min.js';
          
          const loadPDF = async () => {
            try {
              const pdf = await pdfjsLib.getDocument('${fileUrl}').promise;
              const page = await pdf.getPage(1);
              const scale = 1.5;
              const viewport = page.getViewport({ scale });
              
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              
              await page.render({
                canvasContext: context,
                viewport: viewport
              }).promise;
              
              document.getElementById('viewer').appendChild(canvas);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'pageLoaded',
                dimensions: {
                  width: viewport.width,
                  height: viewport.height
                }
              }));
            } catch (error) {
              console.error('Error loading PDF:', error);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                error: error.message
              }));
            }
          };

          loadPDF();
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === "pageLoaded") {
        onPageChange && onPageChange(1, message.dimensions);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
      />
      <View style={styles.annotationLayer} pointerEvents='none'>
        {annotations?.map((annotation, index) => (
          <View
            key={index}
            style={[
              styles.annotation,
              {
                left: annotation.position.x,
                top: annotation.position.y,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get("window").width,
  },
  webview: {
    flex: 1,
  },
  annotationLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  annotation: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(33, 150, 243, 0.3)",
    borderWidth: 1,
    borderColor: "#2196F3",
  },
});
