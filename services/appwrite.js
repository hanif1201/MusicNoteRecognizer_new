// services/appwrite.js
import { Client, Storage, Databases, ID } from "react-native-appwrite";
import { APPWRITE_CONFIG } from "../constants/config";

// Initialize the client at the module level
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(APPWRITE_CONFIG.projectId);

// Initialize storage service
const storage = new Storage(client);
const databases = new Databases(client);

class AppwriteService {
  async uploadPDF(fileInfo) {
    if (!fileInfo) return;

    try {
      console.log("Starting upload with raw file:", fileInfo);

      const asset = {
        type: fileInfo.mimeType,
        name: fileInfo.name,
        size: fileInfo.size,
        uri: fileInfo.uri,
      };

      console.log("Formatted asset for upload:", asset);

      const uploadedFile = await storage.createFile(
        APPWRITE_CONFIG.bucketId,
        ID.unique(),
        asset
      );

      console.log("Upload response:", uploadedFile);
      console.log("Upload completed, received ID:", uploadedFile.$id);

      return uploadedFile.$id;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  getFileUrl(fileId) {
    try {
      // Get base URL without adding project parameter (it's already included)
      const url = storage.getFileView(APPWRITE_CONFIG.bucketId, fileId);

      console.log("Generated file URL:", url);
      return url;
    } catch (error) {
      console.error("Error generating file URL:", error);
      throw error;
    }
  }

  async saveResult(result) {
    try {
      console.log("Saving result:", result);

      const document = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        ID.unique(),
        {
          fileId: result.fileId,
          fileName: result.fileName,
          processedAt: result.processedAt,
          totalPages: result.totalPages,
          pageData: result.pageData,
          status: "processed", // Add this required field
        }
      );

      console.log("Save response:", document);
      return document;
    } catch (error) {
      console.error("Save error:", error);
      throw error;
    }
  }
}

export const appwriteService = new AppwriteService();
