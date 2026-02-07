#!/usr/bin/env node

/**
 * Voice Assistant Setup Script
 * Helps configure the Vapi voice assistant
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log("\n🎤 Nagrik Voice Assistant Setup\n");
  console.log(
    "This script will help you configure the Vapi voice assistant.\n",
  );

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), ".env.local");
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
    console.log("✓ Found existing .env.local file\n");
  } else {
    console.log("Creating new .env.local file...\n");
  }

  // Get Vapi keys
  console.log("Step 1: Vapi Configuration");
  console.log("Visit https://dashboard.vapi.ai to get your API keys\n");

  const publicKey = await question("Enter your Vapi Public Key: ");
  const privateKey = await question("Enter your Vapi Private Key: ");

  // Update or add to env file
  const vapiPublicKeyPattern = /NEXT_PUBLIC_VAPI_PUBLIC_KEY=.*/;
  const vapiPrivateKeyPattern = /VAPI_PRIVATE_KEY=.*/;

  if (vapiPublicKeyPattern.test(envContent)) {
    envContent = envContent.replace(
      vapiPublicKeyPattern,
      `NEXT_PUBLIC_VAPI_PUBLIC_KEY=${publicKey}`,
    );
  } else {
    envContent += `\n# Vapi Voice Assistant Configuration\nNEXT_PUBLIC_VAPI_PUBLIC_KEY=${publicKey}\n`;
  }

  if (vapiPrivateKeyPattern.test(envContent)) {
    envContent = envContent.replace(
      vapiPrivateKeyPattern,
      `VAPI_PRIVATE_KEY=${privateKey}`,
    );
  } else {
    envContent += `VAPI_PRIVATE_KEY=${privateKey}\n`;
  }

  // Write to file
  fs.writeFileSync(envPath, envContent);
  console.log("\n✓ Configuration saved to .env.local\n");

  // Next steps
  console.log("✅ Setup Complete!\n");
  console.log("Next steps:");
  console.log("1. Restart your development server: npm run dev");
  console.log("2. Navigate to any citizen page");
  console.log("3. Click the purple microphone icon");
  console.log("4. Start talking to your voice assistant!\n");

  console.log("📚 For more information, see VOICE-ASSISTANT-GUIDE.md\n");

  rl.close();
}

main().catch((error) => {
  console.error("Error:", error);
  rl.close();
  process.exit(1);
});
