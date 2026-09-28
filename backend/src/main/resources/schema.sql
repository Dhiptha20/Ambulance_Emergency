-- ============================================================
-- AmbulanceDispatch – Database Schema
-- Database: ambulance_dispatch (MySQL 8)
-- ============================================================

CREATE DATABASE IF NOT EXISTS ambulance_dispatch;
USE ambulance_dispatch;

-- 1. Zones Table
CREATE TABLE IF NOT EXISTS zones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    zone_code VARCHAR(50) NOT NULL UNIQUE,
    zone_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Zone Proximities Table
CREATE TABLE IF NOT EXISTS zone_proximities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_zone_id BIGINT NOT NULL,
    to_zone_id BIGINT NOT NULL,
    distance DOUBLE NOT NULL,
    estimated_travel_time INT NOT NULL,
    CONSTRAINT fk_prox_from_zone FOREIGN KEY (from_zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    CONSTRAINT fk_prox_to_zone FOREIGN KEY (to_zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    CONSTRAINT uq_zone_pair UNIQUE (from_zone_id, to_zone_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Ambulances Table
CREATE TABLE IF NOT EXISTS ambulances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ambulance_number VARCHAR(50) NOT NULL UNIQUE,
    driver_name VARCHAR(100) NOT NULL,
    home_zone_id BIGINT NOT NULL,
    current_zone_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL, -- AVAILABLE, BUSY
    registration_date DATE NOT NULL,
    CONSTRAINT fk_amb_home_zone FOREIGN KEY (home_zone_id) REFERENCES zones(id),
    CONSTRAINT fk_amb_curr_zone FOREIGN KEY (current_zone_id) REFERENCES zones(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Emergency Calls Table
CREATE TABLE IF NOT EXISTS emergency_calls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    caller_name VARCHAR(100) NOT NULL,
    caller_phone VARCHAR(20) NOT NULL,
    emergency_description VARCHAR(500) NOT NULL,
    caller_zone_id BIGINT NOT NULL,
    assigned_ambulance_id BIGINT NULL,
    call_time DATETIME NOT NULL,
    dispatch_time DATETIME NULL,
    arrival_time DATETIME NULL,
    completion_time DATETIME NULL,
    response_time_minutes BIGINT NULL,
    status VARCHAR(20) NOT NULL, -- PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
    CONSTRAINT fk_call_caller_zone FOREIGN KEY (caller_zone_id) REFERENCES zones(id),
    CONSTRAINT fk_call_assigned_amb FOREIGN KEY (assigned_ambulance_id) REFERENCES ambulances(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
