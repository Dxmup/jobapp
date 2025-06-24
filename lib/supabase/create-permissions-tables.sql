-- Create permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resource, action)
);

-- Create role_permissions junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Create permission_groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS permission_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_permissions junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS group_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES permission_groups(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, permission_id)
);

-- Create user_permission_groups junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_permission_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES permission_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action)
VALUES
  ('user:read', 'Can view user information', 'user', 'read'),
  ('user:create', 'Can create new users', 'user', 'create'),
  ('user:update', 'Can update user information', 'user', 'update'),
  ('user:delete', 'Can delete users', 'user', 'delete'),
  ('content:read', 'Can view content', 'content', 'read'),
  ('content:create', 'Can create new content', 'content', 'create'),
  ('content:update', 'Can update content', 'content', 'update'),
  ('content:delete', 'Can delete content', 'content', 'delete'),
  ('billing:read', 'Can view billing information', 'billing', 'read'),
  ('billing:manage', 'Can manage billing', 'billing', 'manage'),
  ('system:read', 'Can view system information', 'system', 'read'),
  ('system:manage', 'Can manage system settings', 'system', 'manage'),
  ('role:read', 'Can view roles', 'role', 'read'),
  ('role:create', 'Can create roles', 'role', 'create'),
  ('role:update', 'Can update roles', 'role', 'update'),
  ('role:delete', 'Can delete roles', 'role', 'delete'),
  ('permission:read', 'Can view permissions', 'permission', 'read'),
  ('permission:assign', 'Can assign permissions', 'permission', 'assign')
ON CONFLICT (resource, action) DO NOTHING;

-- Create default permission groups
INSERT INTO permission_groups (name, description)
VALUES
  ('User Management', 'Permissions related to user management'),
  ('Content Management', 'Permissions related to content management'),
  ('System Administration', 'Permissions related to system administration'),
  ('Billing Management', 'Permissions related to billing')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to groups
WITH 
  user_group AS (SELECT id FROM permission_groups WHERE name = 'User Management'),
  content_group AS (SELECT id FROM permission_groups WHERE name = 'Content Management'),
  system_group AS (SELECT id FROM permission_groups WHERE name = 'System Administration'),
  billing_group AS (SELECT id FROM permission_groups WHERE name = 'Billing Management'),
  user_read AS (SELECT id FROM permissions WHERE name = 'user:read'),
  user_create AS (SELECT id FROM permissions WHERE name = 'user:create'),
  user_update AS (SELECT id FROM permissions WHERE name = 'user:update'),
  user_delete AS (SELECT id FROM permissions WHERE name = 'user:delete'),
  content_read AS (SELECT id FROM permissions WHERE name = 'content:read'),
  content_create AS (SELECT id FROM permissions WHERE name = 'content:create'),
  content_update AS (SELECT id FROM permissions WHERE name = 'content:update'),
  content_delete AS (SELECT id FROM permissions WHERE name = 'content:delete'),
  billing_read AS (SELECT id FROM permissions WHERE name = 'billing:read'),
  billing_manage AS (SELECT id FROM permissions WHERE name = 'billing:manage'),
  system_read AS (SELECT id FROM permissions WHERE name = 'system:read'),
  system_manage AS (SELECT id FROM permissions WHERE name = 'system:manage'),
  role_read AS (SELECT id FROM permissions WHERE name = 'role:read'),
  role_create AS (SELECT id FROM permissions WHERE name = 'role:create'),
  role_update AS (SELECT id FROM permissions WHERE name = 'role:update'),
  role_delete AS (SELECT id FROM permissions WHERE name = 'role:delete'),
  permission_read AS (SELECT id FROM permissions WHERE name = 'permission:read'),
  permission_assign AS (SELECT id FROM permissions WHERE name = 'permission:assign')
INSERT INTO group_permissions (group_id, permission_id)
VALUES
  ((SELECT id FROM user_group), (SELECT id FROM user_read)),
  ((SELECT id FROM user_group), (SELECT id FROM user_create)),
  ((SELECT id FROM user_group), (SELECT id FROM user_update)),
  ((SELECT id FROM user_group), (SELECT id FROM user_delete)),
  ((SELECT id FROM content_group), (SELECT id FROM content_read)),
  ((SELECT id FROM content_group), (SELECT id FROM content_create)),
  ((SELECT id FROM content_group), (SELECT id FROM content_update)),
  ((SELECT id FROM content_group), (SELECT id FROM content_delete)),
  ((SELECT id FROM billing_group), (SELECT id FROM billing_read)),
  ((SELECT id FROM billing_group), (SELECT id FROM billing_manage)),
  ((SELECT id FROM system_group), (SELECT id FROM system_read)),
  ((SELECT id FROM system_group), (SELECT id FROM system_manage)),
  ((SELECT id FROM system_group), (SELECT id FROM role_read)),
  ((SELECT id FROM system_group), (SELECT id FROM role_create)),
  ((SELECT id FROM system_group), (SELECT id FROM role_update)),
  ((SELECT id FROM system_group), (SELECT id FROM role_delete)),
  ((SELECT id FROM system_group), (SELECT id FROM permission_read)),
  ((SELECT id FROM system_group), (SELECT id FROM permission_assign))
