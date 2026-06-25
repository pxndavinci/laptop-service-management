CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS role (
    role_id SMALLINT NOT NULL PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE,
    is_servicer BOOLEAN NOT NULL DEFAULT FALSE,
    is_customer BOOLEAN NOT NULL DEFAULT FALSE,
    is_business BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_data (
    user_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    role_id NUMERIC(2) NOT NULL,
    email TEXT UNIQUE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_user_data_role_id
        FOREIGN KEY (role_id)
        REFERENCES role(role_id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_user_data_email ON user_data(email);
CREATE INDEX idx_user_data_role_id ON user_data(role_id);

CREATE TABLE IF NOT EXISTS contact (
    contact_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_number TEXT NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_contact_user_id
        FOREIGN KEY (user_id)
        REFERENCES user_data(user_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_contact_user_id ON contact(user_id);
CREATE INDEX idx_contact_contact_number ON contact(contact_number);

CREATE TABLE IF NOT EXISTS brand (
    brand_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_brand_brand_name ON brand(brand_name);

CREATE TABLE IF NOT EXISTS product_type (
    product_type_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_type_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_type_product_type_name
ON product_type(product_type_name);

CREATE TABLE IF NOT EXISTS product (
    product_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name TEXT NOT NULL,
    description TEXT,
    brand_id UUID NOT NULL,
    product_type_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_name, brand_id, product_type_id),
    CONSTRAINT fk_product_brand_id
        FOREIGN KEY (brand_id)
        REFERENCES brand(brand_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_product_product_type_id
        FOREIGN KEY (product_type_id)
        REFERENCES product_type(product_type_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_product_product_name ON product(product_name);
CREATE INDEX idx_product_brand_id ON product(brand_id);
CREATE INDEX idx_product_product_type_id ON product(product_type_id);

CREATE TABLE IF NOT EXISTS user_product (
    user_product_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    serial_number TEXT NOT NULL UNIQUE,
    login_password TEXT,
    additional_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_user_product_user_id
        FOREIGN KEY (user_id)
        REFERENCES user_data(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_product_product_id
        FOREIGN KEY (product_id)
        REFERENCES product(product_id),
    CONSTRAINT unique_user_product UNIQUE(user_id, product_id, serial_number)
);

CREATE INDEX idx_user_product_user_id ON user_product(user_id);
CREATE INDEX idx_user_product_product_id ON user_product(product_id);
CREATE INDEX idx_user_product_serial ON user_product(serial_number);

CREATE TYPE issue_type AS ENUM (
    'HARDWARE',
    'SOFTWARE',
    'NETWORK',
    'OTHER'
);

CREATE TYPE payment_method_type AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'ONLINE_PAYMENT',
    'OTHER'
);

CREATE TYPE payment_status_type AS ENUM (
    'PENDING',
    'COMPLETED',
    'PARTIAL',
    'REFUNDED'
);

-- Sequence for auto-generating service order numbers (YYDDDDD format)
CREATE SEQUENCE IF NOT EXISTS service_order_seq START 1;

CREATE OR REPLACE FUNCTION generate_service_order_number()
RETURNS TRIGGER AS $$
DECLARE
    current_year INT;
    seq_val INT;
BEGIN
    current_year := TO_CHAR(CURRENT_DATE, 'YY')::INT;
    seq_val := NEXTVAL('service_order_seq');
    
    -- Lock service_order to prevent concurrent sequence reset
    LOCK TABLE service_order IN ACCESS EXCLUSIVE MODE;

    IF NOT EXISTS (SELECT 1 FROM service_order) THEN
        PERFORM SETVAL('service_order_seq', 1, false);
        seq_val := 1;

    ELSIF EXTRACT(YEAR FROM NOW())::INT >
        COALESCE(
            (SELECT EXTRACT(YEAR FROM MAX(created_at))::INT
            FROM service_order),
            0
        ) THEN

        PERFORM SETVAL('service_order_seq', 1, false);
        seq_val := 1;
    END IF;
    
    NEW.tag_no := current_year*10000 + seq_val;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS service_order (
    service_order_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_no NUMERIC(6) NOT NULL UNIQUE,
    user_product_id UUID NOT NULL,
    estimated_price NUMERIC(10, 2) CHECK (estimated_price >= 0),
    final_price NUMERIC(10, 2) CHECK (final_price >= 0),
    payment_method payment_method_type,
    payment_status payment_status_type NOT NULL DEFAULT 'PENDING',
    priority_level SMALLINT NOT NULL DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
    estimated_completion_date TIMESTAMP WITH TIME ZONE,
    actual_completion_date TIMESTAMP WITH TIME ZONE,
    issue_description issue_type NOT NULL,
    issue_notes TEXT,
    entry_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_service_order_user_product_id
        FOREIGN KEY (user_product_id)
        REFERENCES user_product(user_product_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_service_order_entry_by
        FOREIGN KEY (entry_by)
        REFERENCES user_data(user_id)
);

CREATE INDEX idx_service_order_tag_no ON service_order(tag_no);
CREATE INDEX idx_service_order_user_product_id ON service_order(user_product_id);
CREATE INDEX idx_service_order_entry_by ON service_order(entry_by);
CREATE INDEX idx_service_order_created_at ON service_order(created_at DESC);

CREATE TRIGGER trigger_service_order_number
BEFORE INSERT ON service_order
FOR EACH ROW
EXECUTE FUNCTION generate_service_order_number();



CREATE TABLE IF NOT EXISTS status (
    status_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    status_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_status (
    service_status_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_order_id UUID NOT NULL,
    status_id UUID NOT NULL,
    assigned_to UUID NOT NULL,
    comment TEXT,
    notify_customer BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_service_status_service_order_id
        FOREIGN KEY (service_order_id)
        REFERENCES service_order(service_order_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_service_status_status_id
        FOREIGN KEY (status_id)
        REFERENCES status(status_id),
    CONSTRAINT fk_service_status_assigned_to
        FOREIGN KEY (assigned_to)
        REFERENCES user_data(user_id)
);

CREATE INDEX idx_service_status_service_order_id ON service_status(service_order_id);
CREATE INDEX idx_service_status_status_id ON service_status(status_id);
CREATE INDEX idx_service_status_created_at ON service_status(created_at DESC);
CREATE INDEX idx_service_status_assigned_to ON service_status(assigned_to);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_role_updated_at
BEFORE UPDATE ON role
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_user_data_updated_at
BEFORE UPDATE ON user_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_contact_updated_at
BEFORE UPDATE ON contact
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_brand_updated_at
BEFORE UPDATE ON brand
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_product_type_updated_at
BEFORE UPDATE ON product_type
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_product_updated_at
BEFORE UPDATE ON product
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_user_product_updated_at
BEFORE UPDATE ON user_product
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_service_order_updated_at
BEFORE UPDATE ON service_order
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_status_updated_at
BEFORE UPDATE ON status
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_service_status_updated_at
BEFORE UPDATE ON service_status
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();