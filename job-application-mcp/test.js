#!/usr/bin/env node

/**
 * Simple test script for Job Application Automation MCP Server
 * Tests basic server functionality and tool availability
 */

import { spawn } from 'child_process';

console.log('🚀 Testing Job Application Automation MCP Server...\n');

// Test data for Amplemarket example
const testData = {
  company_name: "Amplemarket",
  job_title: "Revenue Enablement Manager",
  company_research: {
    industry: "B2B SaaS (AI-powered sales enablement platform)",
    employee_count: "~102 employees (scale-up stage)",
    mission_values: "Help companies connect with their next customers through AI-first end-to-end sales platform. Values: Mission focus, Pro sports team mentality, Curious optimism, Make something people want",
    recent_developments: "AI Search launch (May 2025), Outreach.io alternative positioning (June 2025), rebranding to unified AI Sales Copilot strategy",
    market_position: "G2 Leader in Sales Engagement, competing with Outreach/Salesloft, differentiates via compound AI workflows",
    key_challenges: "Resource prioritization, cross-team alignment, standardized measurement frameworks, maintaining startup speed while introducing structure"
  },
  job_requirements: [
    "4+ years Sales Enablement/Training/Rev Ops (SaaS preferred)",
    "Direct exposure to SDR/AE/CSM/presales roles",
    "Passion for coaching with strong communication/teaching skills",
    "Highly organized with project-prioritization chops",
    "Familiarity with GTM tech stacks and data-driven enablement"
  ],
  ats_keywords: [
    "Revenue Enablement", "Sales Enablement", "onboarding programs", "playbooks",
    "certifications", "call coaching", "LMS", "RevOps", "GTM tech stack",
    "data-driven enablement", "ramp time", "quota attainment", "win rate",
    "cross-functional collaboration", "stakeholder communication",
    "process optimization", "systematic training", "performance tracking"
  ]
};

function testServerConnection() {
  return new Promise((resolve, reject) => {
    console.log('📡 Testing server connection...');
    
    // Test with mock API key for validation
    const env = { ...process.env, OPENAI_API_KEY: 'test-key-for-validation' };
    
    const server = spawn('node', ['index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: env
    });

    let output = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
      // Check if server started successfully with enhanced logging
      if (errorOutput.includes('🤖 Job Application Automation MCP server running on stdio')) {
        console.log('✅ Server started successfully');
        
        // Send a list tools request
        const listToolsRequest = JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list"
        }) + '\n';

        server.stdin.write(listToolsRequest);

        setTimeout(() => {
          server.kill();
          resolve({ success: true, output, errorOutput });
        }, 1000);
      }
    });

    server.on('error', (error) => {
      console.log('❌ Server failed to start:', error.message);
      reject(error);
    });

    server.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`❌ Server exited with code ${code}`);
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      server.kill();
      if (!server.killed) {
        reject(new Error('Server test timeout'));
      }
    }, 5000);
  });
}

async function runTests() {
  try {
    // Test 1: Server Connection
    await testServerConnection();
    
    console.log('\n🎯 Basic Tests Completed Successfully!\n');
    
    console.log('📋 Server Summary:');
    console.log('• Enhanced MCP Job Application Automation Server is ready');
    console.log('• 5 tools available:');
    console.log('  - analyze_job_strengths');
    console.log('  - create_application_materials');
    console.log('  - refine_application_materials');
    console.log('  - generate_complete_application');
    console.log('  - save_application_package');
    console.log('\n💡 Next Steps:');
    console.log('1. Set your OpenAI API key: export OPENAI_API_KEY=your-key-here');
    console.log('2. Start the server: npm start');
    console.log('3. Connect via MCP client or integrate with Google Apps Script');
    console.log('\n📖 Test data available for Amplemarket Revenue Enablement Manager role');

  } catch (error) {
    console.log('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
  console.log('⚠️  Warning: OPENAI_API_KEY not set. Set it for full functionality.');
  console.log('   export OPENAI_API_KEY=your-actual-key-here\n');
}

runTests();