"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRealtimeBroadcastHandler = registerRealtimeBroadcastHandler;
const event_bus_1 = require("../../../core/event-bus");
const service_1 = require("../../realtime/service");
function registerRealtimeBroadcastHandler() {
    const eventBus = event_bus_1.InternalEventBus.getInstance();
    const realtimeService = service_1.RealtimeService.getInstance();
    eventBus.subscribeAll(async (event) => {
        realtimeService.broadcastToOrg(event.organization_id, event);
    });
    console.log('[RealtimeBroadcastHandler] Registered realtime broadcast handler');
}
//# sourceMappingURL=realtime-broadcast.handler.js.map