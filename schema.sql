CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS role (
    roleId NUMERIC(2) NOT NULL PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE,
    is_servicer BOOLEAN NOT NULL DEFAULT FALSE,
    is_customer BOOLEAN NOT NULL DEFAULT FALSE,
    is_business BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_data (
    userId UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    userName TEXT NOT NULL UNIQUE,
    roleId NUMERIC(2) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    address TEXT,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_user_data_roleId
        FOREIGN KEY (roleId)
        REFERENCES role(roleId)
        ON DELETE RESTRICT
);

CREATE INDEX idx_user_data_email ON user_data(email);
CREATE INDEX idx_user_data_roleId ON user_data(roleId);

CREATE TABLE IF NOT EXISTS contact (
    contactId UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    contactNumber TEXT NOT NULL,
    userId UUID NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_contact_userId
        FOREIGN KEY (userId)
        REFERENCES user_data(userId)
        ON DELETE CASCADE
);

CREATE INDEX idx_contact_userId ON contact(userId);
CREATE INDEX idx_contact_contactNumber ON contact(contactNumber);

CREATE TABLE IF NOT EXISTS brand (
    brandId UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    brandName TEXT NOT NULL UNIQUE,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_type (
    product_type_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_type_name TEXT NOT NULL UNIQUE,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product (
    product_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name TEXT NOT NULL,
    description TEXT,
    brandId UUID NOT NULL,
    product_type_id UUID NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_product_brandId
        FOREIGN KEY (brandId)
        REFERENCES brand(brandId),
    CONSTRAINT fk_product_product_type_id
        FOREIGN KEY (product_type_id)
        REFERENCES product_type(product_type_id)
);

CREATE INDEX idx_product_product_name ON product(product_name);
CREATE INDEX idx_product_brandId ON product(brandId);
CREATE INDEX idx_product_product_type_id ON product(product_type_id);

CREATE TABLE IF NOT EXISTS user_product (
    user_product_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL,
    product_id UUID NOT NULL,
    serial_number TEXT NOT NULL UNIQUE,
    login_password TEXT,
    additional_info TEXT,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_user_product_userId
        FOREIGN KEY (userId)
        REFERENCES user_data(userId)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_product_product_id
        FOREIGN KEY (product_id)
        REFERENCES product(product_id),
    CONSTRAINT unique_user_product UNIQUE(userId, product_id, serial_number)
);

CREATE INDEX idx_user_product_userId ON user_product(userId);
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
CREATE SEQUENCE service_order_seq START 1;

CREATE OR REPLACE FUNCTION generate_service_order_number()
RETURNS TRIGGER AS $$
DECLARE
    current_year INT;
    day_of_year INT;
    seq_val INT;
BEGIN
    current_year := TO_CHAR(CURRENT_DATE, 'YY')::INT;
    seq_val := NEXTVAL('service_order_seq');
    
    -- Reset sequence if year changed
    IF (SELECT EXTRACT(YEAR FROM (SELECT NOW())))::INT > 
       (SELECT EXTRACT(YEAR FROM (SELECT MAX(createdAt) FROM service_order)))::INT THEN
        PERFORM SETVAL('service_order_seq', 1);
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
    priority_level INT NOT NULL DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
    estimated_completion_date TIMESTAMP WITH TIME ZONE,
    actual_completion_date TIMESTAMP WITH TIME ZONE,
    issue_description issue_type NOT NULL,
    issue_notes TEXT,
    entry_by UUID NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_service_order_user_product_id
        FOREIGN KEY (user_product_id)
        REFERENCES user_product(user_product_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_service_order_entry_by
        FOREIGN KEY (entry_by)
        REFERENCES user_data(userId)
);

CREATE INDEX idx_service_order_tag_no ON service_order(tag_no);
CREATE INDEX idx_service_order_user_product_id ON service_order(user_product_id);
CREATE INDEX idx_service_order_entry_by ON service_order(entry_by);
CREATE INDEX idx_service_order_createdAt ON service_order(createdAt DESC);

CREATE TRIGGER trigger_service_order_number
BEFORE INSERT ON service_order
FOR EACH ROW
EXECUTE FUNCTION generate_service_order_number();



CREATE TABLE IF NOT EXISTS status (
    status_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    status_name TEXT NOT NULL UNIQUE,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_status (
    service_status_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_order_id UUID NOT NULL,
    status_id UUID NOT NULL,
    assigned_to UUID NOT NULL,
    comment TEXT,
    notify_customer BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_service_status_service_order_id
        FOREIGN KEY (service_order_id)
        REFERENCES service_order(service_order_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_service_status_status_id
        FOREIGN KEY (status_id)
        REFERENCES status(status_id),
    CONSTRAINT fk_service_status_assigned_to
        FOREIGN KEY (assigned_to)
        REFERENCES user_data(userId)
);

CREATE INDEX idx_service_status_service_order_id ON service_status(service_order_id);
CREATE INDEX idx_service_status_status_id ON service_status(status_id);
CREATE INDEX idx_service_status_createdAt ON service_status(createdAt DESC);
CREATE INDEX idx_service_status_assigned_to ON service_status(assigned_to);