# Voice Web Control

A simple web application that uses OpenAI's Realtime API to control web page appearance through voice commands.

## Features

- **Voice interaction** with OpenAI's Realtime API
- **Change background color** by speaking (e.g., "change the background to blue")
- **Change text color** by speaking (e.g., "make the text red")
- **Get page HTML** content through voice commands

## Setup

1. **Get OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com)

2. **Configure API Key**: Edit `public/script.js` and replace `'your-openai-api-key-here'` with your actual OpenAI API key:
   ```javascript
   const OPENAI_API_KEY = 'sk-your-actual-api-key-here';
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   Or manually:
   ```bash
   python3 -m http.server 8000 --directory public
   ```

4. **Open in browser**: Go to `http://localhost:8000`

5. **Allow microphone access** when prompted

6. **Click "Start Voice Chat"** and start speaking!

## Usage

- Click "Start Voice Chat" to begin
- Speak commands like:
  - "Change the background color to red"
  - "Make the text blue" 
  - "Show me the page HTML"
  - "Set the background to #ff5733"

## Requirements

- Modern web browser with WebRTC support
- Microphone access
- OpenAI API key with Realtime API access
- Python 3 (for local server)

## Architecture

This is now a simple static web application that:
- Serves HTML/CSS/JS files via Python's built-in HTTP server
- Connects directly to OpenAI's Realtime API from the browser
- Uses WebRTC for real-time audio communication
- No backend server or complex dependencies required