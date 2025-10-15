#!/usr/bin/env node

// Test script to directly call video generation function
// Usage: node test-video-generation.js

import { generateVideoWithGemini } from './src/service/videoGenrate.ts';

async function testVideoGeneration() {
  console.log('🎬 Starting video generation test...');
  console.log('⏰ Time started:', new Date().toISOString());
  
  const testPrompt = "A beautiful Diwali celebration with colorful fireworks lighting up the night sky, people celebrating with diyas and sparklers, festive atmosphere, 10 seconds";
  
  console.log('📝 Test prompt:', testPrompt);
  console.log('');
  
  try {
    console.log('🚀 Calling generateVideoWithGemini...');
    const startTime = Date.now();
    
    const videoUrl = await generateVideoWithGemini(testPrompt);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('');
    console.log('⏰ Generation completed in:', duration, 'seconds');
    console.log('');
    
    if (videoUrl) {
      console.log('✅ SUCCESS! Video generated successfully!');
      console.log('🔗 Video URL:', videoUrl);
      console.log('');
      console.log('📋 You can test this URL in your browser or use it in API calls');
    } else {
      console.log('❌ FAILED! Video generation returned null');
      console.log('💡 Check the logs above for error details');
    }
    
  } catch (error) {
    console.log('');
    console.log('❌ ERROR! Video generation failed:');
    console.error(error);
    console.log('');
    console.log('💡 Common issues:');
    console.log('   - Check your Google GenAI API key');
    console.log('   - Verify network connectivity');
    console.log('   - Check if Veo 3.0 model is available');
    console.log('   - Ensure AWS S3 credentials are configured');
  }
  
  console.log('');
  console.log('🏁 Test completed at:', new Date().toISOString());
}

// Run the test
testVideoGeneration().catch(console.error);