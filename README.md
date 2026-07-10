# Sleek Dashboard Builder - POC

A production-grade, highly scalable **Dashboard Builder Proof of Concept (POC)** that allows users to create, drag, resize, configure, and persist customized data visualization layouts.

This application is built with a decoupled architecture separating the **Dashboard Shell** from the **Widget Renderer Logic**, ensuring developer velocity and high-performance rendering.

---

## 🚀 How to Run the App

The recommended way to run this POC is using **Docker Compose**, which spins up MongoDB, the API service, and the React frontend.

### Prerequisites
- Docker & Docker Compose installed.
- (Optional) Node.js v20+ and MongoDB locally if running without containers.

### Method 1: Running with Docker (Recommended)
1. In the root directory, run:
   ```bash
   docker-compose up --build
   ```
2. Once the build completes:
   - **Frontend Dashboard**: Open [http://localhost:5173](http://localhost:5173) in your browser.
   - **Backend API Docs**: Verify backend status at [http://localhost:5000/api/dashboard/default](http://localhost:5000/api/dashboard/default).
   - **MongoDB Instance**: Port `27017` will be exposed.

### Method 2: Running Locally (Without Docker)
1. **Start MongoDB**: Make sure you have a local MongoDB daemon running on `mongodb://localhost:27017/dashboard_builder`.
2. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. **Start Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173).

---

## 🧪 Testing

We have included automated unit tests for data schemas and integrations testing the widget registry.

### Run Backend Tests
Tests API validation pathways, strict schemas, and the mock data engine:
```bash
cd backend
npm run test
```

### Run Frontend Tests
Validates the dynamic widget registry components mapping and configurations:
```bash
cd frontend
npm run test
```

---


![alt text](image.png)

![alt text](image-1.png)