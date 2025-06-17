// backend/src/utils/timeUtils.js

/**
 * @desc    Convierte una cadena de hora "HH:MM" a minutos desde la medianoche.
 * @param   {string} timeString - La cadena de tiempo (ej. "09:30").
 * @returns {number} Minutos desde la medianoche.
 */
const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * @desc    Convierte minutos desde la medianoche a una cadena de hora "HH:MM".
 * @param   {number} totalMinutes - Minutos desde la medianoche.
 * @returns {string} Cadena de tiempo (ej. "09:30").
 */
const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * @desc    Comprueba si una franja horaria (start, end) se superpone con otra.
 * @param   {Object} interval1 - Primer intervalo {start: "HH:MM", end: "HH:MM"}.
 * @param   {Object} interval2 - Segundo intervalo {start: "HH:MM", end: "HH:MM"}.
 * @returns {boolean} True si se superponen, false en caso contrario.
 */
const intervalsOverlap = (interval1, interval2) => {
    const start1 = timeToMinutes(interval1.start);
    const end1 = timeToMinutes(interval1.end);
    const start2 = timeToMinutes(interval2.start);
    const end2 = timeToMinutes(interval2.end);

    return Math.max(start1, start2) < Math.min(end1, end2);
};

/**
 * @desc    Formatea un objeto Date a una cadena de fecha "YYYY-MM-DD".
 * @param   {Date} date - Objeto Date.
 * @returns {string} Fecha formateada.
 */
const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * @desc    Formatea un objeto Date a una cadena de hora "HH:MM".
 * @param   {Date} date - Objeto Date.
 * @returns {string} Hora formateada.
 */
const formatTimeToHHMM = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

/**
 * @desc    Calcula la diferencia en minutos entre dos objetos Date.
 * @param   {Date} date1 - Primer objeto Date.
 * @param   {Date} date2 - Segundo objeto Date.
 * @returns {number} Diferencia en minutos.
 */
const getMinutesDifference = (date1, date2) => {
    const diffMs = Math.abs(date1.getTime() - date2.getTime());
    return Math.floor(diffMs / (1000 * 60));
};

module.exports = {
    timeToMinutes,
    minutesToTime,
    intervalsOverlap,
    formatDateToYYYYMMDD,
    formatTimeToHHMM,
    getMinutesDifference,
};
