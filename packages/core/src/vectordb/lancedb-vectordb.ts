import * as lancedb from "@lancedb/lancedb";
import * as path from "path";
import * as fs from "fs-extra";
import {
    VectorDocument,
    SearchOptions,
    VectorSearchResult,
    VectorDatabase,
    HybridSearchRequest,
    HybridSearchOptions,
    HybridSearchResult,
    COLLECTION_LIMIT_MESSAGE
} from './types';

export interface LanceDBConfig {
    uri?: string; // Path to LanceDB database directory
    consistencyLevel?: 'strong' | 'eventual'; // For future use if needed
}

interface LanceDBTableSchema extends Record<string, any> {
    id: string;
    vector: number[];
    content: string;
    relativePath: string;
    startLine: number;
    endLine: number;
    fileExtension: string;
    metadata: string;
}

export class LanceDBVectorDatabase implements VectorDatabase {
    protected config: LanceDBConfig;
    private db: any | null = null; // Using any type due to LanceDB TypeScript issues
    protected initializationPromise: Promise<void>;
    private tables: Map<string, any> = new Map(); // Using any type due to LanceDB TypeScript issues

    constructor(config: LanceDBConfig = {}) {
        this.config = {
            uri: config.uri || './.claude-context/lancedb',
            ...config
        };

        // Start initialization asynchronously without waiting
        this.initializationPromise = this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            // Ensure directory exists
            const dbPath = path.resolve(this.config.uri!);
            await fs.ensureDir(dbPath);
            
            console.log('🔌 Connecting to LanceDB at:', dbPath);
            this.db = await lancedb.connect(this.config.uri!);
        } catch (error) {
            console.error('❌ Failed to initialize LanceDB:', error);
            throw error;
        }
    }

    /**
     * Ensure initialization is complete before method execution
     */
    protected async ensureInitialized(): Promise<void> {
        await this.initializationPromise;
        if (!this.db) {
            throw new Error('LanceDB client not initialized');
        }
    }

    async createCollection(collectionName: string, dimension: number, description?: string): Promise<void> {
        await this.ensureInitialized();

        console.log('Beginning collection creation:', collectionName);
        console.log('Collection dimension:', dimension);

        try {
            // Check if table already exists
            const tableNames = await this.db!.tableNames();
            if (tableNames.includes(collectionName)) {
                console.log(`Table '${collectionName}' already exists`);
                return;
            }

            // Create sample data with correct schema for table creation
            const sampleData: LanceDBTableSchema[] = [{
                id: '__sample__',
                vector: new Array(dimension).fill(0),
                content: 'Sample content for schema initialization',
                relativePath: '',
                startLine: 0,
                endLine: 0,
                fileExtension: '',
                metadata: '{}'
            }];

            // Create table with sample data
            const table = await this.db!.createTable(collectionName, sampleData, { mode: 'create' });
            
            // Remove sample data
            await table.delete("id = '__sample__'");
            
            // Cache table reference
            this.tables.set(collectionName, table);

            console.log(`✅ Created LanceDB table '${collectionName}' with dimension ${dimension}`);
        } catch (error: any) {
            console.error(`❌ Failed to create collection '${collectionName}':`, error);
            throw error;
        }
    }

    async dropCollection(collectionName: string): Promise<void> {
        await this.ensureInitialized();

        try {
            await this.db!.dropTable(collectionName);
            this.tables.delete(collectionName);
            console.log(`✅ Dropped collection '${collectionName}'`);
        } catch (error) {
            console.error(`❌ Failed to drop collection '${collectionName}':`, error);
            throw error;
        }
    }

    async hasCollection(collectionName: string): Promise<boolean> {
        await this.ensureInitialized();

        try {
            const tableNames = await this.db!.tableNames();
            return tableNames.includes(collectionName);
        } catch (error) {
            console.error(`❌ Failed to check collection '${collectionName}':`, error);
            return false;
        }
    }

    async listCollections(): Promise<string[]> {
        await this.ensureInitialized();

        try {
            return await this.db!.tableNames();
        } catch (error) {
            console.error('❌ Failed to list collections:', error);
            return [];
        }
    }

    private async getTable(collectionName: string): Promise<any> {
        // Check cache first
        if (this.tables.has(collectionName)) {
            return this.tables.get(collectionName)!;
        }

        try {
            const table = await this.db!.openTable(collectionName);
            this.tables.set(collectionName, table);
            return table;
        } catch (error) {
            throw new Error(`Table '${collectionName}' does not exist`);
        }
    }

    /**
     * Ensure FTS index exists for hybrid search functionality
     */
    private async ensureFTSIndex(table: any, collectionName: string): Promise<void> {
        try {
            // Check if FTS index already exists by trying to list indices
            // LanceDB doesn't have a direct method to check if an index exists,
            // so we'll attempt to create it and handle the error if it already exists
            console.log(`🔍 Ensuring FTS index exists for collection: ${collectionName}`);
            
            try {
                await table.createIndex("content", {
                    config: (lancedb as any).Index.fts()
                });
                console.log(`✅ FTS index created for collection: ${collectionName}`);
            } catch (indexError: any) {
                // If index already exists, this is expected
                if (indexError.message && indexError.message.includes('already exists')) {
                    console.log(`ℹ️  FTS index already exists for collection: ${collectionName}`);
                } else {
                    console.warn(`⚠️  Could not create FTS index for collection ${collectionName}:`, indexError);
                    throw indexError;
                }
            }
        } catch (error) {
            console.error(`❌ Failed to ensure FTS index for collection ${collectionName}:`, error);
            throw error;
        }
    }

    async insert(collectionName: string, documents: VectorDocument[]): Promise<void> {
        await this.ensureInitialized();

        console.log('Inserting documents into collection:', collectionName);
        
        try {
            const table = await this.getTable(collectionName);

            const data: LanceDBTableSchema[] = documents.map(doc => ({
                id: doc.id,
                vector: doc.vector,
                content: doc.content,
                relativePath: doc.relativePath,
                startLine: doc.startLine,
                endLine: doc.endLine,
                fileExtension: doc.fileExtension,
                metadata: JSON.stringify(doc.metadata),
            }));

            await table.add(data);
            console.log(`✅ Inserted ${documents.length} documents into '${collectionName}'`);
        } catch (error) {
            console.error(`❌ Failed to insert documents into '${collectionName}':`, error);
            throw error;
        }
    }

    async search(collectionName: string, queryVector: number[], options?: SearchOptions): Promise<VectorSearchResult[]> {
        await this.ensureInitialized();

        try {
            const table = await this.getTable(collectionName);

            let query = table
                .vectorSearch(queryVector)
                .distanceType("cosine")
                .limit(options?.topK || 10);

            // Apply boolean expression filter if provided
            if (options?.filterExpr && options.filterExpr.trim().length > 0) {
                query = query.where(options.filterExpr);
            }

            const searchResults = await query.toArray();

            return searchResults.map((result: any) => ({
                document: {
                    id: result.id,
                    vector: result.vector,
                    content: result.content,
                    relativePath: result.relativePath,
                    startLine: result.startLine,
                    endLine: result.endLine,
                    fileExtension: result.fileExtension,
                    metadata: JSON.parse(result.metadata || '{}'),
                },
                score: result._distance || 0,
            }));
        } catch (error) {
            console.error(`❌ Failed to search collection '${collectionName}':`, error);
            throw error;
        }
    }

    async delete(collectionName: string, ids: string[]): Promise<void> {
        await this.ensureInitialized();

        try {
            const table = await this.getTable(collectionName);
            
            // Build filter expression for deletion
            const filter = `id IN (${ids.map(id => `'${id}'`).join(', ')})`;
            await table.delete(filter);

            console.log(`✅ Deleted ${ids.length} documents from '${collectionName}'`);
        } catch (error) {
            console.error(`❌ Failed to delete documents from '${collectionName}':`, error);
            throw error;
        }
    }

    async query(collectionName: string, filter: string, outputFields: string[], limit?: number): Promise<Record<string, any>[]> {
        await this.ensureInitialized();

        try {
            const table = await this.getTable(collectionName);

            let query = table.query();

            // Apply filter if provided
            if (filter && filter.trim() !== '') {
                query = query.where(filter);
            }

            // Select specific fields
            if (outputFields.length > 0) {
                query = query.select(outputFields);
            }

            // Set limit
            if (limit) {
                query = query.limit(limit);
            }

            const results = await query.toArray();
            
            return results.map((result: any) => {
                // Parse metadata if present
                if (result.metadata && typeof result.metadata === 'string') {
                    result.metadata = JSON.parse(result.metadata);
                }
                return result;
            });
        } catch (error) {
            console.error(`❌ Failed to query collection '${collectionName}':`, error);
            throw error;
        }
    }

    async createHybridCollection(collectionName: string, dimension: number, description?: string): Promise<void> {
        await this.ensureInitialized();

        console.log('Beginning hybrid collection creation:', collectionName);
        console.log('Collection dimension:', dimension);

        try {
            // Check if table already exists
            const tableNames = await this.db!.tableNames();
            if (tableNames.includes(collectionName)) {
                console.log(`Hybrid table '${collectionName}' already exists`);
                return;
            }

            // Create sample data with correct schema for table creation
            const sampleData: LanceDBTableSchema[] = [{
                id: '__sample__',
                vector: new Array(dimension).fill(0),
                content: 'Sample content for schema initialization',
                relativePath: '',
                startLine: 0,
                endLine: 0,
                fileExtension: '',
                metadata: '{}'
            }];

            // Create table with sample data
            const table = await this.db!.createTable(collectionName, sampleData, { mode: 'create' });
            
            // Keep sample data temporarily for FTS index creation
            // Create FTS index on content field for hybrid search
            try {
                console.log(`🔍 Creating FTS index for content field...`);
                await table.createIndex("content", {
                    config: (lancedb as any).Index.fts()
                });
                console.log(`✅ FTS index created successfully for content field`);
            } catch (error: any) {
                console.error(`❌ Failed to create FTS index for content field:`, error);
                // Don't continue silently - this is critical for hybrid search
                throw new Error(`FTS index creation failed: ${error.message || error}`);
            }
            
            // Now remove sample data after index creation
            await table.delete("id = '__sample__'");
            
            // Cache table reference
            this.tables.set(collectionName, table);

            console.log(`✅ Created LanceDB hybrid table '${collectionName}' with FTS index`);
        } catch (error: any) {
            console.error(`❌ Failed to create hybrid collection '${collectionName}':`, error);
            throw error;
        }
    }

    async insertHybrid(collectionName: string, documents: VectorDocument[]): Promise<void> {
        // For LanceDB, hybrid insert is the same as regular insert
        // The FTS index automatically indexes the content field
        return this.insert(collectionName, documents);
    }

    async hybridSearch(collectionName: string, searchRequests: HybridSearchRequest[], options?: HybridSearchOptions): Promise<HybridSearchResult[]> {
        await this.ensureInitialized();

        try {
            const table = await this.getTable(collectionName);
            
            // Ensure FTS index exists for hybrid search
            await this.ensureFTSIndex(table, collectionName);

            console.log(`🔍 Preparing hybrid search for collection: ${collectionName}`);

            // For LanceDB, we'll implement hybrid search by combining vector and FTS results
            // This is a simplified implementation - LanceDB handles more sophisticated hybrid search natively

            // Extract vector and text search requests
            let vectorRequest: HybridSearchRequest | undefined;
            let textRequest: HybridSearchRequest | undefined;

            for (const request of searchRequests) {
                if (request.anns_field === 'vector' || Array.isArray(request.data)) {
                    vectorRequest = request;
                } else if (request.anns_field === 'sparse_vector' || typeof request.data === 'string') {
                    textRequest = request;
                }
            }

            const limit = options?.limit || vectorRequest?.limit || 10;

            // Perform vector search
            let vectorResults: any[] = [];
            if (vectorRequest && Array.isArray(vectorRequest.data)) {
                console.log(`🔍 Executing vector search with ${vectorRequest.data.length}D embedding`);
                try {
                    let vectorQuery = table
                        .vectorSearch(vectorRequest.data)
                        .distanceType("cosine")
                        .limit(limit * 2); // Overfetch for reranking

                    if (options?.filterExpr && options.filterExpr.trim().length > 0) {
                        vectorQuery = vectorQuery.where(options.filterExpr);
                    }

                    vectorResults = await vectorQuery.toArray();
                    console.log(`✅ Vector search returned ${vectorResults.length} results`);
                } catch (vectorError: any) {
                    console.error(`❌ Vector search failed:`, vectorError);
                    // Continue with empty vector results
                    vectorResults = [];
                }
            }

            // Perform text search if text request exists
            let textResults: any[] = [];
            if (textRequest && typeof textRequest.data === 'string') {
                console.log(`🔍 Executing FTS search for query: "${textRequest.data}"`);
                try {
                    let textQuery = table
                        .search(textRequest.data, "fts")
                        .limit(limit * 2); // Overfetch for reranking

                    if (options?.filterExpr && options.filterExpr.trim().length > 0) {
                        textQuery = textQuery.where(options.filterExpr);
                    }

                    textResults = await textQuery.toArray();
                    console.log(`✅ FTS search returned ${textResults.length} results`);
                } catch (ftsError: any) {
                    console.error(`❌ FTS search failed:`, ftsError);
                    // Continue with just vector search if FTS fails
                    textResults = [];
                }
            }

            // Simple RRF (Reciprocal Rank Fusion) reranking
            const combinedResults = this.combineSearchResults(vectorResults, textResults, limit);

            // Transform results to HybridSearchResult format
            return combinedResults.map((result: any) => ({
                document: {
                    id: result.id,
                    content: result.content,
                    vector: result.vector || [],
                    sparse_vector: [], // LanceDB doesn't use explicit sparse vectors
                    relativePath: result.relativePath,
                    startLine: result.startLine,
                    endLine: result.endLine,
                    fileExtension: result.fileExtension,
                    metadata: JSON.parse(result.metadata || '{}'),
                },
                score: result._score || result._distance || 0,
            }));

        } catch (error) {
            console.error(`❌ Failed to perform hybrid search on collection '${collectionName}':`, error);
            throw error;
        }
    }

    /**
     * Simple implementation of Reciprocal Rank Fusion for combining search results
     */
    private combineSearchResults(vectorResults: any[], textResults: any[], limit: number): any[] {
        const k = 60; // RRF parameter
        const scoresMap = new Map<string, { result: any, score: number }>();

        // Add vector search scores
        vectorResults.forEach((result, index) => {
            const id = result.id;
            const rrfScore = 1 / (k + index + 1);
            scoresMap.set(id, { result, score: rrfScore });
        });

        // Add text search scores (combine with existing if present)
        textResults.forEach((result, index) => {
            const id = result.id;
            const rrfScore = 1 / (k + index + 1);
            
            if (scoresMap.has(id)) {
                // Combine scores
                const existing = scoresMap.get(id)!;
                existing.score += rrfScore;
            } else {
                scoresMap.set(id, { result, score: rrfScore });
            }
        });

        // Sort by combined score and return top results
        const combined = Array.from(scoresMap.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => ({ ...item.result, _score: item.score }));

        return combined;
    }
}