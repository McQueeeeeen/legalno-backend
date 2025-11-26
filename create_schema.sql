-- create_schema.sql
CREATE TABLE clients (
    -- Идентификаторы
    id SERIAL PRIMARY KEY, 
    fio VARCHAR(255) NOT NULL, 
    phone VARCHAR(20),

    -- Данные по документу и срокам
    document_type VARCHAR(10) NOT NULL,
    expiry_date DATE NOT NULL,
    
    -- Финансовые данные
    cost NUMERIC(10, 2), 
    status VARCHAR(50), 
    
    -- Технические поля для нашей логики
    days_required INTEGER NOT NULL,
    payment_awaiting_at TIMESTAMP WITH TIME ZONE
);