export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Static Files (In a real setup with Wrangler, you use [site] or a specialized bucket, 
    // but for simplicity here we handle basic routes and assume the user deploys via Wrangler Pages/Workers)
    
    // API Route: Get a key
    if (path === "/api/get-key" && request.method === "GET") {
      const keys = await env.KEYS_KV.list({ prefix: "key:" });
      const unclaimed = [];
      for (const item of keys.keys) {
        const val = await env.KEYS_KV.get(item.name, { type: "json" });
        if (!val.claimed) {
          unclaimed.push({ name: item.name, data: val });
        }
      }

      if (unclaimed.length === 0) {
        return new Response(JSON.stringify({ error: "No keys left" }), { status: 404 });
      }

      const selected = unclaimed[Math.floor(Math.random() * unclaimed.length)];
      const updatedData = {
        ...selected.data,
        claimed: true,
        claimedAt: Date.now()
      };

      // Set expiry if defined
      let expirationTtl = undefined;
      if (updatedData.expiryString) {
        const seconds = parseExpiry(updatedData.expiryString);
        if (seconds) expirationTtl = seconds;
      }

      await env.KEYS_KV.put(selected.name, JSON.stringify(updatedData), { expirationTtl });
      
      return new Response(JSON.stringify({ key: selected.data.key }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // API Route: Verify Admin
    if (path === "/api/admin/verify" && request.method === "POST") {
      const { pass } = await request.json();
      const isValid = pass === env.AD_PASS;
      return new Response(JSON.stringify({ success: isValid }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Admin Auth Middleware check
    const auth = request.headers.get("Authorization");
    const isAdmin = auth === env.AD_PASS;

    if (path.startsWith("/api/admin/") && !isAdmin) {
      return new Response("Unauthorized", { status: 401 });
    }

    // API Route: List keys for Admin
    if (path === "/api/admin/keys" && request.method === "GET") {
      const list = await env.KEYS_KV.list({ prefix: "key:" });
      const keys = [];
      let total = 0, claimed = 0, last24h = 0;
      const now = Date.now();

      for (const item of list.keys) {
        const val = await env.KEYS_KV.get(item.name, { type: "json" });
        total++;
        if (val.claimed) {
          claimed++;
          if (now - val.claimedAt < 24 * 60 * 60 * 1000) last24h++;
        }
        keys.push(val);
      }

      return new Response(JSON.stringify({ keys, total, claimed, last24h }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // API Route: Add keys
    if (path === "/api/admin/keys/add" && request.method === "POST") {
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
      return new Response(JSON.stringify({ success: true }));
    }

    // API Route: Delete all
    if (path === "/api/admin/keys/delete-all" && request.method === "POST") {
      const list = await env.KEYS_KV.list({ prefix: "key:" });
      for (const item of list.keys) {
        await env.KEYS_KV.delete(item.name);
      }
      return new Response(JSON.stringify({ success: true }));
    }

    // Serve HTML (Fallback if not using Wrangler Pages)
    // Note: This is an example, usually you use Wrangler Pages for static assets.
    return new Response("Not Found", { status: 404 });
  }
};

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