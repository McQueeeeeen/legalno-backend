// db.js
import pg from 'pg';

// Настройки подключения к вашей локальной базе данных
const pool = new pg.Pool({
  user: 'postgres', // Имя пользователя по умолчанию
  host: 'localhost', 
  database: 'legalno', // Имя базы данных, которую мы создали
  password: 'Eminem12131415161718191011', // Ваш пароль
  port: 5432, // Порт по умолчанию
});

// Пример тестовой функции: Вставка данных в таблицу clients
export const addClient = async (clientData) => {
    const { 
        fio, phone, document_type, expiry_date, cost, status, days_required, payment_awaiting_at
    } = clientData;

    const query = `
        INSERT INTO clients (
            fio, phone, document_type, expiry_date, cost, status, days_required, payment_awaiting_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id;
    `;

    const values = [
        fio, phone, document_type, expiry_date, cost, status, days_required, payment_awaiting_at
    ];

    try {
        const res = await pool.query(query, values);
        console.log(`Клиент ${fio} успешно добавлен с ID: ${res.rows[0].id}`);
        return res.rows[0].id;
    } catch (err) {
        console.error('Ошибка добавления клиента:', err.stack);
        throw err;
    }
};

// Функция для получения всех клиентов (понадобится для применения Риск-Матрицы)
export const getClients = async () => {
    const query = 'SELECT * FROM clients;';
    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error('Ошибка получения клиентов:', err.stack);
        throw err;
    }
};

// Функция для закрытия пула соединений (важно в конце работы)
export const closePool = async () => {
    await pool.end();
    console.log('Соединение с БД закрыто.');
};