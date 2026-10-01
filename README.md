# Shortie - Web & API Platform

This repository contains the backend REST API server, real-time WebSocket engine, database seed configurations, and the Next.js admin management panel.

## Architecture

* **Backend (`/backend`)**: Node.js & Express RESTful API with Socket.IO real-time engine and MongoDB Mongoose models.
* **Frontend (`/frontend`)**: Next.js 16 & React 18 administrative panel with Material-UI and Redux Toolkit.
* **Database (`/DB`)**: Seed data for initial system configuration, currencies, languages, and translations.

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
# Configure your .env file from .env.example
node index.js
```

Backend will run on **http://localhost:5000**.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on **http://localhost:5001**.
