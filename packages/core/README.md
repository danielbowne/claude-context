# @dannyboy2042/claude-context-core
![](../../assets/claude-context.png)

The core indexing engine for Claude Context - a powerful tool for semantic search and analysis of codebases using vector embeddings and AI.

[![npm version](https://img.shields.io/npm/v/@dannyboy2042/claude-context-core.svg)](https://www.npmjs.com/package/@dannyboy2042/claude-context-core)
[![npm downloads](https://img.shields.io/npm/dm/@dannyboy2042/claude-context-core.svg)](https://www.npmjs.com/package/@dannyboy2042/claude-context-core)

> 📖 **New to Claude Context?** Check out the [main project README](../../README.md) for an overview and quick start guide.

## Installation

```bash
npm install @dannyboy2042/claude-context-core
```

### Prepare Environment Variables

#### OpenAI API key
See [OpenAI Documentation](https://platform.openai.com/docs/api-reference) for more details to get your API key.
```bash
OPENAI_API_KEY=your-openai-api-key
```

#### Vector Database Configuration (Optional)
By default, Claude Context uses **LanceDB** for local vector storage - no setup required! All data is stored locally in `./.claude-context/lancedb/`.

```bash
# Optional: Customize LanceDB storage path
LANCEDB_PATH=./my-custom-path

# Optional: Use Zilliz Cloud instead of local LanceDB
VECTOR_DB_TYPE=milvus
MILVUS_ADDRESS=your-zilliz-cloud-public-endpoint
MILVUS_TOKEN=your-zilliz-cloud-api-key
```

<details>
<summary>Advanced: Using Zilliz Cloud for scalable deployments</summary>

For larger teams or advanced features, you can optionally use Zilliz Cloud. You can [sign up](https://cloud.zilliz.com/signup?utm_source=github&utm_medium=referral&utm_campaign=2507-codecontext-readme) on Zilliz Cloud to get a free Serverless cluster.

![](../../assets/signup_and_create_cluster.jpeg)

After creating your cluster, open your Zilliz Cloud console and copy both the **public endpoint** and your **API key**.  

![Zilliz Cloud Dashboard](../../assets/zilliz_cloud_dashboard.jpeg)

If you need help creating your free vector database or finding these values, see the [Zilliz Cloud documentation](https://docs.zilliz.com/docs/create-cluster) for detailed instructions.
</details>

> 💡 **Tip**: For easier configuration management across different usage scenarios, consider using [global environment variables](../../docs/getting-started/environment-variables.md).

## Quick Start

```typescript
import { 
  Context, 
  OpenAIEmbedding, 
  LanceDBVectorDatabase 
} from '@dannyboy2042/claude-context-core';

// Initialize embedding provider
const embedding = new OpenAIEmbedding({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
  model: 'text-embedding-3-small'
});

// Initialize vector database (LanceDB - local, no setup required)
const vectorDatabase = new LanceDBVectorDatabase({
  uri: process.env.LANCEDB_PATH || './.claude-context/lancedb'
});

// Create context instance
const context = new Context({
  embedding,
  vectorDatabase
});

// Index a codebase
const stats = await context.indexCodebase('./my-project', (progress) => {
  console.log(`${progress.phase} - ${progress.percentage}%`);
});

console.log(`Indexed ${stats.indexedFiles} files with ${stats.totalChunks} chunks`);

// Search the codebase
const results = await context.semanticSearch(
  './my-project',
  'function that handles user authentication',
  5
);

results.forEach(result => {
  console.log(`${result.relativePath}:${result.startLine}-${result.endLine}`);
  console.log(`Score: ${result.score}`);
  console.log(result.content);
});
```

## Features

- **Multi-language Support**: Index TypeScript, JavaScript, Python, Java, C++, and many other programming languages
- **Semantic Search**: Find code using natural language queries powered by AI embeddings
- **Flexible Architecture**: Pluggable embedding providers and vector databases
- **Smart Chunking**: Intelligent code splitting that preserves context and structure
- **Batch Processing**: Efficient processing of large codebases with progress tracking
- **Pattern Matching**: Built-in ignore patterns for common build artifacts and dependencies
- **Incremental File Synchronization**: Efficient change detection using Merkle trees to only re-index modified files

## Embedding Providers

- **OpenAI Embeddings** (`text-embedding-3-small`, `text-embedding-3-large`)
- **VoyageAI Embeddings** - High-quality embeddings optimized for code

## Vector Database Support

- **LanceDB** - Local, embedded vector database (default)
- **Milvus/Zilliz Cloud** - High-performance vector database (optional)

## Code Splitters

- **AST Code Splitter** - AST-based code splitting with automatic fallback (default)
- **LangChain Code Splitter** - Character-based code chunking

## Configuration

### ContextConfig

```typescript
interface ContextConfig {
  embedding?: Embedding;           // Embedding provider
  vectorDatabase?: VectorDatabase; // Vector database instance (required)
  codeSplitter?: Splitter;        // Code splitting strategy
  supportedExtensions?: string[]; // File extensions to index
  ignorePatterns?: string[];      // Patterns to ignore
}
```

### Supported File Extensions (Default)

```typescript
[
  // Programming languages
  '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.h', '.hpp',
  '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.scala', '.m', '.mm',
  // Text and markup files  
  '.md', '.markdown'
]
```

### Default Ignore Patterns

- `node_modules/**`, `dist/**`, `build/**`, `out/**`
- `.git/**`, `.vscode/**`, `.idea/**`
- `*.min.js`, `*.bundle.js`, `*.map`
- Log files, cache directories, and temporary files

## API Reference

### Context

#### Methods

- `indexCodebase(path, progressCallback?)` - Index an entire codebase
- `semanticSearch(path, query, topK?, threshold?)` - Search indexed code semantically
- `hasIndex(path)` - Check if codebase is already indexed
- `clearIndex(path, progressCallback?)` - Remove index for a codebase
- `updateIgnorePatterns(patterns)` - Update ignore patterns
- `updateEmbedding(embedding)` - Switch embedding provider
- `updateVectorDatabase(vectorDB)` - Switch vector database

### Search Results

```typescript
interface SemanticSearchResult {
  content: string;      // Code content
  relativePath: string; // File path relative to codebase root
  startLine: number;    // Starting line number
  endLine: number;      // Ending line number
  language: string;     // Programming language
  score: number;        // Similarity score (0-1)
  fileExtension: string; // File extension
}
```


## Examples

### Using VoyageAI Embeddings

```typescript
import { Context, LanceDBVectorDatabase, VoyageAIEmbedding } from '@dannyboy2042/claude-context-core';

// Initialize with VoyageAI embedding provider
const embedding = new VoyageAIEmbedding({
  apiKey: process.env.VOYAGEAI_API_KEY || 'your-voyageai-api-key',
  model: 'voyage-code-3'
});

const vectorDatabase = new LanceDBVectorDatabase({
  uri: './.claude-context/lancedb'
});

const context = new Context({
  embedding,
  vectorDatabase
});
```

### Custom File Filtering

```typescript
const context = new Context({
  embedding,
  vectorDatabase,
  supportedExtensions: ['.ts', '.js', '.py', '.java'],
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    '*.spec.ts',
    '*.test.js'
  ]
});
```

## File Synchronization Architecture

Claude Context implements an intelligent file synchronization system that efficiently tracks and processes only the files that have changed since the last indexing operation. This dramatically improves performance when working with large codebases.

![File Synchronization Architecture](../../assets/file_synchronizer.png)

### How It Works

The file synchronization system uses a **Merkle tree-based approach** combined with SHA-256 file hashing to detect changes:

#### 1. File Hashing
- Each file in the codebase is hashed using SHA-256
- File hashes are computed based on file content, not metadata
- Hashes are stored with relative file paths for consistency across different environments

#### 2. Merkle Tree Construction
- All file hashes are organized into a Merkle tree structure
- The tree provides a single root hash that represents the entire codebase state
- Any change to any file will cause the root hash to change

#### 3. Snapshot Management
- File synchronization state is persisted to `~/.context/merkle/` directory
- Each codebase gets a unique snapshot file based on its absolute path hash
- Snapshots contain both file hashes and serialized Merkle tree data

#### 4. Change Detection Process
1. **Quick Check**: Compare current Merkle root hash with stored snapshot
2. **Detailed Analysis**: If root hashes differ, perform file-by-file comparison
3. **Change Classification**: Categorize changes into three types:
   - **Added**: New files that didn't exist before
   - **Modified**: Existing files with changed content
   - **Removed**: Files that were deleted from the codebase

#### 5. Incremental Updates
- Only process files that have actually changed
- Update vector database entries only for modified chunks
- Remove entries for deleted files
- Add entries for new files


## Contributing

This package is part of the Claude Context monorepo. Please see:
- [Main Contributing Guide](../../CONTRIBUTING.md) - General contribution guidelines
- [Core Package Contributing](CONTRIBUTING.md) - Specific development guide for this package

## Related Packages

- **[@claude-context/mcp](../mcp)** - MCP server that uses this core engine
- **[VSCode Extension](../vscode-extension)** - VSCode extension built on this core


## License

MIT - See [LICENSE](../../LICENSE) for details

---

## 🙏 Thanks

Special thanks to **Cheney Zhang** and the **Zilliz team** for creating the original Claude Context project. This fork builds upon their excellent foundation to provide a local-first vector database experience with LanceDB.