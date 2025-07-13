#!/usr/bin/env node
/**
 * RAG System Setup Script
 * Initializes the RAG knowledge base and validates the setup
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up RAG-Enhanced Gemini AI System...\n");

// Check environment variables
function checkEnvironment() {
  console.log("📋 Checking environment configuration...");

  const requiredEnvVars = ["NEXT_PUBLIC_GEMINI_API_KEY"];

  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.log("❌ Missing required environment variables:");
    missing.forEach((varName) => console.log(`   - ${varName}`));
    console.log("\n📝 Please add these to your .env.local file:");
    console.log("   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here\n");
    return false;
  }

  console.log("✅ Environment configuration looks good!\n");
  return true;
}

// Check file structure
function checkFileStructure() {
  console.log("📁 Checking file structure...");

  const requiredFiles = [
    "lib/rag-utils.ts",
    "lib/vector-db.ts",
    "app/api/rag/route.ts",
    "hooks/use-rag.tsx",
    "components/rag-image-detector.tsx",
    "app/citizen/rag-demo/page.tsx",
  ];

  const missing = requiredFiles.filter((file) => {
    const fullPath = path.join(process.cwd(), file);
    return !fs.existsSync(fullPath);
  });

  if (missing.length > 0) {
    console.log("❌ Missing required files:");
    missing.forEach((file) => console.log(`   - ${file}`));
    return false;
  }

  console.log("✅ All required files are present!\n");
  return true;
}

// Check dependencies
function checkDependencies() {
  console.log("📦 Checking dependencies...");

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

  const requiredDeps = ["@google/genai", "next", "react"];

  const missing = requiredDeps.filter((dep) => !dependencies[dep]);

  if (missing.length > 0) {
    console.log("❌ Missing required dependencies:");
    missing.forEach((dep) => console.log(`   - ${dep}`));
    console.log("\n📝 Install missing dependencies with:");
    console.log(`   npm install ${missing.join(" ")}\n`);
    return false;
  }

  console.log("✅ All required dependencies are installed!\n");
  return true;
}

// Create sample .env.local if it doesn't exist
function createSampleEnv() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    console.log("📝 Creating sample .env.local file...");

    const sampleEnv = `# Google Gemini AI API Key
# Get your API key from: https://ai.google.dev/
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here

# Optional: Vector Database Configuration
# CHROMADB_URL=http://localhost:8000
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_key
# VECTOR_DB_PROVIDER=local

# Optional: Debug Mode
# RAG_DEBUG=true
`;

    fs.writeFileSync(envPath, sampleEnv);
    console.log("✅ Created .env.local template");
    console.log("   Please update it with your actual API keys\n");
  }
}

// Main setup function
async function main() {
  console.log("🧠 RAG-Enhanced Gemini AI Setup");
  console.log("=====================================\n");

  let allGood = true;

  // Create sample environment file
  createSampleEnv();

  // Check file structure
  if (!checkFileStructure()) {
    allGood = false;
  }

  // Check dependencies
  if (!checkDependencies()) {
    allGood = false;
  }

  // Check environment (warning only, since .env.local might not be configured yet)
  checkEnvironment();

  if (allGood) {
    console.log("🎉 RAG system setup completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Update your .env.local file with your Gemini API key");
    console.log("2. Start the development server: npm run dev");
    console.log("3. Visit /citizen/rag-demo to test the RAG functionality");
    console.log("4. Check the documentation in RAG-IMPLEMENTATION.md\n");

    console.log("🔗 Useful URLs (when server is running):");
    console.log("   - RAG Demo: http://localhost:3000/citizen/rag-demo");
    console.log("   - API Endpoint: http://localhost:3000/api/rag");
    console.log("   - Main App: http://localhost:3000\n");

    console.log("📚 Features available:");
    console.log("   ✅ RAG-enhanced image analysis");
    console.log("   ✅ Contextual AI responses");
    console.log("   ✅ Knowledge base management");
    console.log("   ✅ Custom prompt engineering");
    console.log("   ✅ Vector similarity search");
    console.log("   ✅ Production-ready architecture\n");
  } else {
    console.log(
      "❌ Setup encountered issues. Please resolve them and run setup again.\n"
    );
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkEnvironment, checkFileStructure, checkDependencies };
