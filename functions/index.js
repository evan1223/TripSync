/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const { onSchedule } = require("firebase-functions/v2/scheduler");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

const BUCKET_NAME = "software-project-a060c.firebasestorage.app"; 

exports.deleteTempPicFolder = onSchedule(
  {
    schedule: '0 0 * * *',
    timeZone: 'Asia/Taipei',
  },
  async (event) => {
    const folder = 'temp/';
    const [files] = await storage.bucket(BUCKET_NAME).getFiles({ prefix: folder });

    if (files.length === 0) {
      console.log('No files found in temp/');
      return null;
    }

    const deletePromises = files.map(file => file.delete());
    await Promise.all(deletePromises);
    console.log(`Deleted ${files.length} files from ${folder}`);
    return null;
  }
);
