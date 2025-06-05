// Netlify serverless function to create a OpenAI real-time session
const fetch = require('node-fetch');

// Check for environment variables at function load time
console.log('Function loaded, checking API key:', process.env.OPENAI_API_KEY ? 'API KEY EXISTS' : 'API KEY MISSING');

exports.handler = async function(event, context) {
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }
    
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY environment variable');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Server configuration error', 
          detail: 'API key not found in environment variables'
        })
      };
    }
    
    const body = JSON.parse(event.body);
    console.log('Request received for model:', body.model || "gpt-4o-realtime-preview-2024-12-17");
    
    // Call the OpenAI API
    try {
      const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: body.model || "gpt-4o-realtime-preview-2024-12-17",
          instructions: body.instructions,
          voice: body.voice || "ash"
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          statusCode: response.status,
          body: JSON.stringify(errorData)
        };
      }
      
      const data = await response.json();
      
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } catch (fetchError) {
      console.error('OpenAI API error:', fetchError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'OpenAI API error', 
          message: fetchError.message 
        })
      };
    }
  } catch (error) {
    console.error('General error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
