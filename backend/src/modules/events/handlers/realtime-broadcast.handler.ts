import { InternalEventBus } from '../../../core/event-bus';
import { RealtimeService } from '../../realtime/service';
import type { EcosystemEvent } from '../../../types';

export function registerRealtimeBroadcastHandler(): void {
  const eventBus = InternalEventBus.getInstance();
  const realtimeService = RealtimeService.getInstance();

  eventBus.subscribeAll(async (event: EcosystemEvent) => {
    realtimeService.broadcastToOrg(event.organization_id, event);
  });

  console.log('[RealtimeBroadcastHandler] Registered realtime broadcast handler');
}
