interface Env {
    OPENROUTER_API_KEY: string;
  }
  
  interface OpenRouterKeyResponse {
    data: {
      name: string;
      label: string;
      limit: number;
      disabled: boolean;
      created_at: string;
      updated_at: string;
      hash: string;
      key: string;
    }
  }
  
  interface OpenRouterDeleteResponse {
    data: {
      success: boolean;
    }
  }
  
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // 添加hash函数
  async function sha256(message: string) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  
  export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
      // Handle CORS preflight requests
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      }
  
      const url = new URL(request.url);
      const path = url.pathname;
  
      try {
        // Create new API key
        if (request.method === "POST" && path === "/keys") {
          const uuid = generateUUID();
          const response = await fetch("https://openrouter.ai/api/v1/keys", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: uuid
            })
          });
  
          if (!response.ok) {
            const error = await response.json();
            return new Response(JSON.stringify({ error: error.message || "Failed to create key" }), {
              status: response.status,
              headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            });
          }
  
          const data: OpenRouterKeyResponse = await response.json();
          return new Response(JSON.stringify(data), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
  
        // Delete API key
        if (request.method === "DELETE" && path.startsWith("/keys/")) {
          const key = path.split("/").pop() || "";
          
          // 计算hash
          const keyHash = await sha256(key);
          
          const response = await fetch(`https://openrouter.ai/api/v1/keys/${keyHash}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
            },
          });
  
          if (!response.ok) {
            const error = await response.json();
            return new Response(JSON.stringify({ error: error.message || "Failed to delete key" }), {
              status: response.status,
              headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            });
          }
  
          const data: OpenRouterDeleteResponse = await response.json();
          return new Response(JSON.stringify(data), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
  
        return new Response(JSON.stringify({ error: "Not Found" }), {
          status: 404,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    },
  };