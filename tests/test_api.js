// Test script to check if the API is working
const fetch = require('node-fetch');

async function testAPI() {
    try {
        console.log('Testing API endpoints...');
        
        // Test sensors endpoint
        const response = await fetch('http://localhost:3000/api/sensors');
        const data = await response.json();
        console.log('Current sensor data:', data);
        
        // Check if esp/sensors topic has data
        if (data['esp/sensors']) {
            console.log('✅ ESP sensor data found:', data['esp/sensors']);
        } else {
            console.log('❌ No ESP sensor data found');
            console.log('Available topics:', Object.keys(data));
        }
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

testAPI();

