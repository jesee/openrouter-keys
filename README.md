# OpenRouter Keys Manager

这是一个Cloudflare Worker，用于管理OpenRouter API密钥的创建和删除。

## 功能

- 创建新的API密钥
- 删除现有API密钥

## API端点

### 创建新密钥

```
POST /keys
```

返回示例：
```json
{
  "key": "or-xxxxx",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 删除密钥

```
DELETE /keys/{key}
```

返回示例：
```json
{
  "success": true
}
```

## 部署说明

1. 安装Wrangler CLI:
```bash
npm install -g wrangler
```

2. 登录到你的Cloudflare账户:
```bash
wrangler login
```

3. 设置环境变量:
在Cloudflare Dashboard中或使用wrangler设置以下环境变量：
- `OPENROUTER_API_KEY`: 你的OpenRouter API密钥

4. 部署Worker:
```bash
wrangler deploy
```

## 环境变量

- `OPENROUTER_API_KEY`: 用于认证OpenRouter API请求的密钥 