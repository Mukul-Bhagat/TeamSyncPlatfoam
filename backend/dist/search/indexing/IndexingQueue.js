"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexingQueue = void 0;
class IndexingQueue {
    queue = new Map();
    processing = new Set();
    listeners = new Set();
    /**
     * Add a job to the queue
     */
    enqueue(job) {
        const id = `${job.entityType}:${job.entityId}:${Date.now()}`;
        const fullJob = {
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
    dequeue() {
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
    complete(jobId) {
        this.processing.delete(jobId);
    }
    /**
     * Mark a job as failed and requeue if retries remain
     */
    fail(jobId, error) {
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
    getStats() {
        return {
            queued: this.queue.size,
            processing: this.processing.size,
        };
    }
    /**
     * Register a listener for new jobs
     */
    onJob(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    /**
     * Notify all listeners of a new job
     */
    notifyListeners(job) {
        this.listeners.forEach((listener) => listener(job));
    }
    /**
     * Clear the queue (for testing/shutdown)
     */
    clear() {
        this.queue.clear();
        this.processing.clear();
    }
}
exports.IndexingQueue = IndexingQueue;
//# sourceMappingURL=IndexingQueue.js.map