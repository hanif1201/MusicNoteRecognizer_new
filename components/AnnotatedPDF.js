// components/AnnotatedPDF.js
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Pdf from "react-native-pdf";

export const AnnotatedPDF = ({ fileUrl, annotations, onPageChange }) => {
  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri: fileUrl }}
        style={styles.pdf}
        onPageChanged={onPageChange}
        enablePaging={true}
      />
      {/* Annotation layer will go here */}
      <View style={styles.annotationLayer}>
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
  pdf: {
    flex: 1,
    width: "100%",
  },
  annotationLayer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
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
