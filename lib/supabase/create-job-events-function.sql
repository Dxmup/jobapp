CREATE OR REPLACE FUNCTION create_job_events_table()
RETURNS void AS $$
BEGIN
  -- Create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS job_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL,
    title TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    event_type TEXT,
    description TEXT
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_table(table_name TEXT, columns TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I (%s)', table_name, columns);
END;
$$ LANGUAGE plpgsql;
