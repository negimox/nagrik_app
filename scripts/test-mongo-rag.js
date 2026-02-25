#!/usr/bin/env node

/**
 * MongoDB RAG Integration Test Script
 *
 * This script tests the MongoDB RAG integration by:
 * 1. Checking MongoDB connection
 * 2. Verifying sample data
 * 3. Testing RAG queries
 * 4. Validating API endpoints
 */

const { MongoClient } = require("mongodb");

async function testMongoDBConnection() {
  console.log("🔍 Testing MongoDB Connection...");

  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    await client.connect();
    console.log("✅ MongoDB connection successful");

    const db = client.db(process.env.MONGODB_DB_NAME || "report_dashboard");
    const reportsCollection = db.collection("reports");

    // Check if reports collection exists and has data
    const reportCount = await reportsCollection.countDocuments();
    console.log(`📊 Found ${reportCount} reports in database`);

    if (reportCount === 0) {
      console.log("⚠️  No reports found. Creating sample data...");
      await createSampleReports(reportsCollection);
    }

    // Test a simple query
    const sampleReports = await reportsCollection.find().limit(3).toArray();
    console.log("📄 Sample reports:");
    sampleReports.forEach((report) => {
      console.log(`  - ${report.title} (${report.category})`);
    });

    await client.close();
    console.log("✅ MongoDB test completed");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    return false;
  }

  return true;
}

async function createSampleReports(collection) {
  const sampleReports = [
    {
      title: "Pothole on Main Street",
      description: "Large pothole causing traffic issues near the intersection",
      category: "Roads & Transportation",
      status: "open",
      priority: "high",
      location: {
        address: "123 Main Street",
        coordinates: { lat: 40.7128, lng: -74.006 },
        ward: "Ward 1",
        district: "Downtown",
      },
      reporter: {
        id: "user1",
        name: "John Doe",
        email: "john@example.com",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ["pothole", "traffic", "urgent"],
    },
    {
      title: "Street Light Not Working",
      description: "Street light has been out for 3 days on Oak Avenue",
      category: "Lighting",
      status: "in_progress",
      priority: "medium",
      location: {
        address: "456 Oak Avenue",
        coordinates: { lat: 40.7589, lng: -73.9851 },
        ward: "Ward 2",
        district: "Residential",
      },
      reporter: {
        id: "user2",
        name: "Jane Smith",
        email: "jane@example.com",
      },
      assignedTo: {
        id: "tech1",
        name: "Mike Johnson",
        department: "Electrical",
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(),
      tags: ["lighting", "electrical", "safety"],
    },
    {
      title: "Water Leak in Park",
      description: "Pipe burst in Central Park causing flooding",
      category: "Water & Drainage",
      status: "resolved",
      priority: "urgent",
      location: {
        address: "Central Park",
        coordinates: { lat: 40.7829, lng: -73.9654 },
        ward: "Ward 3",
        district: "Parks",
      },
      reporter: {
        id: "user3",
        name: "Bob Wilson",
        email: "bob@example.com",
      },
      assignedTo: {
        id: "tech2",
        name: "Sarah Davis",
        department: "Water Services",
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ["water", "flooding", "emergency"],
    },
  ];

  await collection.insertMany(sampleReports);
  console.log("✅ Sample reports created");
}

async function testAPIEndpoints() {
  console.log("\n🔍 Testing API Endpoints...");

  try {
    // Test analytics endpoint
    console.log("Testing /api/rag/analytics...");
    const analyticsResponse = await fetch(
      "http://localhost:3000/api/rag/analytics"
    );

    if (analyticsResponse.ok) {
      const analytics = await analyticsResponse.json();
      console.log("✅ Analytics endpoint working");
      console.log(
        `📊 Analytics: ${analytics.totalReports} reports, ${analytics.resolvedReports} resolved`
      );
    } else {
      console.log(
        "⚠️  Analytics endpoint not responding (server may not be running)"
      );
    }

    // Test RAG query endpoint
    console.log("Testing /api/rag...");
    const ragResponse = await fetch("http://localhost:3000/api/rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "What are the most common infrastructure issues?",
        systemContext: "You are an infrastructure analyst.",
      }),
    });

    if (ragResponse.ok) {
      const result = await ragResponse.json();
      console.log("✅ RAG endpoint working");
      console.log(
        `🤖 Sample response: ${result.response.substring(0, 100)}...`
      );
    } else {
      console.log(
        "⚠️  RAG endpoint not responding (server may not be running)"
      );
    }
  } catch (error) {
    console.log("⚠️  API endpoints not accessible (server may not be running)");
    console.log("💡 Start the development server with: npm run dev");
  }
}

function checkEnvironmentVariables() {
  console.log("🔍 Checking Environment Variables...");

  const requiredVars = ["MONGODB_URI", "GEMINI_API_KEY"];

  const optionalVars = ["MONGODB_DB_NAME", "SUPABASE_URL", "SUPABASE_ANON_KEY"];

  let allRequired = true;

  requiredVars.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`❌ ${varName} is missing`);
      allRequired = false;
    }
  });

  optionalVars.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set (optional)`);
    } else {
      console.log(`⚠️  ${varName} is not set (optional)`);
    }
  });

  if (!allRequired) {
    console.log("\n❌ Missing required environment variables!");
    console.log("💡 Create a .env.local file with the required variables");
    return false;
  }

  console.log("✅ All required environment variables are set");
  return true;
}

async function main() {
  console.log("🚀 MongoDB RAG Integration Test\n");

  // Check environment variables
  const envCheck = checkEnvironmentVariables();
  if (!envCheck) {
    process.exit(1);
  }

  console.log("");

  // Test MongoDB connection
  const mongoCheck = await testMongoDBConnection();
  if (!mongoCheck) {
    console.log("❌ MongoDB tests failed");
    process.exit(1);
  }

  // Test API endpoints (optional)
  await testAPIEndpoints();

  console.log("\n🎉 MongoDB RAG Integration Test Complete!");
  console.log("\n📚 Next Steps:");
  console.log("1. Start the development server: npm run dev");
  console.log("2. Visit: http://localhost:3000/citizen/mongo-rag-demo");
  console.log("3. Try asking questions about infrastructure reports");
}

// Run the test
main().catch(console.error);
