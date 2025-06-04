import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Env {
  OPENAI_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();
app.use(cors());

const DEFAULT_INSTRUCTIONS = `You are helpful and have some tools installed.

You can help modify the appearance of web pages by changing colors and retrieving page content.
`;

app.get('/session', async (c) => {
  const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${c.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      instructions: DEFAULT_INSTRUCTIONS,
      voice: "ash",
    }),
  });
  const result = await response.json();
  return c.json({result});
});

export default app;