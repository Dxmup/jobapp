-- Check if the job_events table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'job_events') THEN
        -- Create the job_events table
        CREATE TABLE public.job_events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
            event_type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            date TIMESTAMP WITH TIME ZONE NOT NULL,
            contact_name VARCHAR(255),
            contact_email VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL
        );

        -- Add RLS policies
        ALTER TABLE public.job_events ENABLE ROW LEVEL SECURITY;

        -- Policy for selecting job events (users can only see their own job events)
        CREATE POLICY "Users can view their own job events" ON public.job_events
            FOR SELECT
            USING (
                job_id IN (
                    SELECT id FROM public.jobs WHERE user_id = auth.uid()
                )
            );

        -- Policy for inserting job events (users can only insert events for their own jobs)
        CREATE POLICY "Users can insert events for their own jobs" ON public.job_events
            FOR INSERT
            WITH CHECK (
                job_id IN (
                    SELECT id FROM public.jobs WHERE user_id = auth.uid()
                )
            );

        -- Policy for updating job events (users can only update their own job events)
        CREATE POLICY "Users can update their own job events" ON public.job_events
            FOR UPDATE
            USING (
                job_id IN (
                    SELECT id FROM public.jobs WHERE user_id = auth.uid()
                )
            );

        -- Policy for deleting job events (users can only delete their own job events)
        CREATE POLICY "Users can delete their own job events" ON public.job_events
            FOR DELETE
            USING (
                job_id IN (
                    SELECT id FROM public.jobs WHERE user_id = auth.uid()
                )
            );

        -- Create index for faster queries
        CREATE INDEX job_events_job_id_idx ON public.job_events(job_id);
        CREATE INDEX job_events_date_idx ON public.job_events(date);
    END IF;
END
$$;
