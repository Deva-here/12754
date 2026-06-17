# Notification System Design

## Stage 1 — Priority Inbox

### Approach

The goal is to find the top N most important unread notifications from a stream of notifications. Priority is determined by a combination of **notification type weight** and **recency**.

#### Scoring Formula

```
score = weight(type) × 10¹² + timestamp_ms
```

| Type | Weight |
|-----------|--------|
| Placement | 3 |
| Result | 2 |
| Event | 1 |

The multiplier 10¹² ensures weight dominates over recency (since timestamps are ~10¹² ms from epoch), so Placement notifications naturally rank higher than Results, which rank higher than Events. Among notifications of the same type, newer ones rank higher.

#### Algorithm: Min-Heap of Size N

1. Fetch all notifications from the API.
2. Iterate over each notification and compute its score.
3. Maintain a **Min-Heap of size N**: 
   - If the heap has fewer than N items, push the current notification.
   - If the heap is full and the current notification's score is greater than the heap's minimum (root), pop the root and push the current one.
4. At the end, extract all elements from the heap and sort them descending by score.

This gives **O(M log N)** time complexity where M is the total number of notifications and N is the desired top count (typically small, e.g. 10 or 20). Space complexity is **O(N)**.

#### Handling Continuous Stream

Since new notifications arrive over time, the approach handles this by re-fetching on a polling interval (e.g., every 30 seconds) and re-running the heap algorithm. The Min-Heap approach is efficient enough to recompute on each poll. For higher throughput, a persistent heap could be maintained and new notifications merged in O(log N) each.

#### Why Min-Heap?

A Min-Heap of size N is optimal for streaming top-N problems:
- **O(log N)** insert per element vs **O(N log N)** for full sort
- Only N elements are kept in memory at any time
- Scales well even with thousands of notifications

#### Edge Cases Considered

- Fewer than N notifications available → all returned
- Empty notification list → empty result
- Same-score notifications → insertion order preserved (stable)
- Malformed timestamps → handled via try/catch with logging
