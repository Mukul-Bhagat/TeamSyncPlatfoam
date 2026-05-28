import { IndexingQueue, type IndexingJob } from './IndexingQueue';
import { EmbeddingProviderFactory } from '../embeddings/EmbeddingProviderFactory';
import { VectorProviderFactory } from '../vectors/VectorProviderFactory';
import { supabase } from '../../shared/database';
import { env } from '../../config/env';

export class IndexingWorker {
  private queue: IndexingQueue;
  private isRunning: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private embeddingProvider = EmbeddingProviderFactory.create(
    'openai',
    { apiKey: env.OPENAI_API_KEY || '' }
  );
  private vectorProvider = VectorProviderFactory.create('pgvector', 1536);

  constructor(queue: IndexingQueue) {
    this.queue = queue;
  }

  /**
   * Start the worker
   */
  start(): void {
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
  stop(): void {
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
  private async processNextJob(): Promise<void> {
    const job = this.queue.dequeue();
    if (!job) {
      return;
    }

    try {
      await this.processJob(job);
      this.queue.complete(job.id);
    } catch (error) {
      this.queue.fail(job.id, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Process a single indexing job
   */
  private async processJob(job: IndexingJob): Promise<void> {
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
  private async fetchDocument(job: IndexingJob): Promise<{
    title: string;
    content: string;
    searchableText: string;
    metadata: Record<string, unknown>;
  } | null> {
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
  private async fetchMessage(messageId: string): Promise<any> {
    const { data, error } = await supabase
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
  private async fetchSummary(summaryId: string): Promise<any> {
    const { data, error } = await supabase
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
  private async fetchIncident(incidentId: string): Promise<any> {
    const { data, error } = await supabase
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
  private async fetchDeployment(deploymentId: string): Promise<any> {
    const { data, error } = await supabase
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
  private async storeDocument(
    job: IndexingJob,
    document: any,
    embedding: number[]
  ): Promise<void> {
    // Check if document already exists
    const { data: existing } = await supabase
      .from('search_documents')
      .select('id')
      .eq('entity_type', job.entityType)
      .eq('entity_id', job.entityId)
      .single();

    if (existing) {
      // Update existing document
      await supabase
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
    } else {
      // Insert new document
      await supabase
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
