-- Purple Merit Technologies Database Schema

-- Drop tables if they exist
DROP TABLE IF EXISTS simulation_results CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (for authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'manager' CHECK (role IN ('manager', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    current_shift_hours DECIMAL(5,2) DEFAULT 0,
    past_7_day_work_hours DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    route_id VARCHAR(50) NOT NULL UNIQUE,
    distance_km DECIMAL(8,2) NOT NULL,
    traffic_level VARCHAR(20) NOT NULL CHECK (traffic_level IN ('Low', 'Medium', 'High')),
    base_time_minutes INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    value_rs DECIMAL(10,2) NOT NULL,
    assigned_route VARCHAR(50) REFERENCES routes(route_id),
    assigned_driver_id INTEGER REFERENCES drivers(id),
    delivery_timestamp TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'delivered', 'cancelled')),
    late_penalty DECIMAL(10,2) DEFAULT 0,
    high_value_bonus DECIMAL(10,2) DEFAULT 0,
    fuel_cost DECIMAL(10,2) DEFAULT 0,
    profit DECIMAL(10,2) DEFAULT 0,
    is_on_time BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simulation results table
CREATE TABLE simulation_results (
    id SERIAL PRIMARY KEY,
    available_drivers INTEGER NOT NULL,
    route_start_time TIME NOT NULL,
    max_hours_per_driver DECIMAL(5,2) NOT NULL,
    total_orders INTEGER DEFAULT 0,
    on_time_deliveries INTEGER DEFAULT 0,
    total_penalties DECIMAL(12,2) DEFAULT 0,
    total_bonuses DECIMAL(12,2) DEFAULT 0,
    total_fuel_cost DECIMAL(12,2) DEFAULT 0,
    overall_profit DECIMAL(12,2) DEFAULT 0,
    efficiency_score DECIMAL(5,2) DEFAULT 0,
    simulation_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_routes_route_id ON routes(route_id);
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_assigned_driver ON orders(assigned_driver_id);
CREATE INDEX idx_orders_assigned_route ON orders(assigned_route);
CREATE INDEX idx_simulation_results_created_at ON simulation_results(created_at);