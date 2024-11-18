// services/appwrite.js
import { Client, Storage, Databases, ID } from "react-native-appwrite";
import { APPWRITE_CONFIG } from "../constants/config";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(APPWRITE_CONFIG.projectId);

const storage = new Storage(client);
const databases = new Databases(client); // Make sure this is initialized

class AppwriteService {
  async uploadPDF(file) {
    if (!file) return;

    try {
      console.log("Starting upload with raw file:", file);

      const { mimeType, uri, name, size } = file;
      const asset = {
        type: mimeType,
        uri,
        name,
        size,
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
    return storage.getFileView(APPWRITE_CONFIG.bucketId, fileId);
  }

  // Add the saveResult function
  async saveResult(result) {
    try {
      console.log("Saving result:", result);

      // Create the page data object
      const pageData = JSON.stringify({
        pageNumber: 1,
        notes: [],
        dimensions: {
          width: 595,
          height: 842,
        },
      });

      const document = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        ID.unique(),
        {
          fileId: result.fileId,
          fileName: result.fileName,
          processedAt: new Date().toISOString(),
          status: "processed",
          totalPages: 1,
          pageData: pageData, // Now it's a string
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

// Create and export a single instance
const appwriteService = new AppwriteService();
export { appwriteService };
