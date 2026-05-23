import { preMidConfig } from "@/lib/constants";

export const prerender = false;

const activities = new Map();
const maxRequestBytes = 8 * 1024;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "X-Content-Type-Options": "nosniff",
};

const json = (data, status = 200) =>
  Response.json(data, { status, headers: { ...corsHeaders } });

const isValidUrl = (url) => {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const getActivityKey = (activity) =>
  JSON.stringify({ name: activity.name, details: activity.details ?? "", state: activity.state ?? "" });

const getActivityScore = (activity) =>
  (activity.timestamps?.start ? 2 : 0) +
  (activity.timestamps?.end ? 2 : 0) +
  (activity.buttons?.length ?? 0) * 3 +
  (activity.assets?.large_image ? 1 : 0) +
  (activity.assets?.small_image ? 1 : 0);

const validateActivity = (activity) => {
  if (!activity || typeof activity !== "object" || typeof activity.name !== "string" || !activity.name.trim() || activity.name.length > 128)
    return false;
  if (activity.details !== undefined && (typeof activity.details !== "string" || activity.details.length > 128)) return false;
  if (activity.state !== undefined && (typeof activity.state !== "string" || activity.state.length > 128)) return false;
  if (activity.timestamps &&
    (typeof activity.timestamps !== "object" ||
      (activity.timestamps.start !== undefined && typeof activity.timestamps.start !== "number") ||
      (activity.timestamps.end !== undefined && typeof activity.timestamps.end !== "number")))
    return false;
  if (activity.buttons !== undefined) {
    if (!Array.isArray(activity.buttons) || activity.buttons.length > 2) return false;
    for (const b of activity.buttons) {
      if (
        !b ||
        typeof b !== "object" ||
        typeof b.label !== "string" ||
        typeof b.url !== "string" ||
        !b.label ||
        b.label.length > 32 ||
        b.url.length > 512 ||
        !isValidUrl(b.url)
      )
        return false;
    }
  }
  if (activity.assets &&
    (typeof activity.assets !== "object" ||
      (activity.assets.large_image !== undefined && (typeof activity.assets.large_image !== "string" || activity.assets.large_image.length > 256)) ||
      (activity.assets.small_image !== undefined && (typeof activity.assets.small_image !== "string" || activity.assets.small_image.length > 256))))
    return false;
  return true;
};

const validateExtension = (extension) =>
  extension && typeof extension === "object" && typeof extension.user_id === "string" && extension.user_id.length > 0;

const cleanupExpiredActivities = () => {
  const now = Date.now();
  for (const [key, entry] of activities.entries()) {
    if (now - entry.lastUpdate >= preMidConfig.activityTimeoutMs) {
      activities.delete(key);
    }
  }
};

const removeOldestActivity = () => {
  let oldestKey;
  let oldestTime = Number.POSITIVE_INFINITY;

  for (const [key, entry] of activities.entries()) {
    if (entry.lastUpdate < oldestTime) {
      oldestKey = key;
      oldestTime = entry.lastUpdate;
    }
  }

  if (oldestKey) activities.delete(oldestKey);
};

async function fetchJsonWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "error",
      headers: { Accept: "application/json" },
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function parseRequestBody(request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maxRequestBytes) {
    return { error: json({ error: "Payload too large" }, 413) };
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).length > maxRequestBytes) {
    return { error: json({ error: "Payload too large" }, 413) };
  }

  if (!rawBody.trim()) {
    return { error: json({ error: "Invalid JSON" }, 400) };
  }

  try {
    return { body: JSON.parse(rawBody) };
  } catch {
    return { error: json({ error: "Invalid JSON" }, 400) };
  }
}

export const OPTIONS = async () => {
  return new Response(null, { status: 200, headers: { ...corsHeaders } });
};

export const POST = async ({ request }) => {
  const parsed = await parseRequestBody(request);
  if (parsed.error) return parsed.error;

  const body = parsed.body;

  const { active_activity, extension } = body ?? {};

  if (!validateExtension(extension)) {
    return json({ error: "Invalid or missing extension data" }, 400);
  }

  if (extension.user_id !== preMidConfig.authorizedUserId) {
    return json({ error: "Unauthorized" }, 403);
  }

  cleanupExpiredActivities();

  if (active_activity !== undefined && active_activity !== null) {
    if (!validateActivity(active_activity)) {
      return json({ error: "Invalid activity data" }, 400);
    }

    if (activities.size >= preMidConfig.maxActivities) {
      removeOldestActivity();
    }

    const key = getActivityKey(active_activity);
    const now = Date.now();
    const existing = activities.get(key);
    const shouldUpdate = !existing || getActivityScore(active_activity) >= getActivityScore(existing.activity);

    if (shouldUpdate) {
      activities.set(key, { activity: active_activity, lastUpdate: now });
    } else if (existing) {
      existing.lastUpdate = now;
    }
  } else {
    const now = Date.now();
    const hasRecentActivity = Array.from(activities.values()).some((entry) => now - entry.lastUpdate < preMidConfig.clearThresholdMs);
    if (!hasRecentActivity) activities.clear();
  }

  return json({ success: true });
};

export const GET = async ({ request }) => {
  const hostHeader = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const host = hostHeader.split(",")[0].trim().toLowerCase().split(":")[0];
  const isProduction = preMidConfig.productionHosts.has(host);

  if (!isProduction) {
    try {
      const response = await fetchJsonWithTimeout(preMidConfig.productionApiUrl, preMidConfig.apiTimeoutMs);
      if (!response.ok) throw new Error(`API returned ${response.status}: ${response.statusText}`);
      const data = await response.json();
      return json(data);
    } catch (error) {
      console.error("Serving local data, failed to fetch from PreMID API:", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        host,
      });
    }
  }

  cleanupExpiredActivities();
  const now = Date.now();
  const activeActivities = Array.from(activities.values()).filter(({ activity }) => !activity.timestamps?.end || activity.timestamps.end > now)
    .map(({ activity, lastUpdate }) => ({ activity, lastUpdate }));

  return Response.json(
    { activities: activeActivities, count: activeActivities.length },
    { status: 200, headers: { ...corsHeaders } },
  );
};
