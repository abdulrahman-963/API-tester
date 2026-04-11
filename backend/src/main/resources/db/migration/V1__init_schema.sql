-- ============================================================
-- APIMonitor Database Schema — V1 Initial Setup
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    plan            VARCHAR(20)  NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO', 'ENTERPRISE')),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- API Endpoints
CREATE TABLE api_endpoints (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                    VARCHAR(200) NOT NULL,
    url                     VARCHAR(2048) NOT NULL,
    method                  VARCHAR(10)  NOT NULL DEFAULT 'GET' CHECK (method IN ('GET','POST','PUT','DELETE','PATCH','HEAD')),
    check_interval_minutes  INTEGER      NOT NULL DEFAULT 5,
    expected_status         INTEGER      NOT NULL DEFAULT 200,
    timeout_ms              INTEGER      NOT NULL DEFAULT 5000,
    active                  BOOLEAN      NOT NULL DEFAULT TRUE,
    request_body            TEXT,
    request_headers         TEXT,
    last_status             VARCHAR(10)  NOT NULL DEFAULT 'UNKNOWN' CHECK (last_status IN ('UP','DOWN','UNKNOWN')),
    last_checked_at         TIMESTAMPTZ,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_endpoints_user_id   ON api_endpoints (user_id);
CREATE INDEX idx_endpoints_active    ON api_endpoints (active) WHERE active = TRUE;

-- Monitoring Results
CREATE TABLE monitoring_results (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id           UUID         NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
    status                VARCHAR(10)  NOT NULL CHECK (status IN ('UP','DOWN')),
    status_code           INTEGER,
    response_time_ms      BIGINT,
    error_message         TEXT,
    response_body_preview TEXT,
    on_demand             BOOLEAN      NOT NULL DEFAULT FALSE,
    checked_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_monitoring_endpoint_checked ON monitoring_results (endpoint_id, checked_at DESC);
CREATE INDEX idx_monitoring_on_demand        ON monitoring_results (endpoint_id) WHERE on_demand = TRUE;

-- Alert Rules
CREATE TABLE alert_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID        NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
    alert_type  VARCHAR(20) NOT NULL CHECK (alert_type IN ('EMAIL', 'WEBHOOK')),
    destination VARCHAR(500) NOT NULL,
    active      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alert_rules_endpoint ON alert_rules (endpoint_id);

-- Alert History
CREATE TABLE alert_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID        NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
    alert_type  VARCHAR(20) NOT NULL,
    destination VARCHAR(500) NOT NULL,
    sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    message     TEXT,
    success     BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_alert_history_endpoint ON alert_history (endpoint_id, sent_at DESC);
