// Объявляем переменные в глобальной области видимости
let salaryInput, taxInput, netSalaryDisplay, workDaysInput, workHoursInput, hourlyRateDisplay, clearButton, themeToggle;
let expenseAmountInput, expenseDescriptionInput, calculateButton;
let expenseHistory = [];
let confirmModal, confirmYesButton, confirmNoButton, confirmMessage;
let confirmAction = null;
let formData = {};
let currentPage = 1; // Текущая страница
const recordsPerPage = 5; // Количество записей на страницу

/**
 * Функция для отображения уведомлений
 * @param {string} message - Текст сообщения
 * @param {string} type - Тип уведомления: 'success', 'error', 'info', 'warning'
 */
function showNotification(message, type = 'info') {
    const notificationContainer = document.getElementById('notification-container');

    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.classList.add('notification', type);

    // Добавляем текст сообщения и кнопку закрытия
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn">&times;</button>
    `;

    // Добавляем уведомление в контейнер
    notificationContainer.appendChild(notification);

    // Показываем уведомление с анимацией
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Функция для удаления уведомления
    function removeNotification() {
        notification.classList.remove('show');
        notification.classList.add('hide');
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 500);
    }

    // Обработчик клика по кнопке закрытия
    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.addEventListener('click', removeNotification);

    // Автоматическое удаление уведомления через 5 секунд
    setTimeout(removeNotification, 5000);
}

/**
 * Функция для загрузки данных из localStorage
 */
function loadFormData() {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
        formData = JSON.parse(savedData);
        salaryInput.value = formData.salary || '';
        taxInput.value = formData.tax || '';
        workDaysInput.value = formData.workDays || '';
        workHoursInput.value = formData.workHours || '';
        calculateNetSalary();
        calculateHourlyRate();
    }
}

/**
 * Функция для сохранения данных в localStorage
 */
function saveFormData() {
    formData.salary = parseFloat(salaryInput.value) || 0;
    formData.tax = parseFloat(taxInput.value) || 0;
    formData.workDays = parseInt(workDaysInput.value) || 0;
    formData.workHours = parseFloat(workHoursInput.value) || 0;
    localStorage.setItem('formData', JSON.stringify(formData));
}

/**
 * Функция для форматирования чисел в валюту
 * @param {number} amount - сумма для форматирования
 * @returns {string} - отформатированная строка
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '0 ₽';
    }
    return amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
}

/**
 * Функция для расчета зарплаты после вычета налога
 */
function calculateNetSalary() {
    const salary = parseFloat(salaryInput.value) || 0;
    const tax = parseFloat(taxInput.value) || 0;
    const netSalary = salary - (salary * tax / 100);
    netSalaryDisplay.textContent = formatCurrency(netSalary);
}

/**
 * Функция для расчета оплаты труда в час
 */
function calculateHourlyRate() {
    const netSalaryText = netSalaryDisplay.textContent.replace(/\s/g, '').replace('₽', '').replace(',', '.');
    const netSalary = parseFloat(netSalaryText) || 0;
    const workDays = parseInt(workDaysInput.value) || 0;
    const workHours = parseFloat(workHoursInput.value) || 0;
    const totalHours = workDays * workHours * 4; // Предполагаем 4 недели в месяце
    const hourlyRate = totalHours ? netSalary / totalHours : 0;
    hourlyRateDisplay.textContent = formatCurrency(hourlyRate);
}

/**
 * Функция для обработки изменений в полях формы
 */
function handleInputChange() {
    calculateNetSalary();
    calculateHourlyRate();
    saveFormData();
}

/**
 * Функция для переключения темы
 */
function toggleTheme() {
    if (themeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

/**
 * Функция для загрузки выбранной темы
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        themeToggle.checked = true;
        document.body.classList.add('dark-mode');
    } else {
        themeToggle.checked = false;
        document.body.classList.remove('dark-mode');
    }
}

/**
 * Функция для проверки заполнения обязательных полей
 */
function validateInputs() {
    let isValid = true;

    // Сначала убираем класс 'error' у всех полей
    const inputs = [salaryInput, taxInput, workDaysInput, workHoursInput, expenseAmountInput];
    inputs.forEach(input => {
        input.classList.remove('error');
    });

    // Проверяем обязательные поля в первом блоке
    if (!salaryInput.value) {
        salaryInput.classList.add('error');
        isValid = false;
    }
    if (!taxInput.value) {
        taxInput.classList.add('error');
        isValid = false;
    }
    if (!workDaysInput.value) {
        workDaysInput.classList.add('error');
        isValid = false;
    }
    if (!workHoursInput.value) {
        workHoursInput.classList.add('error');
        isValid = false;
    }

    // Проверяем обязательные поля во втором блоке
    if (!expenseAmountInput.value) {
        expenseAmountInput.classList.add('error');
        isValid = false;
    }

    if (!isValid) {
        showNotification('Пожалуйста, заполните все обязательные поля.', 'error');
    }

    return isValid;
}

/**
 * Функция для склонения слов в зависимости от числа
 * @param {number} number - число
 * @param {array} titles - массив вариантов слова
 * @returns {string} - корректная форма слова
 */
function declension(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    const mod100 = Math.abs(number) % 100;
    const mod10 = Math.abs(number) % 10;
    if (mod100 > 4 && mod100 < 20) {
        return titles[2];
    } else {
        return titles[(mod10 < 5) ? cases[mod10] : cases[5]];
    }
}

/**
 * Функция для преобразования времени в годы, месяцы, недели, дни, часы, минуты, секунды
 * @param {number} totalSeconds - общее количество секунд
 * @returns {string} - строка с разбиением по единицам времени
 */
function formatTime(totalSeconds) {
    if (totalSeconds <= 0) {
        return '0 секунд';
    }

    const units = [
        { name: ['год', 'года', 'лет'], seconds: 31536000 },
        { name: ['месяц', 'месяца', 'месяцев'], seconds: 2592000 },
        { name: ['неделя', 'недели', 'недель'], seconds: 604800 },
        { name: ['день', 'дня', 'дней'], seconds: 86400 },
        { name: ['час', 'часа', 'часов'], seconds: 3600 },
        { name: ['минута', 'минуты', 'минут'], seconds: 60 },
        { name: ['секунда', 'секунды', 'секунд'], seconds: 1 },
    ];

    let remainingSeconds = totalSeconds;
    let result = [];

    for (let unit of units) {
        const value = Math.floor(remainingSeconds / unit.seconds);
        if (value > 0) {
            result.push(`${value} ${declension(value, unit.name)}`);
            remainingSeconds %= unit.seconds;
        }
    }

    return result.join(', ');
}

/**
 * Функция для выполнения расчетов
 */
function performCalculations() {
    // Получаем необходимые данные
    const expenseAmount = parseFloat(expenseAmountInput.value);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
        showNotification('Пожалуйста, укажите корректную сумму потраченных средств.', 'error');
        return;
    }

    const hourlyRateText = hourlyRateDisplay.textContent.replace(/\s/g, '').replace('₽', '').replace(',', '.');
    const hourlyRate = parseFloat(hourlyRateText);
    if (isNaN(hourlyRate) || hourlyRate <= 0) {
        showNotification('Оплата труда в час равна нулю или некорректна. Пожалуйста, проверьте введенные данные.', 'error');
        return;
    }

    // Расчет необходимого количества рабочих часов
    const hoursNeeded = expenseAmount / hourlyRate;

    // Получаем рабочие часы и дни
    const workDaysPerWeek = parseInt(workDaysInput.value);
    const workHoursPerDay = parseFloat(workHoursInput.value);

    if (isNaN(workDaysPerWeek) || workDaysPerWeek <= 0 || isNaN(workHoursPerDay) || workHoursPerDay <= 0) {
        showNotification('Пожалуйста, убедитесь, что количество рабочих дней в неделю и рабочих часов в день больше нуля.', 'error');
        return;
    }

    // Расчет количества рабочих дней, необходимых для отработки часов
    let totalWorkDaysNeeded = hoursNeeded / workHoursPerDay;

    // Конвертируем рабочие дни в недели, месяцы и годы с учетом рабочего графика
    const weeksPerYear = 52;
    const weeksPerMonth = weeksPerYear / 12; // ~4.3333
    const workDaysPerMonth = workDaysPerWeek * weeksPerMonth; // Среднее количество рабочих дней в месяце
    const workDaysPerYear = workDaysPerWeek * weeksPerYear; // Количество рабочих дней в году

    const years = Math.floor(totalWorkDaysNeeded / workDaysPerYear);
    totalWorkDaysNeeded %= workDaysPerYear;

    const months = Math.floor(totalWorkDaysNeeded / workDaysPerMonth);
    totalWorkDaysNeeded %= workDaysPerMonth;

    const weeks = Math.floor(totalWorkDaysNeeded / workDaysPerWeek);
    totalWorkDaysNeeded %= workDaysPerWeek;

    const days = Math.floor(totalWorkDaysNeeded);
    totalWorkDaysNeeded %= 1;

    // Оставшиеся часы, минуты и секунды
    const remainingHours = totalWorkDaysNeeded * workHoursPerDay;
    const hours = Math.floor(remainingHours);

    const remainingMinutes = (remainingHours % 1) * 60;
    const minutes = Math.floor(remainingMinutes);

    const seconds = Math.floor((remainingMinutes % 1) * 60);

    // Формируем результат
    let resultWithScheduleText = '';

    if (years > 0) {
        resultWithScheduleText += `${years} ${declension(years, ['год', 'года', 'лет'])}, `;
    }

    if (months > 0) {
        resultWithScheduleText += `${months} ${declension(months, ['месяц', 'месяца', 'месяцев'])}, `;
    }

    if (weeks > 0) {
        resultWithScheduleText += `${weeks} ${declension(weeks, ['неделя', 'недели', 'недель'])}, `;
    }

    if (days > 0) {
        resultWithScheduleText += `${days} ${declension(days, ['день', 'дня', 'дней'])}, `;
    }

    if (hours > 0) {
        resultWithScheduleText += `${hours} ${declension(hours, ['час', 'часа', 'часов'])}, `;
    }

    if (minutes > 0) {
        resultWithScheduleText += `${minutes} ${declension(minutes, ['минута', 'минуты', 'минут'])}, `;
    }

    if (seconds > 0) {
        resultWithScheduleText += `${seconds} ${declension(seconds, ['секунда', 'секунды', 'секунд'])}`;
    }

    // Удаляем лишние запятые и пробелы
    resultWithScheduleText = resultWithScheduleText.replace(/,\s*$/, '');

    // Если результат пустой, значит время менее 1 секунды
    if (!resultWithScheduleText) {
        resultWithScheduleText = 'Менее 1 секунды';
    }

    // Второй расчет: без учета рабочего графика
    const totalSecondsWithoutSchedule = hoursNeeded * 3600;

    const formattedTimeWithoutSchedule = formatTime(Math.ceil(totalSecondsWithoutSchedule));

    // Добавляем объект с данными о времени в числовом формате
    const expenseEntry = {
        date: new Date().toLocaleString('ru-RU').replace(', ', ' '),
        expenseAmount: expenseAmount,
        comment: expenseDescriptionInput.value || '-',
        timeWithSchedule: resultWithScheduleText,
        timeWithoutSchedule: formattedTimeWithoutSchedule,
        years: years,
        months: months,
        weeks: weeks,
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };

    // Сохраняем объект с данными в массив истории
    expenseHistory.unshift(expenseEntry);

    // Сохраняем историю в localStorage
    saveExpenseHistory();

    // Обновляем отображение истории
    updateExpenseHistory();

    // Очищаем поля с суммой затрат и комментарием
    expenseAmountInput.value = '';
    expenseDescriptionInput.value = '';
}

/**
 * Обработчик нажатия на кнопку "Рассчитать"
 */
function handleCalculateButtonClick() {
    if (validateInputs()) {
        performCalculations();
    }
}

/**
 * Функция для загрузки истории расходов из localStorage
 */
function loadExpenseHistory() {
    const savedHistory = localStorage.getItem('expenseHistory');
    if (savedHistory) {
        expenseHistory = JSON.parse(savedHistory);
        updateExpenseHistory();
    }
}

/**
 * Функция для сохранения истории расходов в localStorage
 */
function saveExpenseHistory() {
    localStorage.setItem('expenseHistory', JSON.stringify(expenseHistory));
}

/**
 * Функция для форматирования числа в строку с ведущими нулями
 * @param {number} value - значение для форматирования
 * @param {number} length - длина строки
 * @returns {string} - отформатированное число с ведущими нулями
 */
function padWithZeroes(value, length) {
    return String(value).padStart(length, '0');
}

/**
 * Функция для обновления текущей страницы истории
 */
function updateExpenseHistory() {
    const expenseHistoryContainer = document.getElementById('expense-history');
    expenseHistoryContainer.innerHTML = '';

    // Рассчитываем начало и конец записей для текущей страницы
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const paginatedExpenses = expenseHistory.slice(start, end);

    paginatedExpenses.forEach((entry, index) => {
        const card = document.createElement('div');
        card.classList.add('expense-card');

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.textContent = 'Удалить';
        deleteButton.addEventListener('click', () => deleteExpenseEntry(index + start));
        card.appendChild(deleteButton);

        const header = document.createElement('h4');
        header.textContent = `Дата и время: ${entry.date}`;
        card.appendChild(header);

        const amountP = document.createElement('p');
        amountP.textContent = `Сумма затрат: ${formatCurrency(entry.expenseAmount)}`;
        card.appendChild(amountP);

        const timeWithoutScheduleP = document.createElement('p');
        timeWithoutScheduleP.textContent = `Без учета рабочего графика: ${entry.timeWithoutSchedule}`;
        card.appendChild(timeWithoutScheduleP);

        const timeWithScheduleP = document.createElement('p');
        timeWithScheduleP.textContent = `С учетом рабочего графика: ${entry.timeWithSchedule}`;
        card.appendChild(timeWithScheduleP);

        if (entry.comment && entry.comment !== '-') {
            const commentP = document.createElement('p');
            commentP.textContent = `Комментарий: ${entry.comment}`;
            card.appendChild(commentP);
        }

        const formattedTime = `${padWithZeroes(entry.years, 4)}.${padWithZeroes(entry.months, 2)}.${padWithZeroes(entry.weeks, 2)}.${padWithZeroes(entry.days, 2)}.${padWithZeroes(entry.hours, 2)}.${padWithZeroes(entry.minutes, 2)}.${padWithZeroes(entry.seconds, 2)}`;

        const timeFormattedP = document.createElement('p');
        timeFormattedP.classList.add('time-formatted');
        timeFormattedP.textContent = formattedTime;
        card.appendChild(timeFormattedP);

        expenseHistoryContainer.appendChild(card);
    });

    // Обновляем пагинацию
    updatePaginationControls();
}

/**
 * Функция для обновления кнопок пагинации
 */
function updatePaginationControls() {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = '';

    const totalPages = Math.ceil(expenseHistory.length / recordsPerPage);

    // Создаем кнопки для каждой страницы
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('pagination-button');

        // Добавляем класс для текущей активной страницы
        if (i === currentPage) {
            pageButton.classList.add('active');
        }

        // Обработчик события для перехода на выбранную страницу
        pageButton.addEventListener('click', () => {
            currentPage = i;
            updateExpenseHistory();
        });

        paginationControls.appendChild(pageButton);
    }
}

/**
 * Функция для удаления отдельной записи из истории
 */
function deleteExpenseEntry(index) {
    confirmMessage.textContent = 'Вы действительно хотите удалить эту запись?';
    confirmAction = 'deleteExpenseEntry';
    confirmModal.dataset.entryIndex = index;
    showModal();
}

/**
 * Функция для очистки данных формы
 */
function clearFormData() {
    confirmMessage.textContent = 'Вы действительно хотите очистить данные?';
    confirmAction = 'clearFormData';
    showModal();
}

/**
 * Функция для очистки истории расходов
 */
function clearExpenseHistory() {
    confirmMessage.textContent = 'Вы действительно хотите очистить историю расходов?';
    confirmAction = 'clearExpenseHistory';
    showModal();
}

/**
 * Функция для удаления класса 'error' при вводе корректных данных
 * @param {Event} event - событие ввода
 */
function removeErrorHighlight(event) {
    const input = event.target;
    if (input.value.trim() !== '') {
        input.classList.remove('error');
    }
}

/**
 * Функция для показа модального окна с анимацией
 */
function showModal() {
    confirmModal.classList.add('show');
}

/**
 * Функция для скрытия модального окна с анимацией
 */
function hideModal() {
    confirmModal.classList.remove('show');
    confirmAction = null;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Присваиваем элементы формы и другие элементы управления после загрузки DOM
    salaryInput = document.getElementById('salary');
    taxInput = document.getElementById('tax');
    netSalaryDisplay = document.getElementById('net-salary');
    workDaysInput = document.getElementById('work-days');
    workHoursInput = document.getElementById('work-hours');
    hourlyRateDisplay = document.getElementById('hourly-rate');
    clearButton = document.getElementById('clear-button');
    themeToggle = document.getElementById('theme-toggle');

    // Элементы для затрат
    expenseAmountInput = document.getElementById('expense-amount');
    expenseDescriptionInput = document.getElementById('expense-description');
    calculateButton = document.getElementById('calculate-button');

    // Элементы модального окна инструкции
    const helpButton = document.getElementById('help-button');
    const instructionModal = document.getElementById('instruction-modal');
    const instructionClose = document.getElementById('instruction-close');

    // Добавляем обработчики событий
    salaryInput.addEventListener('input', handleInputChange);
    taxInput.addEventListener('input', handleInputChange);
    workDaysInput.addEventListener('input', handleInputChange);
    workHoursInput.addEventListener('input', handleInputChange);
    clearButton.addEventListener('click', clearFormData);
    themeToggle.addEventListener('change', toggleTheme);

    calculateButton.addEventListener('click', handleCalculateButtonClick);

    // Поля, которые нужно проверять
    const inputsToValidate = [salaryInput, taxInput, workDaysInput, workHoursInput, expenseAmountInput];

    // Добавляем обработчики событий для удаления класса 'error'
    inputsToValidate.forEach(input => {
        input.addEventListener('input', removeErrorHighlight);
    });

    const clearHistoryButton = document.getElementById('clear-history-button');
    clearHistoryButton.addEventListener('click', clearExpenseHistory);

    confirmModal = document.getElementById('confirm-modal');
    confirmYesButton = document.getElementById('confirm-yes');
    confirmNoButton = document.getElementById('confirm-no');
    confirmMessage = document.getElementById('confirm-message');

    confirmYesButton.addEventListener('click', () => {
        switch (confirmAction) {
            case 'clearFormData':
                salaryInput.value = '';
                taxInput.value = '';
                netSalaryDisplay.textContent = formatCurrency(0);
                workDaysInput.value = '';
                workHoursInput.value = '';
                hourlyRateDisplay.textContent = formatCurrency(0);
                formData = {};
                localStorage.removeItem('formData');
                showNotification('Данные успешно очищены.', 'success');
                break;
            case 'clearExpenseHistory':
                expenseHistory = [];
                saveExpenseHistory();
                updateExpenseHistory();
                showNotification('История расходов очищена.', 'success');
                break;
            case 'deleteExpenseEntry':
                const index = parseInt(confirmModal.dataset.entryIndex, 10);
                expenseHistory.splice(index, 1);
                saveExpenseHistory();
                updateExpenseHistory();
                showNotification('Запись удалена.', 'success');
                break;
            default:
                break;
        }
        hideModal();
    });

    confirmNoButton.addEventListener('click', () => {
        hideModal();
    });

    window.addEventListener('click', (event) => {
        if (event.target === confirmModal) {
            hideModal();
        }
    });

    helpButton.addEventListener('click', () => {
        instructionModal.classList.add('show');
    });

    instructionClose.addEventListener('click', () => {
        instructionModal.classList.remove('show');
    });

    window.addEventListener('click', (event) => {
        if (event.target === instructionModal) {
            instructionModal.classList.remove('show');
        }
    });

    loadTheme();
    loadFormData();
    loadExpenseHistory();
});
