const logger = require('../utils/logger');

/**
 * Register all Socket.io event handlers.
 * Events:
 *   - connection / disconnect
 *   - session:join        — user joins their session room
 *   - session:heartbeat   — periodic ping to update session activity
 *   - emotion:update      — real-time emotion data from client
 *   - notification:ack    — client acknowledges a notification
 *   - admin:join          — admin joins the real-time dashboard room
 *   - user:presence       — broadcast user presence in VR zone
 *
 * @param {import('socket.io').Server} io
 */
function initSocketHandlers(io) {
    // Track active sessions: sessionId → socket set
    const activeSessions = new Map();

    io.on('connection', (socket) => {
        const { userId, sessionId, role } = socket.handshake.auth;
        logger.info(`Socket connected: ${socket.id} (User: ${userId})`);

        // ── Session room ─────────────────────────────────────────
        if (sessionId) {
            socket.join(`session:${sessionId}`);
            if (!activeSessions.has(sessionId)) activeSessions.set(sessionId, new Set());
            activeSessions.get(sessionId).add(socket.id);
            logger.info(`User ${userId} joined session room: ${sessionId}`);
        }

        // ── Admin dashboard room ──────────────────────────────────
        if (role === 'admin' || role === 'researcher') {
            socket.join('admin');
            logger.info(`Admin/researcher ${userId} joined admin room`);
        }

        // ── Heartbeat: client pings every 30s to confirm activity ─
        socket.on('session:heartbeat', (data) => {
            io.to('admin').emit('session:heartbeat', {
                userId, sessionId, zone: data?.zone, timestamp: new Date(),
            });
        });

        // ── Emotion update from client ────────────────────────────
        socket.on('emotion:update', (data) => {
            // Relay to admin room for live dashboard
            io.to('admin').emit('emotion:update', { userId, sessionId, ...data, timestamp: new Date() });
        });

        // ── User zone movement in VR store ────────────────────────
        socket.on('user:presence', (data) => {
            // Broadcast to others in same session (multi-user VR)
            socket.to(`session:${sessionId}`).emit('user:presence', {
                userId,
                zone: data.zone,
                position: data.position,
                timestamp: new Date(),
            });
            // Relay zone position to admin dashboard
            io.to('admin').emit('user:presence', { userId, sessionId, ...data });
        });

        // ── Chat streaming token ──────────────────────────────────
        socket.on('chat:token', (token) => {
            socket.to(`session:${sessionId}`).emit('chat:token', token);
        });

        // ── Recommendation update push ────────────────────────────
        socket.on('recommendation:request', (data) => {
            // Backend can push updated recommendations to this session
            socket.emit('recommendation:update', { products: [], reason: 'Based on your current activity' });
        });

        // ── Notification acknowledgment ───────────────────────────
        socket.on('notification:ack', (notifId) => {
            logger.info(`Notification acked: ${notifId} by ${userId}`);
        });

        // ── Disconnect ───────────────────────────────────────────
        socket.on('disconnect', (reason) => {
            logger.info(`Socket disconnected: ${socket.id} (${reason})`);
            if (sessionId && activeSessions.has(sessionId)) {
                activeSessions.get(sessionId).delete(socket.id);
                if (activeSessions.get(sessionId).size === 0) {
                    activeSessions.delete(sessionId);
                }
            }
            io.to('admin').emit('user:disconnected', { userId, sessionId, timestamp: new Date() });
        });
    });

    // ── Helper: push a notification to a specific session ────────
    io.pushNotification = (sessionId, notification) => {
        io.to(`session:${sessionId}`).emit('notification:push', notification);
    };

    logger.info('✅ Socket.io handlers registered');
}

module.exports = { initSocketHandlers };
