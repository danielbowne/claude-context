![](assets/claude-context.png)
### Your entire codebase as Claude's context

**Claude Context** is an MCP plugin that adds semantic code search to Claude Code and other AI coding agents, giving them deep context from your entire codebase.

🧠 **Your Entire Codebase as Context**: Claude Context uses semantic search to find all relevant code from millions of lines. No multi-round discovery needed. It brings results straight into the Claude's context.

💰 **Cost-Effective for Large Codebases**: Instead of loading entire directories into Claude for every request, which can be very expensive, Claude Context efficiently stores your codebase locally in a vector database and only uses related code in context to keep your costs manageable.

🏠 **Local-First with LanceDB**: By default, Claude Context uses LanceDB for local, embedded vector storage - no external services required. Quick setup with your data staying on your machine.

---

## 🚀 Demo

![img](https://lh7-rt.googleusercontent.com/docsz/AD_4nXf2uIf2c5zowp-iOMOqsefHbY_EwNGiutkxtNXcZVJ8RI6SN9DsCcsc3amXIhOZx9VcKFJQLSAqM-2pjU9zoGs1r8GCTUL3JIsLpLUGAm1VQd5F2o5vpEajx2qrc77iXhBu1zWj?key=qYdFquJrLcfXCUndY-YRBQ)

Model Context Protocol (MCP) allows you to integrate Claude Context with your favorite AI coding assistants, e.g. Claude Code.

## 🚀 Quick Start

**Setup in 30 seconds** - Just one command!

### Step 1: Get your OpenAI API Key
Get a free API key from [OpenAI](https://platform.openai.com/api-keys) (starts with `sk-`)

### Step 2: Add to Claude Code
```bash
claude mcp add claude-context -e OPENAI_API_KEY=your-openai-api-key -- npx @dannyboy2042/claude-context-mcp@latest
```

**That's it!** 🎉 Claude Context will:
- ✅ Install automatically with no setup required
- ✅ Store everything locally using LanceDB (no cloud services needed)
- ✅ Work with any codebase size
- ✅ Enable hybrid vector + text search for better results

### Step 3: Start using it
1. Open Claude Code in your project directory
2. Ask Claude to "index this codebase" 
3. Then ask questions like "find the authentication logic" or "show me the database connection code"

### 📁 Multiple Projects Support
Claude Context automatically handles multiple projects by creating isolated collections for each codebase:
- Each project gets its own collection based on the project's absolute path
- Projects are completely isolated from each other
- Switch between projects by opening Claude Code in different directories
- All data stored locally in `~/.claude-context/lancedb/`

**System Requirements:**
- Node.js >= 20.0.0 (Claude Context works locally - no external services required!)

See the [Claude Code MCP documentation](https://docs.anthropic.com/en/docs/claude-code/mcp) for more details.


### Other MCP Client Configurations

**Simple setup for any MCP client - just add your OpenAI API key!**

<details>
<summary><strong>Gemini CLI</strong></summary>

Create or edit the `~/.gemini/settings.json` file:

```json
{
  "mcpServers": {
    "claude-context": {
      "command": "npx",
      "args": ["@dannyboy2042/claude-context-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Qwen Code</strong></summary>

Create or edit the `~/.qwen/settings.json` file:

```json
{
  "mcpServers": {
    "claude-context": {
      "command": "npx",
      "args": ["@dannyboy2042/claude-context-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key"
      }
    }
  }
}
```

</details>


<details>
<summary><strong>Cursor</strong></summary>

<a href="https://cursor.com/install-mcp?name=claude-context&config=JTdCJTIyY29tbWFuZCUyMiUzQSUyMm5weCUyMC15JTIwJTQwemlsbGl6JTJGY29kZS1jb250ZXh0LW1jcCU0MGxhdGVzdCUyMiUyQyUyMmVudiUyMiUzQSU3QiUyMk9QRU5BSV9BUElfS0VZJTIyJTNBJTIyeW91ci1vcGVuYWktYXBpLWtleSUyMiUyQyUyMk1JTFZVU19BRERSRVNTJTIyJTNBJTIybG9jYWxob3N0JTNBMTk1MzAlMjIlN0QlN0Q%3D"><img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Add claude-context MCP server to Cursor" height="32" /></a>

Go to: `Settings` -> `Cursor Settings` -> `MCP` -> `Add new global MCP server`

Add this to your Cursor `~/.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "claude-context": {
      "command": "npx",
      "args": ["-y", "@dannyboy2042/claude-context-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Void</strong></summary>

Go to: `Settings` -> `MCP` -> `Add MCP Server`

Add the following configuration to your Void MCP settings:

```json
{
  "mcpServers": {
    "code-context": {
      "command": "npx",
      "args": ["-y", "@dannyboy2042/claude-context-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key",
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "claude-context": {
      "command": "npx",
      "args": ["@dannyboy2042/claude-context-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key",
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Windsurf</strong></summary>

Windsurf supports MCP configuration through a JSON file. Add the following configuration to your Windsurf MCP settings:

```json
{
  "mcpServers": {
    "claude-context": {
      "command": "npx",
      "args": ["-y", "@dannyboy2042/claude-context-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key",
      }
    }
  }
}
```

</details>

<details>
<summary><strong>VS Code</strong></summary>

The Claude Context MCP server integrates directly with Claude Code and other MCP-compatible clients:

```json
{
  "mcpServers": {
    "claude-context": {
      "command": "npx",
      "args": ["-y", "@dannyboy2042/claude-context-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key",
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Cherry Studio</strong></summary>

Cherry Studio allows for visual MCP server configuration through its settings interface. While it doesn't directly support manual JSON configuration, you can add a new server via the GUI:

1. Navigate to **Settings → MCP Servers → Add Server**.
2. Fill in the server details:
   - **Name**: `claude-context`
   - **Type**: `STDIO`
   - **Command**: `npx`
   - **Arguments**: `["@dannyboy2042/claude-context-mcp@latest"]`
   - **Environment Variables**:
     - `OPENAI_API_KEY`: `your-openai-api-key`
     - `MILVUS_ADDRESS`: `milvus-cloud-public-endpoint`
     - `MILVUS_TOKEN`: `milvus-cloud-api-key`
3. Save the configuration to activate the server.

</details>

<details>
<summary><strong>Cline</strong></summary>

Cline uses a JSON configuration file to manage MCP servers. To integrate the provided MCP server configuration:

1. Open Cline and click on the **MCP Servers** icon in the top navigation bar.

2. Select the **Installed** tab, then click **Advanced MCP Settings**.

3. In the `cline_mcp_settings.json` file, add the following configuration:

```json
{
  "mcpServers": {
    "claude-context": {
      "command": "npx",
      "args": ["@dannyboy2042/claude-context-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key",
      }
    }
  }
}
```

4. Save the file.

</details>

<details>
<summary><strong>Augment</strong></summary>

To configure Claude Context MCP in Augment Code, you can use either the graphical interface or manual configuration.

#### **A. Using the Augment Code UI**

1. Click the hamburger menu.

2. Select **Settings**.

3. Navigate to the **Tools** section.

4. Click the **+ Add MCP** button.

5. Enter the following command:

   ```
   npx @dannyboy2042/claude-context-mcp@latest
   ```

6. Name the MCP: **Claude Context**.

7. Click the **Add** button.

------

#### **B. Manual Configuration**

1. Press Cmd/Ctrl Shift P or go to the hamburger menu in the Augment panel
2. Select Edit Settings
3. Under Advanced, click Edit in settings.json
4. Add the server configuration to the `mcpServers` array in the `augment.advanced` object

```json
"augment.advanced": { 
  "mcpServers": [ 
    { 
      "name": "claude-context", 
      "command": "npx", 
      "args": ["-y", "@dannyboy2042/claude-context-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key",
      }
    }
  ]
}
```

</details>

<details>
<summary><strong>Roo Code</strong></summary>

Roo Code utilizes a JSON configuration file for MCP servers:

1. Open Roo Code and navigate to **Settings → MCP Servers → Edit Global Config**.

2. In the `mcp_settings.json` file, add the following configuration:

```json
{
  "mcpServers": {
    "claude-context": {
      "command": "npx",
      "args": ["@dannyboy2042/claude-context-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key",
      }
    }
  }
}
```

3. Save the file to activate the server.

</details>


<details>
<summary><strong>Other MCP Clients</strong></summary>

The server uses stdio transport and follows the standard MCP protocol. It can be integrated with any MCP-compatible client by running:

```bash
npx @dannyboy2042/claude-context-mcp@latest
```

</details>

For more detailed MCP environment variable configuration, see our [Environment Variables Guide](docs/getting-started/environment-variables.md).

📚 **Need more help?** Check out our [complete documentation](docs/) for detailed guides and troubleshooting tips.

---


---

## 🏗️ Architecture
![](assets/Architecture.png)


### 🔧 Key Features

- 🔍 **Hybrid Search**: Advanced hybrid search combining vector similarity + full-text search using RRF (Reciprocal Rank Fusion) for better results
- 🏠 **100% Local**: Everything runs locally using LanceDB - your code never leaves your machine
- ⚡ **Fast & Incremental**: Smart indexing that only processes changed files
- 🧩 **AST-Powered**: Intelligent code chunking using Abstract Syntax Trees for better context
- 🗄️ **No Limits**: Handle codebases of any size locally 
- 🛠️ **Zero Config**: Works out of the box - just add your OpenAI API key

### Core Components
Claude Context is a monorepo containing three main packages:

- **`@dannyboy2042/claude-context-core`**: Core indexing engine with embedding and vector database integration
- **`@dannyboy2042/claude-context-mcp`**: Model Context Protocol server for AI agent integration

### Supported Technologies
- **Vector Database**: [LanceDB](https://lancedb.github.io/lancedb/) (local, embedded, zero-config) 
- **Embedding**: [OpenAI](https://openai.com) text-embedding-3-small (other providers available: VoyageAI, Ollama, Gemini)
- **Code Analysis**: AST-based intelligent chunking with LangChain fallback
- **Languages**: TypeScript, JavaScript, Python, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala, Markdown
- **AI Clients**: Claude Code, Cursor, Windsurf, Gemini CLI, and all MCP-compatible clients

<details>
<summary>🔧 Advanced: Optional Cloud Vector Database</summary>

For enterprise teams or advanced use cases, you can optionally configure Milvus/Zilliz Cloud by setting environment variables:
```bash
claude mcp add claude-context -e OPENAI_API_KEY=your-key -e VECTOR_DB_TYPE=milvus -e MILVUS_TOKEN=your-token -- npx @dannyboy2042/claude-context-mcp@latest
```
</details>

---

## 📦 Other Ways to Use Claude Context

The MCP server is the primary way to use Claude Context with AI assistants like Claude Code.

### Build Applications with Core Package

The `@dannyboy2042/claude-context-core` package provides the fundamental functionality for code indexing and semantic search.

```typescript
import { Context, LanceDBVectorDatabase, OpenAIEmbedding } from '@dannyboy2042/claude-context-core';

// Initialize embedding provider
const embedding = new OpenAIEmbedding({
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
    model: 'text-embedding-3-small'
});

// Initialize vector database (LanceDB - local, no setup required)
const vectorDatabase = new LanceDBVectorDatabase({
    uri: './.claude-context/lancedb' // Local storage path
});

// Create context instance
const context = new Context({
    embedding,
    vectorDatabase
});

// Index your codebase with progress tracking
const stats = await context.indexCodebase('./your-project', (progress) => {
    console.log(`${progress.phase} - ${progress.percentage}%`);
});
console.log(`Indexed ${stats.indexedFiles} files, ${stats.totalChunks} chunks`);

// Perform semantic search
const results = await context.semanticSearch('./your-project', 'vector database operations', 5);
results.forEach(result => {
    console.log(`File: ${result.relativePath}:${result.startLine}-${result.endLine}`);
    console.log(`Score: ${(result.score * 100).toFixed(2)}%`);
    console.log(`Content: ${result.content.substring(0, 100)}...`);
});
```

---

## 🛠️ Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/danielbowne/claude-context.git
cd claude-context

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development mode
pnpm dev
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:core
pnpm build:vscode
pnpm build:mcp
```

### Running Examples

```bash
# Development with file watching
cd examples/basic-usage
pnpm dev
```

### Supported File Extensions

By default, Claude Context supports:
- Programming languages: `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.java`, `.cpp`, `.c`, `.h`, `.hpp`, `.cs`, `.go`, `.rs`, `.php`, `.rb`, `.swift`, `.kt`, `.scala`, `.m`, `.mm`
- Documentation: `.md`, `.markdown`, `.ipynb`

### Ignore Patterns

Common directories and files are automatically ignored:
- Build outputs: `node_modules/**`, `dist/**`, `build/**`, `out/**`, `target/**`, `coverage/**`, `.nyc_output/**`
- Version control: `.git/**`, `.svn/**`, `.hg/**`
- IDE/Editor files: `.vscode/**`, `.idea/**`, `*.swp`, `*.swo`
- Cache directories: `.cache/**`, `__pycache__/**`, `.pytest_cache/**`
- Logs and temporary: `logs/**`, `tmp/**`, `temp/**`, `*.log`
- Environment files: `.env`, `.env.*`, `*.local`
- Minified/bundled files: `*.min.js`, `*.min.css`, `*.bundle.js`, `*.bundle.css`, `*.chunk.js`, `*.map`

See [FAQ Guide](docs/troubleshooting/faq.md) for detailed and customized configuration of supported file extensions and ignore patterns. 

---

## 📖 Examples

Check the `/examples` directory for complete usage examples:

- **Basic Usage**: Simple indexing and search example

---

## ❓ FAQ

**Common Questions:**

- **[What files does Claude Context decide to embed?](docs/troubleshooting/faq.md#q-what-files-does-claude-context-decide-to-embed)**
- **[Can I use a fully local deployment setup?](docs/troubleshooting/faq.md#q-can-i-use-a-fully-local-deployment-setup)**
- **[Does it support multiple projects / codebases?](docs/troubleshooting/faq.md#q-does-it-support-multiple-projects--codebases)**

For detailed answers and more troubleshooting tips, see our [FAQ Guide](docs/troubleshooting/faq.md).

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

**Package-specific contributing guides:**
- [Core Package Contributing](packages/core/CONTRIBUTING.md)
- [MCP Server Contributing](packages/mcp/CONTRIBUTING.md)  

---

## 🗺️ Roadmap

- [x] AST-based code analysis for improved understanding
- [x] Support for additional embedding providers
- [ ] Agent-based interactive search mode
- [x] Enhanced code chunking strategies
- [ ] Search result ranking optimization

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- [GitHub Repository](https://github.com/danielbowne/claude-context)
- [LanceDB Documentation](https://lancedb.github.io/lancedb/)
- [Milvus Documentation](https://milvus.io/docs)
- [Zilliz Cloud](https://zilliz.com/cloud)

---

## 🙏 Thanks

Special thanks to **Cheney Zhang** and the **Zilliz team** for creating the original Claude Context project. This fork builds upon their excellent foundation to provide a local-first vector database experience with LanceDB.
