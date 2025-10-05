-- Change start_date and end_date columns from date to timestamp with time zone
ALTER TABLE projects 
  ALTER COLUMN start_date TYPE timestamp with time zone USING start_date::timestamp with time zone,
  ALTER COLUMN end_date TYPE timestamp with time zone USING end_date::timestamp with time zone;

-- Update existing records to set end time to end of day
UPDATE projects 
SET end_date = end_date + interval '23 hours 59 minutes 59 seconds'
WHERE end_date::time = '00:00:00';