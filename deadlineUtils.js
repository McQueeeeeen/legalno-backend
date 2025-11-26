// deadlineUtils.js
import { format, addDays } from 'date-fns'; 
import { KAZAKHSTAN_HOLIDAYS } from './holidays.js'; 

/**
 * Вспомогательная функция: форматирует дату в YYYY-MM-DD для сравнения.
 * Используем date-fns для максимальной надежности.
 * @param {Date} date
 * @returns {string} Строка даты.
 */
const formatDateString = (date) => {
    return format(date, 'yyyy-MM-dd'); 
};

/**
 * Функция 1: Проверяет, является ли дата рабочим днем.
 * @param {Date} date - Дата для проверки.
 * @returns {boolean} - true, если рабочий день, иначе false.
 */
export const isWorkingDay = (date) => {
    const dayOfWeek = date.getDay(); 

    // 1. Проверка на выходной день (Воскресенье (0) или Суббота (6))
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return false; 
    }

    // 2. Проверка на государственный праздник
    const dateString = formatDateString(date);

    // .includes() — быстрый и надежный способ поиска в массиве.
    if (KAZAKHSTAN_HOLIDAYS.includes(dateString)) {
        return false; 
    }

    return true; // Это рабочий день
};

/**
 * Функция 2: Расчет даты дедлайна (с учетом рабочих дней).
 * @param {Date} startDate - Дата начала отсчета (подача заявки).
 * @param {number} requiredWorkingDays - Требуемое количество рабочих дней (1 или 2).
 * @returns {Date} - Дата, когда истекает дедлайн (рабочий день).
 */
export const calculateDeadline = (startDate, requiredWorkingDays) => {
    // Начинаем с исходной даты (это будет наш итератор)
    let currentDate = startDate; 
    let workingDaysCount = 0; 
    
    // Цикл продолжается, пока не наберется нужное количество рабочих дней
    while (workingDaysCount < requiredWorkingDays) {
        // 1. Продвигаем дату вперед на 1 день (сначала всегда двигаем дату!)
        currentDate = addDays(currentDate, 1);
        
        // 2. Проверяем, является ли этот новый день рабочим
        if (isWorkingDay(currentDate)) {
            // 3. Если рабочий, засчитываем его
            workingDaysCount++;
        }
        // Если не рабочий (выходной/праздник), просто переходим к следующему дню.
    }
    
    return currentDate; 
};