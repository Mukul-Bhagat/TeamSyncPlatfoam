"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexingWorker = void 0;
const EmbeddingProviderFactory_1 = require("../embeddings/EmbeddingProviderFactory");
const database_1 = require("../../shared/database");
const env_1 = require("../../config/env");
class IndexingWorker {
    queue;
    isRunning = false;
    processingInterval = null;
    embeddingProvider = EmbeddingProviderFactory_1.EmbeddingProviderFactory.create('openai', { apiKey: env_1.env.OPENAI_API_KEY || '' });
    constructor(queue) {
        this.queue = queue;
    }
    /**
     * Start the worker
     */
    start() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.processingInterval = setInterval(() => this.processNextJob(), 1000);
        console.log('[IndexingWorker] Started');
    }
    /**
     * Stop the worker
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        console.log('[IndexingWorker] Stopped');
    }
    /**
     * Process the next job in the queue
     */
    async processNextJob() {
        const job = this.queue.dequeue();
        if (!job) {
            return;
        }
        try {
            await this.processJob(job);
            this.queue.complete(job.id);
        }
        catch (error) {
            this.queue.fail(job.id, error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * Process a single indexing job
     */
    async processJob(job) {
        console.log(`[IndexingWorker] Processing job: ${job.entityType}:${job.entityId}`);
        // Fetch the document content based on entity type
        const document = await this.fetchDocument(job);
        if (!document) {
            console.warn(`[IndexingWorker] Document not found: ${job.entityType}:${job.entityId}`);
            return;
        }
        // Generate embedding
        const embedding = await this.embeddingProvider.generate({
            text: document.searchableText,
        });
        // Store the document and embedding
        await this.storeDocument(job, document, embedding.embedding);
        console.log(`[IndexingWorker] Successfully indexed: ${job.entityType}:${job.entityId}`);
    }
    /**
     * Fetch document content based on entity type
     */
    async fetchDocument(job) {
        switch (job.entityType) {
            case 'message':
                return this.fetchMessage(job.entityId);
            case 'summary':
                return this.fetchSummary(job.entityId);
            case 'incident':
                return this.fetchIncident(job.entityId);
            case 'deployment':
                return this.fetchDeployment(job.entityId);
            default:
                console.warn(`[IndexingWorker] Unknown entity type: ${job.entityType}`);
                return null;
        }
    }
    /**
     * Fetch message content
     */
    async fetchMessage(messageId) {
        const { data, error } = await database_1.supabase
            .from('messages')
            .select('*')
            .eq('id', messageId)
            .single();
        if (error || !data) {
            return null;
        }
        return {
            title: `Message in ${data.channel_id}`,
            content: data.content,
            searchableText: `${data.content} ${data.channel_id}`,
            metadata: { channel_id: data.channel_id, user_id: data.user_id },
        };
    }
    /**
     * Fetch summary content
     */
    async fetchSummary(summaryId) {
        const { data, error } = await database_1.supabase
            .from('ai_summaries')
            .select('*')
            .eq('id', summaryId)
            .single();
        if (error || !data) {
            return null;
        }
        return {
            title: data.title,
            content: data.content,
            searchableText: `${data.title} ${data.content} ${data.summary_type}`,
            metadata: { summary_type: data.summary_type, source_entity_id: data.source_entity_id },
        };
    }
    /**
     * Fetch incident content
     */
    async fetchIncident(incidentId) {
        const { data, error } = await database_1.supabase
            .from('incidents')
            .select('*')
            .eq('id', incidentId)
            .single();
        if (error || !data) {
            return null;
        }
        return {
            title: data.title,
            content: data.description || '',
            searchableText: `${data.title} ${data.description || ''} ${data.severity} ${data.status}`,
            metadata: { severity: data.severity, status: data.status },
        };
    }
    /**
     * Fetch deployment content
     */
    async fetchDeployment(deploymentId) {
        const { data, error } = await database_1.supabase
            .from('deployments')
            .select('*')
            .eq('id', deploymentId)
            .single();
        if (error || !data) {
            return null;
        }
        return {
            title: `Deployment: ${data.service}`,
            content: data.status,
            searchableText: `${data.service} ${data.environment} ${data.status} ${data.version || ''}`,
            metadata: { service: data.service, environment: data.environment, status: data.status },
        };
    }
    /**
     * Store document and embedding
     */
    async storeDocument(job, document, embedding) {
        // Check if document already exists
        const { data: existing } = await database_1.supabase
            .from('search_documents')
            .select('id')
            .eq('entity_type', job.entityType)
            .eq('entity_id', job.entityId)
            .single();
        if (existing) {
            // Update existing document
            await database_1.supabase
                .from('search_documents')
                .update({
                title: document.title,
                content: document.content,
                searchable_text: document.searchableText,
                metadata: document.metadata,
                embedding: `[${embedding.join(',')}]`,
                updated_at: new Date().toISOString(),
            })
                .eq('id', existing.id);
        }
        else {
            // Insert new document
            await database_1.supabase
                .from('search_documents')
                .insert({
                organization_id: job.organizationId,
                workspace_id: job.workspaceId,
                entity_type: job.entityType,
                entity_id: job.entityId,
                title: document.title,
                content: document.content,
                searchable_text: document.searchableText,
                metadata: document.metadata,
                embedding: `[${embedding.join(',')}]`,
            });
        }
    }
}
exports.IndexingWorker = IndexingWorker;
//# sourceMappingURL=IndexingWorker.js.map