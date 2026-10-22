# Deploying Connect on WHM (pm2 + nginx)

Target: **https://connect.sarstage.online**
Backend (Express API) → port **4005** · Frontend (Next.js admin panel) → port **4006**
One domain; nginx reverse-proxies `/api/` to the backend and `/` to the frontend.

## 0. Prerequisites (on the server)

- Node.js **20 LTS** (Next.js 16 needs Node ≥ 18.18; use 20). Check: `node -v`.
- pm2 installed globally: `npm i -g pm2`
- A MongoDB database (Atlas or self-hosted) and its connection string.
- DNS: `connect.sarstage.online` A-record points to this server.
- An SSL cert for the domain (WHM AutoSSL, or certbot).

## 1. Upload the project

Put the repo on the server, e.g. `/home/<cpuser>/apps/connect`. The commands
below run from that directory (the one containing `backend/`, `frontend/`,
`ecosystem.config.js`).

## 2. Configure secrets

`backend/.env` is already created with production values. **Fill the real
secrets** (do not commit it):

- `MongoDb_Connection_String` — real DB credentials
- `JWT_SECRET` — long random string
- `EMAIL` — your Resend sender address

`secretKey` must stay equal to the `secretKey` in
`frontend/src/util/config.ts` (currently `5TIvw5cpc0`). The frontend's
`baseURL` is already set to `https://connect.sarstage.online/api/` and
`isStandaloneMode` is `false`.

> The frontend `baseURL` and `secretKey` are compiled into the browser bundle
> at **build time**, so set them before step 4.

## 3. Install & seed the backend

```bash
cd backend
npm install --omit=dev
mkdir -p uploads
# first deploy only — seed base data + an admin login:
node seed_database.js
node seed_admin.js
# optional demo content:
# node seed_demo_content.js
cd ..
```

## 4. Install & build the frontend (standalone)

```bash
cd frontend
npm install
npm run build:standalone   # next build + copies static/public into .next/standalone
cd ..
```

## 5. Start both with pm2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup        # run the command it prints so pm2 survives reboot
pm2 status
```

Quick local check before nginx:

```bash
curl -I http://127.0.0.1:4006            # frontend
curl -s http://127.0.0.1:4005/admin/...  # backend (any known route)
```

## 6. nginx

Copy `deploy/nginx-connect.conf` to `/etc/nginx/conf.d/connect.conf` and fix
the two `ssl_certificate*` paths to your real cert.

On **WHM / EA-Nginx**: don't drop a full `server {}` block (WHM generates its
own). Instead use *WHM → Apache/Nginx → Include Editor* (or
`/etc/nginx/conf.d/users/<cpuser>/…`) and paste the three `location` blocks
(`/api/`, `/socket.io/`, `/`) plus the `map $http_upgrade` line into the
domain's SSL vhost.

Then:

```bash
nginx -t && systemctl reload nginx
```

## 7. Verify

- https://connect.sarstage.online → admin panel loads
- Log in with the admin from `seed_admin.js`
- Network tab: API calls hit `https://connect.sarstage.online/api/admin/...` and return 200

## Updating later

```bash
cd frontend && npm run build:standalone && cd ..
pm2 reload ecosystem.config.js
```

## Notes

- `/api/` strips its prefix (trailing slash on `proxy_pass`), so backend routes
  stay `/admin`, `/client`, `/uploads`. Uploaded media is served at
  `https://connect.sarstage.online/api/uploads/...`.
- Ports 4005/4006 are bound to `127.0.0.1` via pm2/HOSTNAME and never exposed
  publicly — only nginx (443) faces the internet.
- `backend/.env` and `.next/` are gitignored; keep `.env` secret.
