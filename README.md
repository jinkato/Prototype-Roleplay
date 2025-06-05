# PM Interview Simulation

A web application that simulates a Junior Product Manager interview using OpenAI's GPT-4o Realtime API. The application creates an interactive voice-based interview experience with a virtual interviewer and dynamic slide presentations.

## Features

- Voice-based interaction with an AI interviewer
- Dynamic slides that change based on interview questions
- Real-time audio processing with WebRTC
- 5-minute structured interview simulation
- Secure API key handling with Netlify serverless functions

## Prerequisites

- A modern web browser that supports WebRTC
- An OpenAI API key with access to the GPT-4o Realtime API
- Node.js and npm (for Netlify deployment)
- Netlify account (for deployment with environment variables)

## Setup

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jinkato/roleplay.git
   cd roleplay
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the project root with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**: Navigate to the URL provided by Netlify CLI (typically `http://localhost:8888`)

### Netlify Deployment

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize Netlify site**:
   ```bash
   netlify init
   ```
   Follow the prompts to either create a new site or connect to an existing one

4. **Set environment variables**:
   ```bash
   netlify env:set OPENAI_API_KEY your_openai_api_key_here
   ```

5. **Deploy to Netlify**:
   ```bash
   npm run deploy
   ```

6. **Access your deployed site**: Use the URL provided by Netlify after deployment

## Usage

1. Click the "Start Interview" button
2. Allow microphone access when prompted
3. Interact with the AI interviewer through voice
4. The slides will change automatically based on questions asked
5. Complete the 5-minute simulated interview experience

## Security Note

Do not commit your OpenAI API key to version control. For production use, consider using environment variables or a more secure approach for managing API keys.

## License

MIT
