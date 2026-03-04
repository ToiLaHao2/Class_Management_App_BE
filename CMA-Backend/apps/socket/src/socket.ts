import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createRedisConnection } from '@core/cache/src/redis-connection';

const PORT = 3002;

console.log('\n--- 🔌 SOCKET SERVICE STARTING ---');

function startSocketServer(adapter: ReturnType<typeof createAdapter> | null): void {
    const io = new Server(PORT, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
        ...(adapter ? { adapter } : {})
    });

    io.on('connection', (socket) => {
        console.log(`⚡ Client connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    const mode = adapter ? 'Redis adapter' : 'in-memory (single-node)';
    console.log(`🚀 Socket Server running on port ${PORT} — ${mode}`);
}

const pubClient = createRedisConnection({}, '[Socket/pub]');
const subClient = pubClient ? pubClient.duplicate() : null;

if (!pubClient) {
    startSocketServer(null);
} else {
    Promise.all([pubClient.connect(), subClient!.connect()])
        .then(() => {
            console.log('✅ [Socket] Redis adapter connected.');
            startSocketServer(createAdapter(pubClient, subClient!));
        })
        .catch(() => {
            console.warn('⚠️  [Socket] Starting without Redis adapter (single-node mode).');
            startSocketServer(null);
        });
}
