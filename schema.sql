DROP TABLE IF EXISTS services;
CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  docs_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO services (name, status, docs_url) VALUES ('The API Learning Lab', 'active', '/docs/learning-lab');
INSERT INTO services (name, status, docs_url) VALUES ('Authentication Service', 'active', '/docs/auth-service');
INSERT INTO services (name, status, docs_url) VALUES ('Link Preview Service', 'active', '/docs/link-preview');
INSERT INTO services (name, status, docs_url) VALUES ('ChaosShop API', 'active', '/docs/chaos-shop');
INSERT INTO services (name, status, docs_url) VALUES ('QR Code Generator', 'active', '/docs/qr-code');
INSERT INTO services (name, status, docs_url) VALUES ('IdentityLease API', 'active', '/docs/identity-lease');
INSERT INTO services (name, status, docs_url) VALUES ('YouTube Utility Suite', 'active', '/docs/youtube');

-- ChaosShop Tables
DROP TABLE IF EXISTS shop_products;
CREATE TABLE shop_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL
);

DROP TABLE IF EXISTS shop_carts;
CREATE TABLE shop_carts (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS shop_cart_items;
CREATE TABLE shop_cart_items (
  cart_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  PRIMARY KEY (cart_id, product_id),
  FOREIGN KEY (cart_id) REFERENCES shop_carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES shop_products(id)
);

DROP TABLE IF EXISTS shop_orders;
CREATE TABLE shop_orders (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'failed', 'processing')),
  total REAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS shop_stats;
CREATE TABLE shop_stats (
  key TEXT PRIMARY KEY,
  value INTEGER DEFAULT 0
);

-- Seed Data
INSERT INTO shop_products (id, name, price, stock) VALUES 
('p_101', 'Unstable Table', 49.99, 5),
('p_102', 'Broken Chair', 29.99, 0),
('p_103', 'Glitchy Lamp', 19.99, 100),
('p_104', 'Infinite Loop Rug', 89.99, 2);

-- API Keys Table
DROP TABLE IF EXISTS api_keys;
CREATE TABLE api_keys (
    id TEXT PRIMARY KEY,
    key_hash TEXT NOT NULL,
    prefix TEXT NOT NULL,
    owner TEXT NOT NULL,
    user_id TEXT,  -- Kinde user ID (null for legacy keys)
    permissions TEXT NOT NULL, -- JSON array of scopes
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_api_keys_prefix ON api_keys(prefix);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- Galactic Registry (Learning Lab)
DROP TABLE IF EXISTS galactic_planets;
CREATE TABLE galactic_planets (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    terrain TEXT NOT NULL,
    is_habitable BOOLEAN NOT NULL
);

DROP TABLE IF EXISTS galactic_species;
CREATE TABLE galactic_species (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    classification TEXT NOT NULL,
    average_lifespan INTEGER,
    planet_id INTEGER,
    FOREIGN KEY (planet_id) REFERENCES galactic_planets(id)
);

DROP TABLE IF EXISTS galactic_starships;
CREATE TABLE galactic_starships (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    crew INTEGER NOT NULL,
    top_speed REAL NOT NULL
);

INSERT INTO galactic_planets (id, name, terrain, is_habitable) VALUES
(1, 'Zylos', 'Forest', 1),
(2, 'Kryon', 'Ice', 0),
(3, 'Vulkan', 'Volcanic', 1),
(4, 'Ozean', 'Ocean', 1),
(5, 'Wüste', 'Desert', 0);

INSERT INTO galactic_species (id, name, classification, average_lifespan, planet_id) VALUES
(1, 'Zylians', 'Humanoid', 80, 1),
(2, 'Ice Golems', 'Construct', 1500, 2),
(3, 'Vulkanites', 'Reptilian', 300, 3),
(4, 'Aquarions', 'Amphibian', 60, 4);

INSERT INTO galactic_starships (id, name, class, crew, top_speed) VALUES
(1, 'Star Hopper', 'Scout', 2, 0.9),
(2, 'Galactic Cruiser', 'Capital', 500, 0.4),
(3, 'Void Runner', 'Smuggler', 5, 1.2),
(4, 'Nebula Mining Barge', 'Industrial', 50, 0.1);

-- API Usage Analytics Table
DROP TABLE IF EXISTS api_usage;
CREATE TABLE api_usage (
    id TEXT PRIMARY KEY,
    api_key_id TEXT NOT NULL,
    service TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
);
CREATE INDEX idx_api_usage_key ON api_usage(api_key_id);
CREATE INDEX idx_api_usage_time ON api_usage(created_at);

