const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const app = express();

// Require dotenv to load environment variables from .env file
require("dotenv").config();

const uri = process.env.MONGO_URI; // MongoDB connection string from .env file
const dbName = "NewsDB"; // Replace with your database name

// Enable CORS for all origins (allow any domain)
app.use(cors());

// Helper function to fetch articles from a specific collection
const fetchArticlesFromDB = async (collectionName) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const articles = await collection.find({}).toArray();
    return articles;
  } catch (error) {
    console.error("Error fetching articles from MongoDB:", error);
    throw error;
  } finally {
    await client.close();
  }
};

// Endpoint to fetch general news
app.get("/latest", async (req, res) => {
  try {
    const articles = await fetchArticlesFromDB("latestDB"); // Replace 'general' with your collection name
    res.json({ status: "ok", articles });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news from database" });
  }
});

// Example endpoint for other categories (similar structure)
app.get("/business", async (req, res) => {
  try {
    const articles = await fetchArticlesFromDB("businessDB");
    res.json({ status: "ok", articles });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news from database" });
  }
});

app.get("/technology", async (req, res) => {
  try {
    const articles = await fetchArticlesFromDB("technologyDB");
    res.json({ status: "ok", articles });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news from database" });
  }
});

app.get("/health", async (req, res) => {
  try {
    const articles = await fetchArticlesFromDB("healthDB");
    res.json({ status: "ok", articles });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news from database" });
  }
});

app.get("/science", async (req, res) => {
  try {
    const articles = await fetchArticlesFromDB("scienceDB");
    res.json({ status: "ok", articles });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news from database" });
  }
});

app.get("/sports", async (req, res) => {
  try {
    const articles = await fetchArticlesFromDB("sportsDB");
    res.json({ status: "ok", articles });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news from database" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
