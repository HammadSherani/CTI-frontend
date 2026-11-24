'use client';

import { useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketProvider';

/**
 * Calls onUpdate when the server says a dispute changed (new reply, status change, new
 * dispute, resolution). The callback should reload the data quietly.
 *
 * match: { disputeId } and/or { bookingId } to react to one dispute / one booking,
 *        or null to react to every dispute (list pages).
 */
export default function useDisputeLive(match, onUpdate) {
  const { socket, connected } = useSocket() || {};
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;
  const disputeId = match?.disputeId ? String(match.disputeId) : '';
  const bookingId = match?.bookingId ? String(match.bookingId) : '';
  const watchAll = !match;

  useEffect(() => {
    if (!socket || (!watchAll && !disputeId && !bookingId)) return undefined;
    let timer = null;
    const handler = (payload) => {
      const hit = watchAll
        || (disputeId && String(payload?.disputeId) === disputeId)
        || (bookingId && String(payload?.bookingId) === bookingId);
      if (!hit) return;
      // several events can arrive together (e.g. reply + status): reload once
      clearTimeout(timer);
      timer = setTimeout(() => callbackRef.current?.(payload), 250);
    };
    socket.on('dispute_updated', handler);
    return () => {
      clearTimeout(timer);
      socket.off('dispute_updated', handler);
    };
  }, [socket, disputeId, bookingId, watchAll]);

  // Events missed while the connection was down: reload once it is back
  const wasConnected = useRef(connected);
  useEffect(() => {
    if (connected && wasConnected.current === false) callbackRef.current?.({ kind: 'reconnected' });
    wasConnected.current = connected;
  }, [connected]);
}
