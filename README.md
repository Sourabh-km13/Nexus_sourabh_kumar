# 🚀 Nexus Job Queue System

Nexus is a high-performance, distributed job queue system built with Node.js, Express, and MySQL. It allows for asynchronous job processing with multi-worker support, real-time monitoring, and automatic failure recovery.

## 🏗️ Architecture
- **Producer:** Injects jobs into the system.
- **Dispatcher:** Polls for accepted jobs and moves them into the processing queue.
- **Supervisor:** Manages worker lifecycles, heartbeats, and automatic restarts.
- **Workers:** Generic processes that dequeue jobs and execute business logic.
- **Dashboard:** A React-based frontend for real-time system monitoring.

## 🛠️ Setup Instructions

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MySQL** (installed and running)
- **npm** (comes with Node.js)

### 2. Database Setup
1. Create a MySQL database named `nexus`.
2. Configure your database credentials in `server/config/env.js` (or your `.env` file).
3. Run the migrations to create necessary tables:
   ```bash
   # If using sequelize-cli
   npx sequelize-cli db:migrate
   ```

### 3. Installation
Clone the repository and install dependencies for both backend and frontend:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## 🚀 Running the Application

You will need **three separate terminals** to run the full system:

### Terminal 1: Backend Server & Supervisor
This starts the API, the Dispatcher, and the Worker Supervisor (which spawns all workers).
```bash
npm run dev
```

### Terminal 2: Frontend Dashboard
Starts the React UI for monitoring.
```bash
npm run frontend
```

### Terminal 3: Job Producer
Run this command whenever you want to inject new jobs into the system for testing.
```bash
npm run producer
```

## 📊 System Flow
`Job Produced` $\rightarrow$ `ACCEPTED` $\rightarrow$ `Dispatcher` $\rightarrow$ `QUEUED` $\rightarrow$ `Worker` $\rightarrow$ `PROCESSING` $\rightarrow$ `COMPLETED/FAILED`

## ⚙️ Configuration
- **Queue Names:** Configured in `server/supervisor/worker-supervisor.js`.
- **Worker Logic:** Located in `workers/inventory/v1.js`.
- **Recovery:** The Dispatcher automatically recovers "Zombie" jobs (stuck in PROCESSING for >30 mins) and resets them to `ACCEPTED`.

## 🧪 Testing
- To simulate different job outcomes, you can use the `scripts/simulate-jobs.js` script to redistribute job statuses in the database.
