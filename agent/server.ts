import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import events from 'events';
import { ChatOpenAI } from '@langchain/openai';
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent, HumanMessage, SystemMessage } from 'langchain';

const app = express();

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

events.setMaxListeners(100)

// Configure LangChain ChatOpenAI model
const llm = new ChatOpenAI({
  configuration: {
    baseURL: process.env.PROXY_BASE_URL || 'http://localhost:8000',
    apiKey: process.env.PROXY_API_KEY || 'sk-not-needed',
  },
  model: "",
  streaming: true,
});

app.post('/ask', async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }
  
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  
  res.flushHeaders();
  let mcpClient = null
  try {
    // Create prompt template
    mcpClient = new MultiServerMCPClient({
      orders: {
        transport: "http",
        url: process.env.MCP_SERVER_URL || 'http://localhost/marketplace',  },
    });

    const agent = createAgent({
      model: llm,
      tools: await mcpClient.getTools(),
    });

    const system = new SystemMessage('You are a helpful assistant. Use the tools to respond to user requests where appropriate. Output should be in markdown.');
    const human = new HumanMessage(prompt);
    const stream = await agent.stream({
      messages: [system, human],
    },
    {streamMode: 'messages'});

    for await (const [token, metadata] of stream) {
        // console.log(`node: ${metadata.langgraph_node}`);
        // console.log(`content: ${JSON.stringify(token.content, null, 2)}`);
        if (metadata.langgraph_node == 'model_request' && token.content) {
          res.write(`data: ${JSON.stringify({ content: token.content })}\n\n`);
        }
    }

    res.write('event: done\ndata: \n\n');
    res.end();
  } catch (err: any) {
    console.error('Fatal:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`event: error\ndata: ${err.message}\n\n`);
      res.end();
    }
  } finally {
    if (mcpClient) {
      await mcpClient.close();
    }
  }
});

// Optional: SPA fallback (for client-side routing)
app.use((req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(3443, () => {
  console.log(`Server running on http://localhost:3443`);
});