-- Adds staff login credentials to a database created before authentication.
-- schema.sql already contains this for fresh databases; this file is only for
-- existing ones. Idempotent — safe to run more than once:
--   docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < migrations/0001_staff_account.sql

CREATE TABLE IF NOT EXISTS staff_account (
    user_id UUID NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_staff_account_user_id
        FOREIGN KEY (user_id)
        REFERENCES user_data(user_id)
        ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS trg_staff_account_updated_at ON staff_account;
CREATE TRIGGER trg_staff_account_updated_at
BEFORE UPDATE ON staff_account
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
