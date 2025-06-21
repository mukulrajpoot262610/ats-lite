# Ollama Integration Setup Guide

This guide will help you set up Ollama for local AI model usage in ATS-Lite.

## Prerequisites

1. **Install Ollama**: Download and install Ollama from [https://ollama.ai](https://ollama.ai)

## Setup Steps

### 1. Install Ollama

**On macOS:**

```bash
brew install ollama
```

**On Linux:**

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**On Windows:**
Download the installer from the Ollama website.

### 2. Start Ollama Service

```bash
ollama serve
```

The service will start on `http://localhost:11434` by default.

### 3. Download Models

Install some popular models for recruitment/HR tasks:

```bash
# Install Llama 2 (7B) - Good balance of performance and speed
ollama pull llama2

# Install Mistral (7B) - Excellent for conversation
ollama pull mistral

# Install Code Llama (7B) - Good for technical recruitment
ollama pull codellama

# Install Llama 2 13B - Better quality, slower
ollama pull llama2:13b

# Install Gemma 2B - Lightweight, fast
ollama pull gemma:2b
```

### 4. Verify Installation

Check that models are installed:

```bash
ollama list
```

### 5. Test the API

Test that the API is working:

```bash
curl http://localhost:11434/api/tags
```

## Environment Configuration

### Optional: Custom Ollama URL

If you're running Ollama on a different port or host, set the environment variable:

```bash
# In your .env.local file
OLLAMA_BASE_URL=http://localhost:11434
```

## Recommended Models for ATS-Lite

| Model         | Size | Best For                           | Speed     | Thinking Support |
| ------------- | ---- | ---------------------------------- | --------- | ---------------- |
| `gemma:2b`    | 2GB  | Quick responses, basic tasks       | Very Fast | No               |
| `llama2`      | 4GB  | General conversation, HR advice    | Fast      | No               |
| `mistral`     | 4GB  | Detailed analysis, recommendations | Fast      | No               |
| `codellama`   | 4GB  | Technical recruitment, code review | Fast      | No               |
| `llama2:13b`  | 8GB  | Complex analysis, best quality     | Moderate  | No               |
| `deepseek-r1` | 8GB  | Advanced reasoning, shows thinking | Moderate  | **Yes**          |

### Models with Thinking Support

Some advanced models like **deepseek-r1** show their reasoning process using `<think>` tags. When these models stream responses, you'll see:

1. **Live Thinking**: The model's reasoning process displayed in real-time
2. **Thinking Indicator**: Visual feedback showing "Thinking..." with animated dots
3. **Collapsible Thinking**: Expandable section to view the complete reasoning
4. **Separated Content**: Clear distinction between thinking process and final response

To use these models:

```bash
# Download deepseek-r1 (example)
ollama pull deepseek-r1

# Or other reasoning models
ollama pull qwen2.5-coder:32b
```

## Troubleshooting

### Ollama Not Starting

- Make sure port 11434 is not in use
- Check Ollama logs: `ollama logs`
- Restart the service: `ollama serve`

### Models Not Loading in UI

- Verify Ollama is running: `curl http://localhost:11434/api/tags`
- Check browser console for errors
- Click the refresh button in the model selector

### Slow Response Times

- Use smaller models (2B-7B) for faster responses
- Ensure sufficient RAM is available
- Close other applications to free up system resources

## Model Performance Tips

1. **First Run**: Models are slower on first use as they load into memory
2. **RAM Usage**: Each model uses significant RAM while loaded
3. **Concurrent Usage**: Multiple models can be loaded simultaneously but use more resources
4. **Model Switching**: Switching models may cause brief delays as models load/unload

## Features

### Real-time Streaming

- **Live Responses**: See AI responses appear word-by-word as they're generated
- **Visual Feedback**: Animated cursor shows active streaming
- **Instant Feedback**: No waiting for complete responses
- **Thinking Process**: Advanced models (like deepseek-r1) show their reasoning process in real-time

### Performance Optimizations

- **Streaming API**: Reduces perceived latency for long responses
- **Progressive Display**: Start reading responses while they're being generated
- **Better UX**: More interactive and engaging conversation flow

## Security Notes

- Ollama runs locally, so your data stays on your machine
- No internet connection required after model download
- Models and conversations are processed entirely offline
