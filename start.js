#!/usr/bin/env node

/**
 * NurseryMart Backend Startup Script
 * This script helps set up and start the backend server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌱 NurseryMart Backend Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ .env file created. Please edit it with your configuration.');
    } else {
        // Create basic .env file
        const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/nurserymart

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# AI Configuration (optional)
GEMINI_API_KEY=your-gemini-api-key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:8080,file://
`;
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file created with default values.');
    }
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit', cwd: __dirname });
        console.log('✅ Dependencies installed successfully.');
    } catch (error) {
        console.error('❌ Failed to install dependencies:', error.message);
        process.exit(1);
    }
}

// Check if MongoDB is running (basic check)
console.log('🔍 Checking MongoDB connection...');
try {
    const mongoose = require('mongoose');
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nurserymart';
    
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('✅ MongoDB connection successful.');
        mongoose.disconnect();
        startServer();
    }).catch((error) => {
        console.log('⚠️  MongoDB connection failed:', error.message);
        console.log('💡 Make sure MongoDB is running on your system.');
        console.log('   - Windows: net start MongoDB');
        console.log('   - macOS: brew services start mongodb-community');
        console.log('   - Linux: sudo systemctl start mongod');
        console.log('\n🔄 Starting server anyway (will retry connection)...');
        startServer();
    });
} catch (error) {
    console.log('⚠️  Could not check MongoDB connection:', error.message);
    console.log('🔄 Starting server anyway...');
    startServer();
}

function startServer() {
    console.log('\n🚀 Starting NurseryMart Backend Server...');
    console.log('📡 Server will be available at: http://localhost:5000');
    console.log('📚 API Documentation: http://localhost:5000/api/health');
    console.log('🌱 Plant Care AI: http://localhost:5000/api/plant-care/tips');
    console.log('\n💡 Press Ctrl+C to stop the server\n');
    
    // Start the server
    require('./server.js');
}
