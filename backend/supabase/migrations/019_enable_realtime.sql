-- Enable Realtime for all project collaboration tables

-- Ensure supabase_realtime publication exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add project collaboration tables to the publication
-- We check for table existence first to prevent relation "does not exist" errors
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'project_channels',
    'project_channel_members',
    'project_messages',
    'project_message_reactions',
    'project_message_attachments',
    'project_typing_indicators',
    'project_read_receipts',
    'project_files',
    'project_meetings'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 
      FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE n.nspname = 'public' AND c.relname = t
    ) THEN
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      EXCEPTION 
        WHEN duplicate_object THEN
          NULL;
        WHEN others THEN
          RAISE NOTICE 'Failed to add table % to publication: %', t, SQLERRM;
      END;
    ELSE
      RAISE NOTICE 'Table public.% does not exist yet. Skipping realtime publication enablement.', t;
    END IF;
  END LOOP;
END $$;
