# AmbulanceDispatch – Nearest Ambulance Allocation System

![Project Status](https://img.shields.io/badge/status-complete-brightgreen)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-green)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Java](https://img.shields.io/badge/Java-17-red)

> A full-stack Java + Spring Boot + React Ambulance Dispatch Management System for a Project Leap college assessment. The system automatically selects and dispatches the **nearest available ambulance** based on a predefined zone proximity matrix.

---

## Project Objective

Modern small-town ambulance services often rely on driver memory rather than data-driven decision making. This leads to inefficient dispatching where a farther ambulance is sent even when a closer unit is available.

**AmbulanceDispatch** solves this by:
- Registering all ambulances and tracking their real-time zone position and availability
- Logging emergency calls with caller zone
- Automatically selecting the nearest available ambulance using a **predefined zone proximity table**
- Tracking response times and providing analytics per zone over configurable date ranges

---

## Features

| Feature | Description |
|---------|-------------|
| 🚑 Ambulance Management | Register, update, relocate, and track all ambulances |
| 📞 Emergency Call Intake | Log incoming calls with caller details and zone |
| 🧠 Nearest Ambulance Algorithm | Automatically select nearest AVAILABLE ambulance by zone distance |
| 🗺️ Zone Management | Define service districts (ZONE-A through ZONE-E) |
| 📏 Proximity Matrix | Configure exact km distances and travel times between zone pairs |
| ✅ Full Dispatch Lifecycle | PENDING → ASSIGNED → IN_PROGRESS → COMPLETED |
| 📊 Analytics Dashboard | Average/min/max response time by zone and date range |
| 🔴 Live Dashboard | Real-time fleet overview, zone statistics, and quick-dispatch actions |
| 🛡️ Business Rule Enforcement | BUSY ambulances cannot be re-assigned; proper state transitions enforced |

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Application runtime |
| Spring Boot | 3.3.4 | Application framework |
| Spring Web (MVC) | - | REST API endpoints |
| Spring Data JPA | - | ORM and database access |
| Spring Validation | - | Request validation |
| Hibernate | 6.5 | JPA provider |
| MySQL Connector/J | - | MySQL database driver |
| Lombok | 1.18.34 | Boilerplate reduction |
| SpringDoc OpenAPI | 2.6.0 | Swagger API documentation |
| Maven | 3.x | Build and dependency management |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| Vite | 5.4.2 | Build tool and dev server |
| React Router | 6.26.2 | Client-side page routing |
| Tailwind CSS | 3.4.10 | Utility-first CSS styling |
| Axios | 1.7.7 | HTTP API client |
| Recharts | 2.x | Data visualization charts |
| Lucide React | 0.441.0 | Modern icon library |

### Database
- **MySQL 8.0**

---

## Architecture

```
Frontend (React + Vite, Port 5173)
        ↕ HTTP REST / Axios
Backend (Spring Boot, Port 8080)
    Controller Layer
        ↕
    Service Layer  ← Business Logic lives here
        ↕
    Repository Layer (Spring Data JPA)
        ↕
    MySQL 8.0 Database (ambulance_dispatch)
```

### Backend Package Structure
```
com.example.ambulancedispatch/
├── controller/         ← REST controllers (no business logic)
│   ├── AmbulanceController.java
│   ├── ZoneController.java
│   ├── ZoneProximityController.java
│   ├── EmergencyCallController.java
│   └── AnalyticsController.java
├── service/            ← All business logic here
│   ├── AmbulanceService.java
│   ├── ZoneService.java
│   ├── ZoneProximityService.java
│   ├── EmergencyCallService.java
│   ├── NearestAmbulanceAllocationService.java  ← Core algorithm
│   └── AnalyticsService.java
├── repository/         ← JPA Repository interfaces
├── entity/             ← JPA Entity classes
├── dto/                ← Request/Response DTOs
├── exception/          ← Custom exceptions + GlobalExceptionHandler
└── config/             ← CORS, OpenAPI, DataInitializer
```

### Frontend Source Structure
```
src/
├── components/         ← Reusable UI components
│   ├── Sidebar.jsx, Navbar.jsx
│   ├── Modal.jsx, ConfirmDialog.jsx
│   ├── StatusBadge.jsx, StatCard.jsx
│   └── Toast.jsx
├── pages/              ← Route-level page components
│   ├── Dashboard.jsx
│   ├── Ambulances.jsx
│   ├── EmergencyCalls.jsx
│   ├── CreateEmergencyCall.jsx
│   ├── Zones.jsx
│   ├── ZoneProximity.jsx
│   └── Analytics.jsx
├── services/           ← Axios API call functions
│   ├── api.js          ← Axios base instance with interceptors
│   ├── ambulanceService.js
│   ├── emergencyCallService.js
│   ├── zoneService.js
│   ├── proximityService.js
│   └── analyticsService.js
├── hooks/              ← useToast context
├── utils/              ← constants.js, formatters.js
├── layouts/            ← MainLayout.jsx
├── App.jsx
└── main.jsx
```

---

## Database Design

### Entity Relationships

```
Zone (1) ←──────────────── (N) Ambulance
 └─ (homeZone, currentZone)

Zone (1) ←──────────────── (N) EmergencyCall
 └─ (callerZone)

Ambulance (1) ←────────── (N) EmergencyCall
 └─ (assignedAmbulance)

Zone (N) ──────────────── (N) Zone (via ZoneProximity)
```

### Tables

| Table | Key Fields |
|-------|------------|
| `zones` | id, zone_code, zone_name |
| `ambulances` | id, ambulance_number, driver_name, home_zone_id, current_zone_id, status, registration_date |
| `zone_proximities` | id, from_zone_id, to_zone_id, distance, estimated_travel_time |
| `emergency_calls` | id, caller_name, caller_phone, emergency_description, caller_zone_id, assigned_ambulance_id, call_time, dispatch_time, arrival_time, completion_time, response_time_minutes, status |

---

## MySQL Setup

### 1. Ensure MySQL 8 is running
```bash
# Check MySQL service on Windows
Get-Service -Name MySQL80
```

### 2. Create the database (auto-created by Spring Boot too)
```sql
CREATE DATABASE IF NOT EXISTS ambulance_dispatch;
```

### 3. Update the password in `application.properties`
```properties
# File: backend/src/main/resources/application.properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

> **Note:** Tables are auto-created by Hibernate on first run (`spring.jpa.hibernate.ddl-auto=update`). Sample data is seeded automatically by `DataInitializer.java`.

---

## How to Run the Backend

```bash
cd ambulance-dispatch/backend
mvn spring-boot:run
```

- Server starts at: **http://localhost:8080**
- Swagger UI: **http://localhost:8080/swagger-ui/index.html**
- API Docs JSON: **http://localhost:8080/api-docs**

> **Prerequisites:** Java 17, Maven 3.x, MySQL 8 running

---

## How to Run the Frontend

```bash
cd ambulance-dispatch/frontend
npm install
npm run dev
```

- Frontend runs at: **http://localhost:5173**

> **Prerequisites:** Node.js 18+, npm

---

## API Endpoint Summary

### Ambulance APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ambulances` | Get all ambulances |
| GET | `/api/ambulances/{id}` | Get single ambulance |
| POST | `/api/ambulances` | Register new ambulance |
| PUT | `/api/ambulances/{id}` | Update ambulance |
| DELETE | `/api/ambulances/{id}` | Delete ambulance |
| PATCH | `/api/ambulances/{id}/status` | Update status |
| PATCH | `/api/ambulances/{id}/zone` | Update current zone |

### Zone APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/zones` | Get all zones |
| POST | `/api/zones` | Create zone |
| PUT | `/api/zones/{id}` | Update zone |
| DELETE | `/api/zones/{id}` | Delete zone |

### Zone Proximity APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/proximity` | Get all proximity mappings |
| POST | `/api/proximity` | Create mapping |
| PUT | `/api/proximity/{id}` | Update mapping |
| DELETE | `/api/proximity/{id}` | Delete mapping |

### Emergency Call APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emergency-calls` | Get all calls |
| POST | `/api/emergency-calls` | Register new call |
| POST | `/api/emergency-calls/{id}/assign` | **Assign nearest ambulance** |
| POST | `/api/emergency-calls/{id}/start` | Mark IN_PROGRESS |
| POST | `/api/emergency-calls/{id}/complete` | Complete + release ambulance |
| POST | `/api/emergency-calls/{id}/cancel` | Cancel call |

### Analytics APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Dashboard KPI summary |
| GET | `/api/analytics/average-response-time?zone=ZONE-A&startDate=2026-09-01&endDate=2026-09-28` | Zone response analytics |

---

## Nearest Ambulance Algorithm

The core logic lives in `NearestAmbulanceAllocationService.java`:

```
1. Receive emergency call ID
2. Verify call is in PENDING state
3. Get caller's zone
4. Find all ambulances with status = AVAILABLE
5. For each available ambulance:
   → Get its currentZone
   → Lookup ZoneProximity between currentZone and callerZone
   → Score by distance (same zone = 0 km, unmapped = 999 km penalty)
6. Sort candidates by distance, then by estimatedTravelTime
7. Select the closest ambulance
8. Set ambulance.status = BUSY
9. Set call.status = ASSIGNED, record dispatchTime
10. Return full AssignmentResultDto with distance and ETA
```

---

## Sample Dispatch Workflow (Viva Demo)

```
Step 1 → GET /api/ambulances              → View 8 ambulances (6 AVAILABLE, 2 BUSY)
Step 2 → POST /api/emergency-calls        → Create call from ZONE-C
Step 3 → POST /api/emergency-calls/X/assign → System selects nearest AVAILABLE ambulance
Step 4 → Response: "AMB-003 assigned (0 km same zone)" or nearest zone alternative
Step 5 → POST /api/emergency-calls/X/start  → Mark as IN_PROGRESS
Step 6 → POST /api/emergency-calls/X/complete → COMPLETED, responseTimeMinutes calculated
Step 7 → Ambulance returns to AVAILABLE
Step 8 → GET /api/analytics/average-response-time?zone=ZONE-C → See response time recorded
```

---

## Postman Testing Examples

### 1. Create Emergency Call
```json
POST http://localhost:8080/api/emergency-calls
Content-Type: application/json

{
  "callerName": "Ramesh Kumar",
  "callerPhone": "+91 98400 12345",
  "emergencyDescription": "Road accident, person unconscious",
  "callerZoneId": 3
}
```

### 2. Assign Nearest Ambulance
```http
POST http://localhost:8080/api/emergency-calls/1/assign
```

### 3. Try Assigning to Already-Assigned Call (Should Return 409)
```http
POST http://localhost:8080/api/emergency-calls/1/assign
```

### 4. Complete Emergency
```http
POST http://localhost:8080/api/emergency-calls/1/start
POST http://localhost:8080/api/emergency-calls/1/complete
```

### 5. Analytics Query
```http
GET http://localhost:8080/api/analytics/average-response-time?zone=ZONE-A&startDate=2026-09-01&endDate=2026-09-30
```

---

## Business Rules Enforced

| Rule | Behavior |
|------|----------|
| Only AVAILABLE ambulances are dispatched | `InvalidAssignmentException` if BUSY |
| No ambulance in network | `NoAvailableAmbulanceException` returned |
| Duplicate ambulance numbers | `DuplicateResourceException` (409) |
| Delete zone with stationed ambulances | `IllegalStateException` (400) |
| Complete non-in-progress call | `InvalidAssignmentException` (409) |
| Validation failures | `MethodArgumentNotValidException` → 400 with field map |

---

## Screenshots Section

> *(Add screenshots of running application here after launch)*

- [ ] Dashboard – Fleet Overview
- [ ] Emergency Dispatch Queue
- [ ] Nearest Ambulance Assignment Result Modal
- [ ] Zone Proximity Calculator
- [ ] Analytics – Response Time Chart

---

## Sample Credentials / Configuration

| Parameter | Value |
|-----------|-------|
| MySQL Username | `root` |
| MySQL Password | *(your MySQL password)* |
| MySQL Database | `ambulance_dispatch` |
| Backend URL | `http://localhost:8080` |
| Frontend URL | `http://localhost:5173` |
| Swagger UI | `http://localhost:8080/swagger-ui/index.html` |

---

## Project: Assessment Details

- **Assessment:** Project Leap – Java + DBMS Final
- **Stack Requirement:** Spring Boot (Java 17) + MySQL 8 + React
- **Special Feature:** Nearest Zone Proximity Algorithm with predefined distance matrix
