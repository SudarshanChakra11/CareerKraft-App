import * as api from './api';
import { useAppStore } from '@/store/useAppStore';

const PENDING_KEY = 'ck.pendingSync';
const MAX_RETRIES = 5;

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  } catch (e) {
    return [];
  }
}
function writeQueue(q) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(q));
}

export function enqueue(action) {
  const q = readQueue();
  q.push({ ...action, attempts: 0, ts: Date.now() });
  writeQueue(q);
}

export async function processQueue() {
  const q = readQueue();
  if (!q.length) return;
  const remaining = [];

  for (const item of q) {
    try {
      if (item.type === 'completeTask') {
        await api.completeTask(item.payload.dayNumber, item.payload.taskId);
      } else if (item.type === 'completeDay') {
        const p = item.payload;
        await api.completeDay(p.dayNumber, p.quizCorrect, p.quizTotal, p.isPerfect);
      } else {
        // unknown action -> skip
      }
      // success -> don't requeue
      // after a successful server operation, refresh authoritative progress
      try {
        const serverProgress = await api.getUserProgress();
        const setProgress = useAppStore.getState().setProgress;
        setProgress(serverProgress);
      } catch (e) {
        // ignore failures here
      }
    } catch (err) {
      // If unauthorized, stop processing to let user re-authenticate
      const msg = (err && err.message) ? err.message.toLowerCase() : '';
      if (msg.includes('unauthorized') || msg.includes('no token')) {
        remaining.push(item);
        break;
      }

      item.attempts = (item.attempts || 0) + 1;
      if (item.attempts < MAX_RETRIES) {
        remaining.push(item);
      }
      // else drop item
    }
  }

  writeQueue(remaining);
}

export function pendingCount() {
  return readQueue().length;
}

export default { enqueue, processQueue, pendingCount };
