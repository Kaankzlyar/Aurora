// Debug script to test login API directly
// Run this with: node debug-login.js

const fetch = require('node-fetch');

const API_BASE = "http://10.0.2.2:5270";
const BASE_URL = `${API_BASE}/api/auth`;

async function testLogin() {
  const email = "test@example.com"; // Replace with your test email
  const password = "yourpassword";   // Replace with your test password
  
  console.log("Testing login with different formats...\n");
  
  // Test 1: Lowercase field names
  console.log("=== Test 1: Lowercase field names ===");
  try {
    const response1 = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json"
      },
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(), 
        password: password 
      })
    });
    
    const body1 = await response1.text();
    console.log("Status:", response1.status);
    console.log("Response:", body1);
    console.log("Headers:", Object.fromEntries(response1.headers.entries()));
  } catch (error) {
    console.log("Error:", error.message);
  }
  
  console.log("\n=== Test 2: Capitalized field names ===");
  try {
    const response2 = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json"
      },
      body: JSON.stringify({ 
        Email: email.trim().toLowerCase(), 
        Password: password 
      })
    });
    
    const body2 = await response2.text();
    console.log("Status:", response2.status);
    console.log("Response:", body2);
    console.log("Headers:", Object.fromEntries(response2.headers.entries()));
  } catch (error) {
    console.log("Error:", error.message);
  }
}

testLogin();
