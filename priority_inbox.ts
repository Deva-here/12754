import { setAuthToken, Log } from "./logging-middleware/src/index.js";

const API_BASE = "http://4.224.186.213/evaluation-service";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJkZXZhbmFuZC4xMDYwNkBnbWFpbC5jb20iLCJleHAiOjE3ODE2Nzk0NTQsImlhdCI6MTc4MTY3ODU1NCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6Ijg0ZjYyMDZjLWNhOTMtNDU4Yy1hMjRlLThlZTcwOGJmNDZmOSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImRldmFuYW5kIHYiLCJzdWIiOiI5MzIzY2VhYS1iMDZiLTQxZWEtYjRhNS1lM2Y4MWU1YTAyMDkifSwiZW1haWwiOiJkZXZhbmFuZC4xMDYwNkBnbWFpbC5jb20iLCJuYW1lIjoiZGV2YW5hbmQgdiIsInJvbGxObyI6IjEyNzU0IiwiYWNjZXNzQ29kZSI6Imp1RnBodiIsImNsaWVudElEIjoiOTMyM2NlYWEtYjA2Yi00MWVhLWI0YTUtZTNmODFlNWEwMjA5IiwiY2xpZW50U2VjcmV0IjoiVmZ2dXN4cmpHQmN1VXpkcCJ9.ptF80U6RsAT8Oj9GANJD5cFd0JQ-OWbB02R20JMK0-Y";

type Notification = {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
};

const WEIGHTS: Record<Notification["Type"], number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function computeScore(n: Notification): number {
  const weight = WEIGHTS[n.Type];
  const time = new Date(n.Timestamp).getTime();
  return weight * 1e12 + time;
}

class MinHeap {
  private heap: { notification: Notification; score: number }[] = [];

  push(item: { notification: Notification; score: number }): void {
    this.heap.push(item);
    let i = this.heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.heap[p].score <= this.heap[i].score) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  pop(): { notification: Notification; score: number } | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapify(0);
    }
    return top;
  }

  peek(): { notification: Notification; score: number } | undefined {
    return this.heap[0];
  }

  get size(): number {
    return this.heap.length;
  }

  private heapify(i: number): void {
    const n = this.heap.length;
    let smallest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l < n && this.heap[l].score < this.heap[smallest].score) smallest = l;
    if (r < n && this.heap[r].score < this.heap[smallest].score) smallest = r;
    if (smallest !== i) {
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      this.heapify(smallest);
    }
  }

  sorted(): { notification: Notification; score: number }[] {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }
}

async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.notifications as Notification[];
}

function getTopN(notifications: Notification[], n: number): Notification[] {
  const heap = new MinHeap();

  for (const notification of notifications) {
    const score = computeScore(notification);
    if (heap.size < n) {
      heap.push({ notification, score });
    } else if (score > heap.peek()!.score) {
      heap.pop();
      heap.push({ notification, score });
    }
  }

  return heap.sorted().map((item) => item.notification);
}

async function main() {
  setAuthToken(TOKEN);

  try {
    const notifications = await fetchNotifications();
    await Log("backend", "info", "service", `Fetched ${notifications.length} notifications`);

    console.log("=== ALL NOTIFICATIONS ===");
    notifications.forEach((n) => {
      console.log(`[${n.Type}] ${n.Message} @ ${n.Timestamp} (score: ${computeScore(n)})`);
    });

    const top10 = getTopN(notifications, 10);
    await Log("backend", "info", "service", `Computed top ${top10.length} priority notifications`);

    console.log("\n=== TOP 10 PRIORITY NOTIFICATIONS ===");
    top10.forEach((n, i) => {
      console.log(`${i + 1}. [${n.Type}] ${n.Message} @ ${n.Timestamp}`);
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await Log("backend", "error", "service", `Priority inbox failed: ${msg}`);
    console.error("Error:", msg);
  }
}

main();
