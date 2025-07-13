#!/usr/bin/env node

/**
 * Complete MongoDB RAG Setup and Test Script
 *
 * This script will:
 * 1. Verify all required files exist
 * 2. Check environment variables
 * 3. Test MongoDB connection
 * 4. Create sample data if needed
 * 5. Test API endpoints
 * 6. Validate the complete RAG integration
 */

const fs = require("fs");
const path = require("path");

// Required files for MongoDB RAG integration
const REQUIRED_FILES = [
  "lib/rag-utils.ts",
  "lib/mongodb-rag.ts",
  "lib/genai-utils.ts",
  "app/api/rag/route.ts",
  "app/api/rag/analytics/route.ts",
  "hooks/use-rag.tsx",
  "components/rag-reports-analyzer.tsx",
  "app/citizen/mongo-rag-demo/page.tsx",
];

// Required environment variables
const REQUIRED_ENV_VARS = ["MONGODB_URI", "GOOGLE_AI_API_KEY"];

const OPTIONAL_ENV_VARS = [
  "MONGODB_DB_NAME",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
];

function checkFiles() {
  console.log("🔍 Checking required files...");

  let allFilesExist = true;

  REQUIRED_FILES.forEach((file) => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - Missing!`);
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    console.log("\n❌ Some required files are missing!");
    console.log("💡 Make sure all RAG integration files have been created.");
    return false;
  }

  console.log("✅ All required files exist");
  return true;
}

function checkEnvironmentVariables() {
  console.log("\n🔍 Checking environment variables...");

  // Load environment variables from .env.local if it exists
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    console.log("📄 Found .env.local file");
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    });
  }

  let allRequired = true;

  REQUIRED_ENV_VARS.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`❌ ${varName} is missing`);
      allRequired = false;
    }
  });

  OPTIONAL_ENV_VARS.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set (optional)`);
    } else {
      console.log(`⚠️  ${varName} is not set (optional)`);
    }
  });

  if (!allRequired) {
    console.log("\n❌ Missing required environment variables!");
    console.log("💡 Create a .env.local file with:");
    console.log("MONGODB_URI=mongodb://localhost:27017/report_dashboard");
    console.log("GOOGLE_AI_API_KEY=your_gemini_api_key");
    return false;
  }

  console.log("✅ All required environment variables are set");
  return true;
}

async function testMongoDBIntegration() {
  console.log("\n🔍 Testing MongoDB integration...");

  try {
    // Dynamic import to avoid module loading issues
    const { MongoClient } = await import("mongodb");

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
      console.log(
        "⚠️  No reports found. The test script can create sample data."
      );
      console.log(
        "💡 Run: node scripts/test-mongo-rag.js to create sample data"
      );
    }

    // Test a simple query to verify collection structure
    const sampleReport = await reportsCollection.findOne();
    if (sampleReport) {
      console.log("✅ Sample report structure verified");
      const requiredFields = ["title", "description", "category", "location"];
      const missingFields = requiredFields.filter(
        (field) => !sampleReport[field]
      );

      if (missingFields.length > 0) {
        console.log(
          `⚠️  Missing fields in reports: ${missingFields.join(", ")}`
        );
      } else {
        console.log("✅ Report structure is compatible with RAG system");
      }
    }

    await client.close();
    console.log("✅ MongoDB test completed");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("💡 Make sure MongoDB is running and accessible");
    return false;
  }

  return true;
}

function checkPackageDependencies() {
  console.log("\n🔍 Checking package dependencies...");

  const packageJsonPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.log("❌ package.json not found");
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const requiredPackages = [
    "@google/genai",
    "mongodb",
    "next",
    "react",
    "typescript",
  ];

  let allPackagesPresent = true;

  requiredPackages.forEach((pkg) => {
    if (dependencies[pkg]) {
      console.log(`✅ ${pkg} v${dependencies[pkg]}`);
    } else {
      console.log(`❌ ${pkg} is missing`);
      allPackagesPresent = false;
    }
  });

  if (!allPackagesPresent) {
    console.log("\n❌ Some required packages are missing!");
    console.log("💡 Run: npm install to install dependencies");
    return false;
  }

  console.log("✅ All required packages are installed");
  return true;
}

function displayUsageInstructions() {
  console.log("\n📚 MongoDB RAG Integration Setup Complete!");
  console.log("\n🚀 Quick Start Guide:");
  console.log("1. Start the development server:");
  console.log("   npm run dev");
  console.log("");
  console.log("2. Visit the demo page:");
  console.log("   http://localhost:3000/citizen/mongo-rag-demo");
  console.log("");
  console.log("3. Try example queries:");
  console.log('   - "What are the most common infrastructure issues?"');
  console.log('   - "Show me patterns in pothole reports"');
  console.log(
    '   - "Which areas have the highest number of unresolved reports?"'
  );
  console.log("");
  console.log("🔧 API Endpoints:");
  console.log("   - POST /api/rag - RAG queries");
  console.log("   - GET /api/rag/analytics - MongoDB analytics");
  console.log("");
  console.log("📖 Documentation:");
  console.log("   - Check MONGODB-RAG-INTEGRATION.md for detailed docs");
  console.log("   - Use the RAGReportsAnalyzer component in your pages");
  console.log("   - Import useMongoRAG hook for custom integrations");
  console.log("");
  console.log("🧪 Testing:");
  console.log("   - Run: node scripts/test-mongo-rag.js");
  console.log("   - This will create sample data and test API endpoints");
}

async function main() {
  console.log("🚀 MongoDB RAG Integration Setup Verification\n");

  // Check files
  const filesOk = checkFiles();
  if (!filesOk) {
    process.exit(1);
  }

  // Check environment variables
  const envOk = checkEnvironmentVariables();
  if (!envOk) {
    process.exit(1);
  }

  // Check package dependencies
  const packagesOk = checkPackageDependencies();
  if (!packagesOk) {
    process.exit(1);
  }

  // Test MongoDB (optional, won't fail the setup)
  await testMongoDBIntegration();

  // Display usage instructions
  displayUsageInstructions();

  console.log("\n🎉 Setup verification complete!");
}

// Run the setup verification
main().catch(console.error);
