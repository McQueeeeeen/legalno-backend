// index.js (НОВЫЙ API-СЕРВЕР)

import express from 'express';
import bodyParser from 'body-parser';
import { calculateDeadline, isWorkingDay } from './deadlineUtils.js';
import { isPaymentOverdue, getExpiryStatus } from './riskUtils.js';
import { addClient, getClients } from './db.js'; // Используем функции из db.js

const app = express();
const PORT = 3000; // Порт для нашего API-сервера

// Используем body-parser для разбора JSON-запросов от GAS
app.use(bodyParser.json());

// ----------------------------------------------------------------------
// МАРШРУТ 1: ПОЛУЧЕНИЕ ДАННЫХ ИЗ GOOGLE SHEETS И ЗАПИСЬ В БД
// ----------------------------------------------------------------------
app.post('/api/clients/add', async (req, res) => {
    try {
        // req.body будет содержать данные, отправленные из Google Apps Script
        const data = req.body;
        
        // Преобразуем строковые даты в объекты Date
        const expiryDate = new Date(data.expiry_date);
        const paymentDate = new Date(data.payment_awaiting_at);

        // Формируем объект для вставки в БД
        const clientData = {
            fio: data.fio,
            phone: data.phone,
            document_type: data.document_type,
            expiry_date: expiryDate,
            cost: data.cost,
            status: data.status,
            days_required: data.days_required,
            payment_awaiting_at: paymentDate 
        };

        const newId = await addClient(clientData); // Вставка в PostgreSQL

        console.log(`[API] Клиент ${data.fio} успешно добавлен в БД с ID: ${newId}`);

        // Отправляем ответ GAS
        res.status(200).json({ 
            success: true, 
            message: 'Client added to DB', 
            id: newId 
        });

    } catch (error) {
        console.error('[API] Ошибка при добавлении клиента:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});

// ----------------------------------------------------------------------
// МАРШРУТ 2: ЗАПРОС РИСКОВ И ДЕДЛАЙНОВ ДЛЯ ВСЕХ КЛИЕНТОВ
// ----------------------------------------------------------------------
app.get('/api/risks/all', async (req, res) => {
    try {
        const clients = await getClients(); // Получаем все записи из БД
        const TODAY = new Date();
        
        const risks = clients.map(client => {
            const expiryRisk = getExpiryStatus(client.expiry_date);
            const paymentRisk = isPaymentOverdue(client.payment_awaiting_at, client.status, TODAY);
            const deadline = calculateDeadline(client.expiry_date, client.days_required);

            // Определение ОБЩЕГО РИСКА
            let totalRisk = 'LOW';
            if (expiryRisk.level !== 'SAFE' || paymentRisk.overdue) {
                totalRisk = 'HIGH';
            }

            return {
                id: client.id,
                fio: client.fio,
                deadline: deadline.toLocaleDateString('ru-RU'), // Формат DD.MM.YYYY
                total_risk: totalRisk
            };
        });

        // Отправляем массив объектов с рисками обратно в GAS
        res.status(200).json({ success: true, data: risks });

    } catch (error) {
        console.error('[API] Ошибка при расчете рисков:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});


// Запуск сервера
app.listen(PORT, () => {
    console.log(`\n🎉 Node.js API-сервер запущен на http://localhost:${PORT}`);
    console.log(`Готов принимать запросы от Google Apps Script...`);
});