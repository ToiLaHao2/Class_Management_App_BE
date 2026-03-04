import { Worker, Job } from 'bullmq';
import { createRedisConnection } from '@core/cache/src/redis-connection';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const processors: Record<string, (job: Job) => Promise<unknown>> = require('./processors');

const connection = createRedisConnection(
    { maxRetriesPerRequest: null },
    '[Worker]'
);

console.log('---------------------------------------');
console.log('👷 WORKER SERVICE IS STARTING...');
console.log('---------------------------------------');

if (!connection) {
    console.warn('⚠️  [Worker] Redis not configured. Worker will not process jobs.');
    console.warn('   Set REDIS_HOST in .env to enable job queue.');
    process.exit(0);
}

connection.connect().catch(() => {
    // Error handled by event listeners in createRedisConnection
});

const worker = new Worker('system-queue', async (job: Job) => {
    const handler = processors[job.name];

    if (!handler) {
        throw new Error(`❌ No processor found for job: ${job.name}`);
    }

    return handler(job);
}, {
    connection,
    concurrency: 5
});

worker.on('active', (job: Job) => console.log(`▶️  [Start] Job ${job.id} (${job.name}) started...`));
worker.on('completed', (job: Job) => console.log(`🎉 [Done]  Job ${job.id} completed.`));
worker.on('failed', (job: Job | undefined, err: Error) => console.error(`🔥 [Fail]  Job ${job?.id} failed: ${err.message}`));

console.log("🚀 Worker is ready to receive jobs from 'system-queue'!");
