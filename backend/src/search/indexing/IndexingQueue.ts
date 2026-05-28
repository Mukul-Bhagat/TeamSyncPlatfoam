export interface IndexingJob {
  id: string;
  entityType: string;
  entityId: string;
  organizationId: string;
  workspaceId?: string;
  priority: number;
  createdAt: Date;
  retryCount: number;
  maxRetries: number;
}

export class IndexingQueue {
  private queue: Map<string, IndexingJob> = new Map();
  private processing: Set<string> = new Set();
  private listeners: Set<(job: IndexingJob) => void> = new Set();

  /**
   * Add a job to the queue
   */
  enqueue(job: Omit<IndexingJob, 'id' | 'createdAt' | 'retryCount'>): string {
    const id = `${job.entityType}:${job.entityId}:${Date.now()}`;
    const fullJob: IndexingJob = {
      ...job,
      id,
      createdAt: new Date(),
      retryCount: 0,
    };
    this.queue.set(id, fullJob);
    this.notifyListeners(fullJob);
    return id;
  }

  /**
   * Get the next job from the queue (highest priority first)
   */
  dequeue(): IndexingJob | null {
    if (this.queue.size === 0) {
      return null;
    }

    // Sort by priority (higher priority first), then by creation time
    const sortedJobs = Array.from(this.queue.entries()).sort(([, a], [, b]) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const [id, job] = sortedJobs[0];
    this.queue.delete(id);
    this.processing.add(id);
    return job;
  }

  /**
   * Mark a job as completed
   */
  complete(jobId: string): void {
    this.processing.delete(jobId);
  }

  /**
   * Mark a job as failed and requeue if retries remain
   */
  fail(jobId: string, error?: Error): boolean {
    this.processing.delete(jobId);
    const job = this.queue.get(jobId);
    
    if (!job) {
      return false;
    }

    if (job.retryCount < job.maxRetries) {
      job.retryCount++;
      job.priority = Math.max(1, job.priority - 1); // Decrease priority on retry
      this.queue.set(jobId, job);
      this.notifyListeners(job);
      return true;
    }

    // Max retries exceeded, remove from queue
    this.queue.delete(jobId);
    console.error(`[IndexingQueue] Job ${jobId} failed after ${job.maxRetries} retries:`, error);
    return false;
  }

  /**
   * Get queue statistics
   */
  getStats(): { queued: number; processing: number } {
    return {
      queued: this.queue.size,
      processing: this.processing.size,
    };
  }

  /**
   * Register a listener for new jobs
   */
  onJob(listener: (job: IndexingJob) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of a new job
   */
  private notifyListeners(job: IndexingJob): void {
    this.listeners.forEach((listener) => listener(job));
  }

  /**
   * Clear the queue (for testing/shutdown)
   */
  clear(): void {
    this.queue.clear();
    this.processing.clear();
  }
}
