// Netlify serverless function to create a OpenAI real-time session
// Using native https instead of node-fetch to avoid ES module issues
const https = require('https');

// Check for environment variables at function load time
console.log('Function loaded, checking API key:', process.env.OPENAI_API_KEY ? 'API KEY EXISTS' : 'API KEY MISSING');

// Promise-based wrapper for https.request
function httpsRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk.toString()));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(body);
            resolve({ statusCode: res.statusCode, body: json });
          } catch (error) {
            resolve({ statusCode: res.statusCode, body });
          }
        } else {
          try {
            reject({ statusCode: res.statusCode, body: JSON.parse(body) });
          } catch (error) {
            reject({ statusCode: res.statusCode, body });
          }
        }
      });
    });

    req.on('error', (error) => reject(error));
    if (data) req.write(data);
    req.end();
  });
}

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
      const apiUrl = 'https://api.openai.com/v1/realtime/sessions';
      const requestData = JSON.stringify({
        model: body.model || "gpt-4o-realtime-preview-2024-12-17",
        instructions: body.instructions,
        voice: body.voice || "ash"
      });
      
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData)
        }
      };
      
      try {
        const response = await httpsRequest(apiUrl, options, requestData);
        
        // The request was successful, return the data
        return {
          statusCode: 200,
          body: JSON.stringify(response.body)
        };
      } catch (apiError) {
        console.error('OpenAI API error:', apiError.statusCode, apiError.body);
        return {
          statusCode: apiError.statusCode || 500,
          body: JSON.stringify(apiError.body || { error: apiError.message })
        };
      }
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
