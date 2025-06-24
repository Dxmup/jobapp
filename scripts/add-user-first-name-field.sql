-- Add UserFirstName field to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN user_first_name VARCHAR(100);

-- Create index for faster lookups if needed for personalization queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_first_name ON user_profiles(user_first_name);

-- Update existing records to populate UserFirstName from full_name if available
UPDATE user_profiles 
SET user_first_name = TRIM(SPLIT_PART(full_name, ' ', 1))
WHERE full_name IS NOT NULL AND user_first_name IS NULL;
