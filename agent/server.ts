// import https from 'https';
import fs from 'fs';
import {
  Agent,
  run,
  MCPServerStreamableHttp,
  setDefaultOpenAIClient,
  OpenAIChatCompletionsModel
} from '@openai/agents';


import { OpenAI } from 'openai';

import path from 'path';

// Use require for express
import express from 'express';
const app = express();

// Proper typing
import type { Request, Response } from 'express';

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Configure OpenAI client to use HTTP proxy
// You can point this to any OpenAI-compatible API (e.g., LiteLLM, local models, other providers)
const customClient = new OpenAI({
  baseURL: process.env.PROXY_BASE_URL || 'http://localhost:8000', // Your proxy endpoint (without /v1)
  apiKey: process.env.PROXY_API_KEY || 'sk-not-needed', // Required by SDK even if proxy doesn't need it
  defaultHeaders: {
    'X-Custom-Header': 'your-value',
    // Add any other headers you need here
    // 'Authorization': 'Bearer your-token',
    // 'X-API-Key': 'your-api-key',
  },
});

const chatModel = new OpenAIChatCompletionsModel(customClient, 'gpt-4');

// Set the custom client as default for all agents
setDefaultOpenAIClient(customClient);

const mcpServer = new MCPServerStreamableHttp({
        url: process.env.MCP_SERVER_URL || 'http://localhost/marketplace',
        name: 'User and Orders Service',
      });

app.post('/ask', async (req: Request, res: Response) => {
  const { prompt, mcpServers, headers: customHeaders } = req.body;

  if (!prompt || !Array.isArray(mcpServers)) {
    return res.status(400).json({ error: 'Missing prompt or mcpServers array' });
  }
  
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  try {
    
      const agent = new Agent({
        model: chatModel,
        name: 'Users and Orders Assistant',
        instructions: 'Use the tools to respond to user requests where appropriate. Output should be in markdown.',
        mcpServers: [mcpServer],
      });

    await mcpServer.connect();
    
    const result = await run(agent, prompt, { stream: true });
    const textStream = result.toTextStream({ compatibleWithNodeStreams: true });

    textStream.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf-8');
      
      res.write(`data: ${JSON.stringify({content:text})}\n\n`);
    });

    textStream.on('end', () => {
      res.write('event: done\ndata: \n\n');
      res.end();
    });

    textStream.on('error', (err: Error) => {
      console.error('Stream error:', err);
      res.write(`event: error\ndata: ${err.message}\n\n`);
      res.end();
    });

    req.on('close', () => {
      textStream.destroy();
    });

    await result.completed;
  } catch (err: any) {
    console.error('Fatal:', err);
    if (!res.headersSent) {
      res.status(500).send('Server error');
    } else {
      res.write(`event: error\ndata: ${err.message}\n\n`);
      res.end();
    }
  } finally {
    await mcpServer.close();
  }
});

// Optional: SPA fallback (for client-side routing)
app.use((req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});
// // HTTPS server
// const HTTPS_OPTIONS = {
//   key: fs.readFileSync('certs/key.pem'),
//   cert: fs.readFileSync('certs/cert.pem'),
// };

// https.createServer(HTTPS_OPTIONS, app).listen(3443, () => {
//   console.log('HTTPS SSE server running on https://localhost:3443');
// });


app.listen(3443, () => {
  console.log(`Server running on http://localhost: 3443`);
});