-- Initialize helper functions used by other migrations

-- Update timestamp helper: sets updated_at to now() on any change
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
