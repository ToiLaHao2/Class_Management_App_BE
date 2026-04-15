// Enable combo mode before any imports so standalone listeners are bypassed
process.env.COMBO_MODE = 'true';

import { app } from './app';
import { bootstrapSocket } from '../../socket/src/socket';
import * as http from 'http';
import { appConfig } from '@core/config';

const PORT = appConfig.port;

async function startComboServer() {
    console.log(`\n===============================================`);
    console.log(`🌟 STARTING COMBO SERVER 🌟`);
    console.log(`===============================================`);

    try {
        const server = http.createServer(app);

        // Initialize socket and attach it to the Express HTTP Server
        await bootstrapSocket(server);

        server.listen(PORT, () => {
             console.log(`🚀 API Gateway running at: http://localhost:${PORT}`);
             console.log(`📖 Swagger UI running at: http://localhost:${PORT}/docs`);
             console.log(`🔌 Socket Server gracefully attached to port ${PORT} `);
             console.log(`✅ [Combo] Architecture successfully merged on 1 Port`);
             console.log(`===============================================\n`);
        });
    } catch (err) {
        console.error("❌ Failed to start combo server:", err);
        process.exit(1);
    }
}

startComboServer();
