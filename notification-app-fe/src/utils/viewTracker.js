const STORAGE_KEY = "viewed_notifications";

function getViewedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persistViewedIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function markAsViewed(id) {
  const ids = getViewedIds();
  ids.add(id);
  persistViewedIds(ids);
}

export function markMultipleAsViewed(ids) {
  const viewed = getViewedIds();
  ids.forEach((id) => viewed.add(id));
  persistViewedIds(viewed);
}

export function isNew(id) {
  return !getViewedIds().has(id);
}

export function markAllAsViewed(ids) {
  const viewed = getViewedIds();
  ids.forEach((id) => viewed.add(id));
  persistViewedIds(viewed);
}
