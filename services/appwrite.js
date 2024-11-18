import { Client, Storage, Databases, ID } from "appwrite";
import { APPWRITE_CONFIG } from "../constants/config";

class AppwriteService {
  constructor() {
    this.client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    this.storage = new Storage(this.client);
    this.databases = new Databases(this.client);
  }

  async uploadPDF(file) {
    try {
      const response = await this.storage.createFile(
        APPWRITE_CONFIG.bucketId,
        ID.unique(),
        file
      );
      return response.$id;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  async saveResult(result) {
    try {
      return await this.databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        ID.unique(),
        result
      );
    } catch (error) {
      console.error("Save error:", error);
      throw error;
    }
  }

  getFileUrl(fileId) {
    return this.storage.getFileView(APPWRITE_CONFIG.bucketId, fileId);
  }
}

export const appwriteService = new AppwriteService();
