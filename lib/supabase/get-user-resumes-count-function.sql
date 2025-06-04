-- Function to get resume count for a user
CREATE OR REPLACE FUNCTION get_user_resumes_count(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  resume_count INTEGER;
  sample_resumes JSON;
BEGIN
  -- Count resumes
  SELECT COUNT(*) INTO resume_count
  FROM resumes
  WHERE user_id = user_id_param;
  
  -- Get sample resumes
  SELECT json_agg(r)
  INTO sample_resumes
  FROM (
    SELECT id, name, user_id, created_at
    FROM resumes
    WHERE user_id = user_id_param
    ORDER BY created_at DESC
    LIMIT 3
  ) r;
  
  -- Return results
  RETURN json_build_object(
    'count', resume_count,
    'sample', sample_resumes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
