const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // API Route: Get a key
  if (path === "/api/get-key" && request.method === "GET") {
    try {
      if (!env.KEYS_KV) throw new Error("KV Namespace 'KEYS_KV' not bound in Dashboard Settings → Functions → KV namespace bindings");
      
      const keys = await env.KEYS_KV.list({ prefix: "key:" });
      const unclaimed = [];
      for (const item of keys.keys) {
        const val = await env.KEYS_KV.get(item.name, { type: "json" });
        if (val && !val.claimed) {
          unclaimed.push({ name: item.name, data: val });
        }
      }

      if (unclaimed.length === 0) {
        return new Response(JSON.stringify({ error: "No keys left" }), { 
          status: 404,
          headers: corsHeaders
        });
      }

      const selected = unclaimed[Math.floor(Math.random() * unclaimed.length)];
      const updatedData = {
        ...selected.data,
        claimed: true,
        claimedAt: Date.now()
      };

      let expiration = undefined;
      if (updatedData.expiryString) {
        const seconds = parseExpiry(updatedData.expiryString);
        if (seconds) expiration = Math.floor(Date.now() / 1000) + seconds;
      }

      await env.KEYS_KV.put(selected.name, JSON.stringify(updatedData), { expiration });
      
      return new Response(JSON.stringify({ key: selected.data.key }), { headers: corsHeaders });
    } catch (e) {
      console.error("GET /api/get-key error:", e);
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // API Route: Verify Admin
  if (path === "/api/admin/verify" && request.method === "POST") {
    try {
      if (!env.AD_PASS) {
        return new Response(JSON.stringify({ error: "AD_PASS not configured in Cloudflare Settings → Functions → Environment variables" }), { status: 500, headers: corsHeaders });
      }
      
      const body = await request.json();
      const { pass } = body || {};
      const isValid = pass === env.AD_PASS;
      
      return new Response(JSON.stringify({ success: isValid }), { headers: corsHeaders });
    } catch (e) {
      console.error("POST /api/admin/verify error:", e);
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // Admin Auth Middleware
  const auth = request.headers.get("Authorization");
  const isAdmin = auth === env.AD_PASS;

  if (path.startsWith("/api/admin/") && !isAdmin && path !== "/api/admin/verify") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  // API Route: List keys for Admin
  if (path === "/api/admin/keys" && request.method === "GET") {
    try {
      if (!env.KEYS_KV) throw new Error("KV Namespace not configured");
      
      const list = await env.KEYS_KV.list({ prefix: "key:" });
      const keys = [];
      let total = 0, claimed = 0, last24h = 0;
      const now = Date.now();

      for (const item of list.keys) {
        const val = await env.KEYS_KV.get(item.name, { type: "json" });
        if (!val) continue;
        total++;
        if (val.claimed) {
          claimed++;
          if (now - val.claimedAt < 24 * 60 * 60 * 1000) last24h++;
        }
        keys.push(val);
      }

      return new Response(JSON.stringify({ keys, total, claimed, last24h }), { headers: corsHeaders });
    } catch (e) {
      console.error("GET /api/admin/keys error:", e);
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // API Route: Add keys
  if (path === "/api/admin/keys/add" && request.method === "POST") {
    try {
      if (!env.KEYS_KV) throw new Error("KV Namespace not configured");
      
      const { content, expiry } = await request.json();
      const lines = content.split(/\r?\n/).filter(l => l.trim() !== "");
      
      for (const line of lines) {
        const id = crypto.randomUUID();
        await env.KEYS_KV.put(`key:${id}`, JSON.stringify({
          key: line.trim(),
          claimed: false,
          claimedAt: null,
          expiryString: expiry
        }));
      }
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    } catch (e) {
      console.error("POST /api/admin/keys/add error:", e);
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // API Route: Delete all
  if (path === "/api/admin/keys/delete-all" && request.method === "POST") {
    try {
      if (!env.KEYS_KV) throw new Error("KV Namespace not configured");
      
      const list = await env.KEYS_KV.list({ prefix: "key:" });
      for (const item of list.keys) {
        await env.KEYS_KV.delete(item.name);
      }
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    } catch (e) {
      console.error("POST /api/admin/keys/delete-all error:", e);
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // Default: Fallback to static assets
  return next();
}

function parseExpiry(str) {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return null;
  const val = parseInt(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400
  };
  return val * multipliers[unit];
}