-- Function to populate user_first_name from existing data
-- This will extract the first name from full_name or name fields

UPDATE user_profiles 
SET user_first_name = CASE
  -- If full_name exists, extract first word
  WHEN full_name IS NOT NULL AND trim(full_name) != '' THEN
    trim(split_part(full_name, ' ', 1))
  -- If full_name is empty but we have a user record with name, use that
  WHEN (full_name IS NULL OR trim(full_name) = '') THEN
    (SELECT trim(split_part(u.name, ' ', 1)) 
     FROM users u 
     WHERE u.id = user_profiles.user_id 
     AND u.name IS NOT NULL 
     AND trim(u.name) != '')
  ELSE NULL
END
WHERE user_first_name IS NULL;

-- Also populate for users who have profiles but no full_name set
-- This handles cases where user_profiles exists but full_name is empty
INSERT INTO user_profiles (user_id, user_first_name, created_at, updated_at)
SELECT 
  u.id,
  trim(split_part(u.name, ' ', 1)) as user_first_name,
  NOW(),
  NOW()
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE up.user_id IS NULL 
  AND u.name IS NOT NULL 
  AND trim(u.name) != ''
ON CONFLICT (user_id) DO UPDATE SET
  user_first_name = EXCLUDED.user_first_name,
  updated_at = NOW()
WHERE user_profiles.user_first_name IS NULL;
