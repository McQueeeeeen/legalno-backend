// riskUtils.js
import { differenceInHours, differenceInDays, isBefore } from 'date-fns'; 

// --- Правило 1: Контроль Просрочки Оплаты (72 часа) ---
const OVERDUE_THRESHOLD_HOURS = 72;

/**
 * Проверяет, прошло ли 72 часа с момента начала отсчета оплаты.
 * @param {Date} paymentAwaitingAt - Точное время начала отсчета.
 * @returns {boolean} - true, если оплата просрочена (прошло >= 72 часа).
 */
export const isPaymentOverdue = (paymentAwaitingAt) => {
    const now = new Date();
    const hoursElapsed = differenceInHours(now, paymentAwaitingAt);
    return hoursElapsed >= OVERDUE_THRESHOLD_HOURS;
};


// --- Правило 2: Контроль Сроков Истечения Документов ---
const ALERT_THREE_WEEKS = 21; 
const CRITICAL_COLLECTION_WEEKS = 14; 
const REMINDER_CRITICAL_WEEKS = 7; 


/**
 * Определяет статус срока действия документа и уровень риска.
 * @param {Date} expiryDate - Дата окончания документа.
 * @returns {{level: string, message: string}} - Объект статуса и сообщения для UI/логирования.
 */
export const getExpiryStatus = (expiryDate) => {
    const now = new Date();
    
    // Проверка 1: Документ уже истек (today или в прошлом)
    if (isBefore(expiryDate, now)) {
        return {
            level: 'EXPIRED', 
            message: 'Документ истек. Немедленное действие.'
        };
    }
    
    const daysRemaining = differenceInDays(expiryDate, now); 

    // Проверка 2: 1 неделя (Самый критичный порог)
    if (daysRemaining <= REMINDER_CRITICAL_WEEKS) {
        return {
            level: 'REMINDER_CRITICAL', 
            message: `1 неделя до истечения (${daysRemaining} дней). Срочное оповещение.`
        };
    }

    // Проверка 3: 2 недели (Критический порог сбора документов)
    if (daysRemaining <= CRITICAL_COLLECTION_WEEKS) {
        return {
            level: 'CRITICAL_COLLECTION', 
            message: `2 недели до истечения (${daysRemaining} дней). Сбор документов должен быть завершен.`
        };
    }

    // Проверка 4: 3 недели (Первичное оповещение)
    if (daysRemaining <= ALERT_THREE_WEEKS) {
        return {
            level: 'REMINDER_PROACTIVE', 
            message: `3 недели до истечения (${daysRemaining} дней). Первичное оповещение.`
        };
    }
    
    // По умолчанию: Срок действия в норме
    return {
        level: 'SAFE', 
        message: 'Срок действия в норме.'
    };
};