---
name: cloud-run-puppeteer
type: reference
description: "Deploys Puppeteer browser automation on Google Cloud Run with Docker. Use when running headless browser tasks on Cloud Run, or when the user mentions Cloud Run, Puppeteer, headless Chrome, or serverless browser automation."
effort: 2
allowed-tools: Read, Glob, Grep, Bash
user-invocable: true
when_to_use: "When deploying a Node.js + Puppeteer / headless Chrome service to Google Cloud Run"
---

# Cloud Run + Puppeteer Deployment Guide

Hard-won lessons from deploying Puppeteer to Cloud Run. These are non-obvious gotchas that cost significant debug time.

## MUST: Use gen2 Execution Environment

Cloud Run **gen1** uses gVisor sandbox — blocks Linux syscalls Chrome needs to create processes. Puppeteer will hang/timeout silently.

```bash
gcloud run deploy my-service \
  --execution-environment gen2   # <-- required for Chrome/Puppeteer
```

Never deploy a Puppeteer service on gen1.

---

## MUST: Install Chrome System Dependencies

`node:18` base image does not include libraries Chrome needs. Missing any one of these causes launch failure.

```dockerfile
FROM node:18

RUN apt-get update && apt-get install -y \
    ca-certificates fonts-liberation fonts-ipafont-gothic fonts-wqy-zenhei \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libcairo2 libcups2 \
    libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
    libpango-1.0-0 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
    libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
    libxss1 libxtst6 xdg-utils --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
```

---

## MUST: Secret Manager mount path ngoài WORKDIR

Nếu mount secret vào cùng path với `WORKDIR`, volume mount sẽ **che toàn bộ thư mục** — chỉ còn file secret, code biến mất.

```bash
# SAI — mount trùng WORKDIR /app
--set-secrets "/app/service-account.json=my-secret:latest"

# ĐÚNG — mount ra path riêng
--set-secrets "/secrets/service-account.json=my-secret:latest"
```

```dockerfile
ENV GOOGLE_CREDS_PATH=/secrets/service-account.json
```

> **Windows/Git Bash warning:** `--set-env-vars` với path Unix sẽ bị Git Bash convert thành Windows path. Set `ENV` trực tiếp trong Dockerfile thay vì truyền qua CLI.

---

## Puppeteer Launch Config cho Cloud Run

```javascript
const browser = await puppeteer.launch({
    headless: 'new',
    timeout: 60000,          // cold start cần thời gian — mặc định 30s không đủ
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',   // /dev/shm nhỏ trong container
        '--single-process',
        '--no-zygote',
        '--disable-gpu',
    ],
});
```

---

## waitUntil hợp lệ trong Puppeteer

Chỉ có 4 giá trị hợp lệ — `'commit'` (từ Playwright) KHÔNG tồn tại:

| Giá trị | Ý nghĩa |
|---------|---------|
| `load` | Chờ event `load` (chậm nhất) |
| `domcontentloaded` | Chờ DOM parse xong (khuyên dùng) |
| `networkidle0` | Không còn request nào trong 500ms |
| `networkidle2` | ≤ 2 request đang chờ trong 500ms |

Với trang nặng từ server overseas, dùng `domcontentloaded` + timeout cao + `waitForFunction` chờ content cụ thể:

```javascript
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForFunction(
    () => document.body && document.body.innerText.includes('target-text'),
    { timeout: 60000 }
);
```

---

## Block Resource để Tăng Tốc

Chặn images, CSS, fonts giảm băng thông đáng kể — quan trọng khi crawl từ server overseas:

```javascript
await page.setRequestInterception(true);
page.on('request', (req) => {
    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
        req.abort();
    } else {
        req.continue();
    }
});
```

---

## Recommended Cloud Run Deploy Command

```bash
gcloud run deploy my-service \
  --image gcr.io/PROJECT_ID/my-image \
  --region asia-southeast1 \
  --platform managed \
  --execution-environment gen2 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --set-secrets "/secrets/service-account.json=my-secret:latest" \
  --allow-unauthenticated
```

Puppeteer cần ít nhất **2Gi RAM** — Chrome dùng nhiều memory.