ON CONFLICT (group_id, permission_id) DO NOTHING;

-- Assign default permissions to roles
WITH 
  user_role AS (SELECT id FROM roles WHERE name = 'user'),
  support_role AS (SELECT id FROM roles WHERE name = 'support'),
  editor_role AS (SELECT id FROM roles WHERE name = 'editor'),
  admin_role AS (SELECT id FROM roles WHERE name = 'admin'),
  super_admin_role AS (SELECT id FROM roles WHERE name = 'super_admin'),
  user_read AS (SELECT id FROM permissions WHERE name = 'user:read'),
  user_create AS (SELECT id FROM permissions WHERE name = 'user:create'),
  user_update AS (SELECT id FROM permissions WHERE name = 'user:update'),
  user_delete AS (SELECT id FROM permissions WHERE name = 'user:delete'),
  content_read AS (SELECT id FROM permissions WHERE name = 'content:read'),
  content_create AS (SELECT id FROM permissions WHERE name = 'content:create'),
  content_update AS (SELECT id FROM permissions WHERE name = 'content:update'),
  content_delete AS (SELECT id FROM permissions WHERE name = 'content:delete'),
  billing_read AS (SELECT id FROM permissions WHERE name = 'billing:read'),
  billing_manage AS (SELECT id FROM permissions WHERE name = 'billing:manage'),
  system_read AS (SELECT id FROM permissions WHERE name = 'system:read'),
  system_manage AS (SELECT id FROM permissions WHERE name = 'system:manage'),
  role_read AS (SELECT id FROM permissions WHERE name = 'role:read'),
  role_create AS (SELECT id FROM permissions WHERE name = 'role:create'),
  role_update AS (SELECT id FROM permissions WHERE name = 'role:update'),
  role_delete AS (SELECT id FROM permissions WHERE name = 'role:delete'),
  permission_read AS (SELECT id FROM permissions WHERE name = 'permission:read'),
  permission_assign AS (SELECT id FROM permissions WHERE name = 'permission:assign')
INSERT INTO role_permissions (role_id, permission_id)
VALUES
  -- Support role permissions
  ((SELECT id FROM support_role), (SELECT id FROM user_read)),
  ((SELECT id FROM support_role), (SELECT id FROM content_read)),
  
  -- Editor role permissions
  ((SELECT id FROM editor_role), (SELECT id FROM content_read)),
  ((SELECT id FROM editor_role), (SELECT id FROM content_create)),
  ((SELECT id FROM editor_role), (SELECT id FROM content_update)),
  
  -- Admin role permissions
  ((SELECT id FROM admin_role), (SELECT id FROM user_read)),
  ((SELECT id FROM admin_role), (SELECT id FROM user_create)),
  ((SELECT id FROM admin_role), (SELECT id FROM user_update)),
  ((SELECT id FROM admin_role), (SELECT id FROM content_read)),
  ((SELECT id FROM admin_role), (SELECT id FROM content_create)),
  ((SELECT id FROM admin_role), (SELECT id FROM content_update)),
  ((SELECT id FROM admin_role), (SELECT id FROM content_delete)),
  ((SELECT id FROM admin_role), (SELECT id FROM billing_read)),
  ((SELECT id FROM admin_role), (SELECT id FROM system_read)),
  ((SELECT id FROM admin_role), (SELECT id FROM role_read)),
  ((SELECT id FROM admin_role), (SELECT id FROM permission_read)),
  
  -- Super admin role permissions (all permissions)
  ((SELECT id FROM super_admin_role), (SELECT id FROM user_read)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM user_create)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM user_update)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM user_delete)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM content_read)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM content_create)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM content_update)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM content_delete)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM billing_read)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM billing_manage)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM system_read)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM system_manage)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM role_read)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM role_create)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM role_update)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM role_delete)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM permission_read)),
  ((SELECT id FROM super_admin_role), (SELECT id FROM permission_assign))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create admin_sessions table for session management
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index on admin_sessions for faster lookups
CREATE INDEX IF NOT EXISTS admin_sessions_user_id_idx ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS admin_sessions_token_idx ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS admin_sessions_is_active_idx ON admin_sessions(is_active);

-- Create two_factor_auth table for 2FA
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  backup_codes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
