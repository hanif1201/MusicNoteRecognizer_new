// components/AnnotatedPDF.js
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { APPWRITE_CONFIG } from "../constants/config";

export const AnnotatedPDF = ({
  fileUrl,
  annotations,
  onPageChange,
  onImageData,
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
          body { margin: 0; padding: 0; background: #f5f5f5; }
          #viewerContainer { 
            width: 100vw; 
            height: 100vh; 
            display: flex;
            justify-content: center;
            overflow: auto;
          }
          #viewer { 
            position: relative;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .annotation {
            position: absolute;
            width: 24px;
            height: 24px;
            border-radius: 12px;
            background-color: rgba(33, 150, 243, 0.3);
            border: 2px solid #2196F3;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #2196F3;
            font-weight: bold;
            pointer-events: none;
            transform: translate(-50%, -50%);
          }
        </style>
      </head>
      <body>
        <div id="viewerContainer">
          <div id="viewer"></div>
        </div>
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          async function loadPDF() {
            try {
              console.log('Loading PDF from:', '${fileUrl}');
              
              const loadingTask = pdfjsLib.getDocument({
                url: '${fileUrl}',
                withCredentials: true,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true,
              });

              const pdf = await loadingTask.promise;
              console.log('PDF loaded, pages:', pdf.numPages);
              
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

              // Send dimensions and image data
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'imageData',
                data: {
                  width: canvas.width,
                  height: canvas.height,
                  pixels: Array.from(imageData.data)
                }
              }));

              // Create annotations layer
              const annotationsLayer = document.createElement('div');
              annotationsLayer.style.position = 'absolute';
              annotationsLayer.style.top = '0';
              annotationsLayer.style.left = '0';
              annotationsLayer.style.width = '100%';
              annotationsLayer.style.height = '100%';
              annotationsLayer.style.pointerEvents = 'none';
              document.getElementById('viewer').appendChild(annotationsLayer);

              // Add annotations
              ${JSON.stringify(annotations || [])}.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = 'annotation';
                noteElement.style.left = note.position.x + 'px';
                noteElement.style.top = note.position.y + 'px';
                noteElement.textContent = note.value;
                annotationsLayer.appendChild(noteElement);
              });

            } catch (error) {
              console.error('Error loading PDF:', error);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                error: error.toString()
              }));
            }
          }

          loadPDF().catch(console.error);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View
        source={{ html }}
        style={styles.webview}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === "imageData") {
              onImageData && onImageData(message.data);
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
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error:", nativeEvent);
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
