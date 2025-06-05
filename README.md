# PM Interview Simulation

A web application that simulates a Junior Product Manager interview using OpenAI's GPT-4o Realtime API. The application creates an interactive voice-based interview experience with a virtual interviewer and dynamic slide presentations.

## Features

- Voice-based interaction with an AI interviewer
- Dynamic slides that change based on interview questions
- Real-time audio processing with WebRTC
- 5-minute structured interview simulation

## Prerequisites

- A modern web browser that supports WebRTC
- An OpenAI API key with access to the GPT-4o Realtime API
- Python 3.x (for local development server)

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jinkato/roleplay.git
   cd roleplay
   ```

2. **API Key**: When you start the application in your browser, you'll be prompted to enter your OpenAI API key. The key will be stored in your browser's localStorage and never sent to any server other than OpenAI.
   - Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Make sure your API key has access to the GPT-4o Realtime API

3. **Start the server**:
   ```bash
   npm run start
   ```
   Or alternatively:
   ```bash
   python3 -m http.server 8000 --directory public
   ```

4. **Open in browser**: Navigate to `http://localhost:8000` in your web browser

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
