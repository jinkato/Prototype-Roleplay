// Netlify serverless function to debug environment variables
exports.handler = async function(event, context) {
  try {
    // Create a safe version of the environment variables to return
    // (masking sensitive values but showing which ones exist)
    const safeEnv = {};
    
    // Check if OPENAI_API_KEY exists and mask it
    if (process.env.OPENAI_API_KEY) {
      const key = process.env.OPENAI_API_KEY;
      safeEnv.OPENAI_API_KEY = `${key.substring(0, 3)}...${key.substring(key.length - 4)}`;
      safeEnv.OPENAI_API_KEY_LENGTH = key.length;
      safeEnv.OPENAI_API_KEY_EXISTS = true;
    } else {
      safeEnv.OPENAI_API_KEY_EXISTS = false;
    }
    
    // Add Node.js version and other relevant info
    safeEnv.NODE_VERSION = process.version;
    safeEnv.NETLIFY_DEV = process.env.NETLIFY_DEV || false;
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Debug information",
        environmentInfo: safeEnv,
        context: {
          clientContext: context.clientContext ? true : false,
          identity: context.clientContext?.identity ? true : false
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
