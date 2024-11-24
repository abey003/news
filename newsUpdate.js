const fs = require("fs");
const csv = require("csv-parser");
const { MongoClient } = require("mongodb");

// MongoDB connection details
const uri = "mongodb+srv://userone:Abc123@cluster0.7r3a9jx.mongodb.net/NewsDB?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB connection string
const dbName = "NewsDB"; // Replace with your database name

// List of CSV files and their corresponding collections
const csvFiles = [
  { file: "general.csv", collection: "latestDB" },
  { file: "technology.csv", collection: "technologyDB" },
  { file: "business.csv", collection: "businessDB" },
  { file: "health.csv", collection: "healthDB" },
  { file: "science.csv", collection: "scienceDB" },
  { file: "sports.csv", collection: "sportsDB" },
];

async function uploadCSVToMongoDB() {
  const client = new MongoClient(uri);

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log(`Connected to database: ${dbName}`);

    const db = client.db(dbName);

    for (const { file, collection } of csvFiles) {
      console.log(`Processing file: ${file} for collection: ${collection}`);

      const records = [];

      try {
        // Read the CSV file
        await new Promise((resolve, reject) => {
          fs.createReadStream(file)
            .pipe(csv())
            .on("data", (row) => records.push(row))
            .on("end", resolve)
            .on("error", reject);
        });

        console.log(`Parsed ${records.length} records from ${file}.`);

        const collectionRef = db.collection(collection);

        // Clear existing data in the collection
        await collectionRef.deleteMany({});
        console.log(`Cleared existing data in collection: ${collection}`);

        // Insert new data
        if (records.length > 0) {
          const result = await collectionRef.insertMany(records);
          console.log(`Inserted ${result.insertedCount} documents into collection: ${collection}`);
        } else {
          console.log(`No records found in ${file}. Skipping insertion.`);
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    }
  } catch (error) {
    console.error("Error uploading data to MongoDB:", error);
  } finally {
    // Ensure MongoDB connection is closed
    await client.close();
    console.log("Closing MongoDB connection.");
  }
}

// Execute the function
uploadCSVToMongoDB();
