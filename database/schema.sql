-- SpeedClub MVP - Schema DDL (SQLite)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    racing_credits INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles_catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    rarity_tier VARCHAR(10) NOT NULL,
    image_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_inventory (
    user_id VARCHAR(36) NOT NULL,
    vehicle_id INT NOT NULL,
    is_pasted BOOLEAN NOT NULL DEFAULT 0,
    unpasted_count INT NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, vehicle_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles_catalog(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS packs_inventory (
    user_id VARCHAR(36) NOT NULL,
    pack_type VARCHAR(50) NOT NULL DEFAULT 'Standard Crate',
    quantity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, pack_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trailer_sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    trailer_id VARCHAR(50) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trades (
    trade_id VARCHAR(36) PRIMARY KEY,
    offer_user_id VARCHAR(36) NOT NULL,
    offer_vehicle_id INT NOT NULL,
    request_vehicle_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_vehicle_id) REFERENCES vehicles_catalog(id) ON DELETE RESTRICT,
    FOREIGN KEY (request_vehicle_id) REFERENCES vehicles_catalog(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_vehicles_tier ON vehicles_catalog(rarity_tier);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trailer_sessions_user ON trailer_sessions(user_id);
