// Simple test function to verify OpenAI API key works
// Using native https instead of node-fetch to avoid ES module issues
const https = require('https');

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
    console.log('API Key exists:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
    console.log('API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
    
    // Attempt a very simple OpenAI API call (models list) to validate the key
    try {
      const options = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await httpsRequest('https://api.openai.com/v1/models', options);
      
      // If we get here, the request was successful
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'API key is valid and working',
          apiVersion: response.body.object || 'unknown'
        })
      };
      
    } catch (apiError) {
      // API call failed
      return {
        statusCode: apiError.statusCode || 500,
        body: JSON.stringify({
          success: false,
          error: 'API key validation failed',
          details: apiError.body || apiError.message
        })
      };
    }
  } catch (error) {
    console.error('General error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'General function error',
        message: error.message
      })
    };
  }
}
