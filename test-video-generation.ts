// Test script to directly call video generation function  
// Usage: npx tsx test-video-generation.ts

import { generateVideoWithGemini } from './src/service/videoGenrate';

async function testVideoGeneration(): Promise<void> {
  console.log('🎬 Starting video generation test...');
  console.log('⏰ Time started:', new Date().toISOString());
  
  const testPrompt = "A beautiful Diwali celebration with colorful fireworks lighting up the night sky, people celebrating with diyas and sparklers, festive atmosphere, 10 seconds";
  
  console.log('📝 Test prompt:', testPrompt);
  console.log('📏 Prompt length:', testPrompt.length, 'characters');
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
      console.log('📏 URL length:', videoUrl.length);
      console.log('');
      console.log('📋 Test the video URL:');
      console.log(`curl -I "${videoUrl}"`);
      console.log('');
      console.log('📋 Use in social media API:');
      console.log('curl -X POST http://localhost:3000/api/social \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log('  -d \'{"messages":[{"role":"user","content":"Create a Facebook post about Diwali with this video","videoUrl":"' + videoUrl + '"}]}\'');
    } else {
      console.log('❌ FAILED! Video generation returned null');
      console.log('💡 Check the logs above for error details');
    }
    
  } catch (error) {
    console.log('');
    console.log('❌ ERROR! Video generation failed:');
    console.error(error);
    console.log('');
    console.log('💡 Troubleshooting checklist:');
    console.log('   ✓ Google GenAI API key configured in videoGenrate.ts');
    console.log('   ✓ Network connectivity to Google AI services');
    console.log('   ✓ Veo 3.0 model access enabled for your API key');
    console.log('   ✓ AWS S3 credentials configured (for upload)');
    console.log('   ✓ tmp directory exists and is writable');
    console.log('   ✓ @google/genai package installed and up to date');
  }
  
  console.log('');
  console.log('🏁 Test completed at:', new Date().toISOString());
}

// Run the test
testVideoGeneration().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});