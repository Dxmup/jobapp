-- Create a function to execute raw SQL queries
-- This is needed for running migrations
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
-- Note: In production, you might want to restrict this to specific roles
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO authenticated;
