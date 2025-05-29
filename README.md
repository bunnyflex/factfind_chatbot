# Task Master AI Project

This project has been set up with **Task Master AI**, an AI-driven task management system designed to work seamlessly with Claude and other AI coding assistants.

## 🚀 What's Installed

Task Master AI has been successfully installed and configured with:

- **Local Installation**: `task-master-ai` npm package
- **MCP Integration**: Configured for Cursor AI editor
- **Project Structure**: Organized directories for tasks, scripts, and rules
- **AI Models**: Pre-configured with Claude 3.7 Sonnet, Perplexity, and fallback models

## 📁 Project Structure

```
├── .cursor/
│   ├── mcp.json          # MCP server configuration for Cursor
│   └── rules/            # Cursor-specific rules and guidelines
├── scripts/              # Project scripts and PRD documents
├── tasks/                # Generated tasks and subtasks
├── .taskmasterconfig     # Task Master configuration
└── .gitignore           # Git ignore file
```

## 🔧 Setup Steps

### 1. Configure API Keys

You need to add your AI provider API keys to the MCP configuration file:

**Edit `.cursor/mcp.json`** and replace the placeholder values:

```json
{
  "mcpServers": {
    "task-master-ai": {
      "env": {
        "ANTHROPIC_API_KEY": "your_actual_anthropic_key_here",
        "PERPLEXITY_API_KEY": "your_actual_perplexity_key_here",
        "OPENAI_API_KEY": "your_actual_openai_key_here"
        // ... other optional keys
      }
    }
  }
}
```

**Required API Keys:**

- **Anthropic API Key** (for Claude models) - Highly recommended
- **Perplexity API Key** (for research model) - Recommended

**Optional API Keys:**

- OpenAI, Google, xAI, OpenRouter, Mistral, Azure OpenAI, Ollama

### 2. Enable MCP in Cursor

1. Open Cursor AI editor
2. Go to Settings → Features → Enable MCP
3. Restart Cursor to load the Task Master AI server

## 🎯 How to Use Task Master AI

### Step 1: Create a Project Requirements Document (PRD)

Create a file `scripts/prd.txt` with your project requirements. Example:

```
Project: Fact Finding Application
Goal: Build a web application that helps users research and verify facts

Features:
- User authentication
- Fact submission and verification
- Source tracking
- Rating system
- Search functionality
```

### Step 2: Parse Your PRD

In Cursor, ask the AI:

```
Can you parse my PRD at scripts/prd.txt and generate initial tasks?
```

### Step 3: Analyze Project Complexity

Ask the AI:

```
Can you analyze the complexity of the tasks in my PRD using research?
```

### Step 4: Expand Tasks

Ask the AI:

```
Can you expand all of my tasks using the complexity analysis?
```

### Step 5: Start Working

Ask the AI:

```
What's the next task I should work on?
Can you help me implement task 1?
```

## 🛠️ Available Commands

### Via Cursor AI (Recommended)

- `parse_prd` - Parse PRD and generate tasks
- `analyze_project_complexity` - Analyze task complexity
- `list_tasks` - Show all tasks
- `next_task` - Get next task to work on
- `update_task_status` - Update task completion status

### Via Command Line

```bash
# List all tasks
npx task-master list

# Show next task
npx task-master next

# Parse a PRD
npx task-master parse-prd scripts/prd.txt

# Generate task files
npx task-master generate
```

## 🔄 Workflow

1. **Plan**: Create PRD → Parse → Analyze complexity
2. **Expand**: Generate detailed tasks and subtasks
3. **Execute**: Work on tasks one by one
4. **Track**: Update task status as you progress
5. **Iterate**: Update tasks based on learnings

## 📚 Key Features

- **AI-Driven Task Management**: Automatically break down complex projects
- **Multi-Model Support**: Use different AI models for different purposes
- **Cursor Integration**: Seamless workflow within your editor
- **Research Capabilities**: Built-in research model for complexity analysis
- **Progress Tracking**: Keep track of completed and pending tasks

## 🆘 Troubleshooting

- **MCP not working**: Ensure API keys are correctly set in `.cursor/mcp.json`
- **Commands not found**: Use `npx task-master` instead of global commands
- **Permission issues**: All installations are local to this project

## 📖 Next Steps

1. Add your API keys to `.cursor/mcp.json`
2. Create your project PRD in `scripts/prd.txt`
3. Ask Cursor AI to parse your PRD and start generating tasks
4. Begin your AI-assisted development workflow!

---

**Task Master AI Version**: 0.15.0  
**Documentation**: [GitHub Repository](https://github.com/eyaltoledano/claude-task-master)
# factfind_chatbot
