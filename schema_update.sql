-- Safely add API Usage table
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
