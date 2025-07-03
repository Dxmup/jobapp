-- Add deletion tracking fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS marked_for_deletion BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deletion_date TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying of accounts marked for deletion
CREATE INDEX IF NOT EXISTS idx_users_marked_for_deletion 
ON users (marked_for_deletion, deletion_date) 
WHERE marked_for_deletion = TRUE;

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action 
ON audit_logs (user_id, action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
ON audit_logs (created_at DESC);
