// Simple test function to verify OpenAI API key works
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    console.log('API Key exists:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
    console.log('API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
    
    // Attempt a very simple OpenAI API call (models list) to validate the key
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        }
      });
      
      if (response.ok) {
        // We don't need the full models list, just confirmation it worked
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'API key is valid and working'
          })
        };
      } else {
        const errorData = await response.json();
        return {
          statusCode: response.status,
          body: JSON.stringify({
            success: false,
            error: 'API key validation failed',
            details: errorData
          })
        };
      }
    } catch (apiError) {
      console.error('OpenAI API test error:', apiError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'OpenAI API test error',
          message: apiError.message
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
