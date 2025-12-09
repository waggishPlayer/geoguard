-- Add missing columns to users table for proper auth management
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS slope_id INT REFERENCES slopes(id) ON DELETE SET NULL ON UPDATE CASCADE,
ADD COLUMN IF NOT EXISTS company_id_url TEXT,
ADD COLUMN IF NOT EXISTS govt_id_url TEXT;

-- Create worker_invites table for field worker registration
CREATE TABLE IF NOT EXISTS worker_invites (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    slope_id INT NOT NULL REFERENCES slopes(id) ON DELETE CASCADE,
    invited_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_registered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    registered_at TIMESTAMP
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_worker_invites_phone ON worker_invites(phone);
CREATE INDEX IF NOT EXISTS idx_worker_invites_slope ON worker_invites(slope_id);

-- Create an index for pending users
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);
