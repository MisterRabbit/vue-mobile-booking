import {
    format,
    addDays,
    subDays,
    eachDayOfInterval,
    parseISO,
    parse,
    differenceInMinutes,
    addMinutes,
    isWithinInterval,
    isSameHour,
    areIntervalsOverlapping,
    getHours,
    isSameDay,
    set,
} from 'date-fns';
import {sortAsc} from '../../../../../utils/sort';
import {cloneDeep} from 'lodash';
import {optionsDateFns, formatDate} from '../../../../../utils/date-format';
import {bookingTypesObj} from '../../../../../utils/dict/booking-types';

const userVisualSettingsModule = ntdevApp.getModule("ntdevUserVisualSettings");

/**
 * Получение диапазона дат, отображемых в графике работы сотрудников
 * @returns {Object} Object.dateStart дата начала периода
 * @returns {Object} Object.dateEnd дата окончания периода
 */
const getStaffWorkDaysInterval = () => {
    const settingName = 'scheduler.staffWorkDaysInterval';
    let staffWorkDaysInterval = 7;

    if (userVisualSettingsModule.hasValue(settingName)) {
        let daysInterval = userVisualSettingsModule.getValue(settingName);
        if (daysInterval > 0 && typeof daysInterval === 'number') {
            staffWorkDaysInterval = daysInterval;
        }
    }

    let dateEnd = addDays(new Date(), staffWorkDaysInterval);

    return {
        dateStart: format(new Date(), 'yyyy-MM-dd'),
        dateEnd: format(dateEnd, 'yyyy-MM-dd'),
    }
};

/**
 * Получение пользовательских настроек количества колонок на странице
 * @returns {Number} количество колонок на странице
 */
const getColumnsPerPageVisualSettings = () => {
    const settingName = 'scheduler.mobileTimelineColumnCount';
    let columnPerPage = 1;

    if (userVisualSettingsModule.hasValue(settingName)) {
        columnPerPage = userVisualSettingsModule.getValue(settingName);
    }
    return columnPerPage;
};

/**
 * Задать пользовательские настройки количества колонок на странице
 * @param {Number} columnPerPage количество колонок на странице
 */
const setColumnsPerPageVisualSettings = columnPerPage => {
    const settingName = 'scheduler.mobileTimelineColumnCount';
    userVisualSettingsModule.setValue(settingName, columnPerPage);
};

/**
 * Получение шаблона дат в выбранном диапазоне
 * @param {String} dateStart дата начала периода
 * @param {String} dateEnd дата окончания периода
 * @returns {Array} Массив дат
 */
const getScheduleWorkDaysTemplate = (dateStart, dateEnd) => {
    let initDaysList = eachDayOfInterval({
        start: parseISO(dateStart),
        end: parseISO(dateEnd),
    });
    let fullDaysList = [];

    initDaysList.forEach(day => {
        let newDate = {
            weekDay: format(day, 'EEEEEE', optionsDateFns),
            date: format(day, 'yyyy-MM-dd'),
            formattedDate: format(day, 'dd.MM.yyyy'),
            isToday: false,
            type: null,
            title: '',
        };
        fullDaysList.push(newDate);
    });

    let today = format(new Date(), 'dd.MM.yyyy');

    let currentDay = fullDaysList.find(day => day.formattedDate === today);
    if (currentDay !== undefined) {
        currentDay.isToday = true;
    }

    return fullDaysList;
};

/**
 * Получение отфильтрованного списка сотрудников
 * @param {Array} staffList изначальный список сотрудников
 * @param {String} searchStr Значение поисковой строки
 * @param {Number, Null} selectedPositionId Id выбранной специальноси
 * @returns {Array} Отфильтрованный список сотрудников
 */
const getFilteredStaffList = (staffList, searchStr, selectedPositionId) => {
    const isSearching = searchStr !== '';
    const isSelectedPosition = selectedPositionId !== null;

    if (isSearching || isSelectedPosition) {
        return staffList.filter(staff => {
            const isSearchStringMatch = isSearching ? staff.FIO.toUpperCase().indexOf(searchStr.toUpperCase()) !== -1 : true;
            const isPositionMatch = isSelectedPosition ? staff.positionId === selectedPositionId : true;
            return isSearchStringMatch && isPositionMatch;
        });
    }
    return staffList;
};

/**
 * Получение отфильтрованного списка сотрудников
 * @param {Array} staffList изначальный список сотрудников
 * @param {Array} staffWorkDays общий список заполенных дней для всех сотрудников
 * @returns {Object} рабочие дни для каждого сотрудника
 */
const getStaffScheduleData = (staffList, staffWorkDays) => {
    let schedule = {};

    staffList.forEach(staff => {
        schedule[staff.id] = [];
    });

    staffWorkDays.forEach(day => {
        if ('organizationStaffId' in day && day.organizationStaffId in schedule) {
            schedule[day.organizationStaffId].push(day);
        }
    });

    return schedule;
};

/**
 * Добалвение одного дня к изначальной дате
 * @param {String} date начальная дата
 * @returns {String} итоговая дата
 */
const addOneDay = date => {
    return format(addDays(parseISO(date), 1), 'yyyy-MM-dd');
};

/**
 * Вычитание одного дня от изначальной даты
 * @param {String} date начальная дата
 * @returns {String} итоговая дата
 */
const subOneDay = date => {
    return format(subDays(parseISO(date), 1), 'yyyy-MM-dd');
};

/**
 * Подготовка данных для запроса данных календаря
 * @param {String} date выбранная дата
 * @param {Object} filters параметры фильтрации
 * @returns {Object} Подготовленные данные для запроса
 */
const prepareTimelineRequestData = (date, filters) => ({
    dateList: [formatDate(date)],
    organizationCustomerId: filters.customerId || -1,
    organizationStaffId: filters.staffId || -1,
    positionId: filters.positionId || -1,
    subdivisionId: filters.subdivisionId || -1,
});

/**
 * Обработка полученного от сервера списка записей
 * @param {Array} bookingList список записей
 * @returns {Array} Модицифицированный список записей
 */
const modifyResponseBookingList = bookingList => {
    bookingList.forEach(booking => {
        Object.assign(booking, {
            position: {
                height: 0,
                width: 0,
                offsetFromTop: 0,
                marginLeft: 0,
            },
            startDateISO: parse(booking.startDate, 'dd/MM/yyyy HH:mm', new Date()),
            endDateISO: parse(booking.endDate, 'dd/MM/yyyy HH:mm', new Date()),
            duration: 0,
        });
    });
    return bookingList;
};

/**
 * Получение рабочего времени для календаря
 * @param {String} selectedDate выбранная дата
 * @param {Array} staffColumnsList список колонок сотрудников
 * @param {Object} organizationInfo информация об органиазации
 * @returns {Object} start время начала работы
 * @returns {Object} end время окончания работы
 */
const getWorkingTime = (selectedDate, staffColumnsList, organizationInfo) => {
    let newWorkingTime = {
        start: organizationInfo.workingTimeStart,
        end: organizationInfo.workingTimeEnd,
    };
    staffColumnsList.forEach(column => {
        column.workingHours.forEach(workingInterval => {
            if (workingInterval.startHour < newWorkingTime.start) {
                newWorkingTime.start = workingInterval.startHour;
            }
            if (newWorkingTime.end < workingInterval.endHour) {
                newWorkingTime.end = workingInterval.endHour;
            }
        });
    });
    if (newWorkingTime.end === 24) {
        newWorkingTime.end = parse('23:59:59', 'HH:mm:s', new Date(selectedDate));
    } else {
        newWorkingTime.end = parse(newWorkingTime.end, 'H', new Date(selectedDate));
    }

    return {
        start: parse(newWorkingTime.start, 'H', new Date(selectedDate)),
        end: newWorkingTime.end,
    }
};

/**
 * Создание массива временных интервалов с заданным шагом
 * @param {Date} workingTime
 * @param {Date} workingTime.start время начала работы
 * @param {Date} workingTime.end время окончания работы
 * @param {Number} intervalStep шаг интервала
 * @returns {Array} Массив интервалов
 */
const createIntervalsArray = (workingTime, intervalStep) => {

    const totalMinutesDifference = differenceInMinutes(workingTime.end, workingTime.start);
    const rowsCount = Math.ceil(totalMinutesDifference / intervalStep) - 1;

    let timeIntervals = [];
    let timeSum = workingTime.start;

    for (let i = 0; i <= rowsCount; i += 1) {
        const newInterval = {
            timeISO: timeSum,
            timeShort: format(timeSum,'HH:mm'),
        };
        newInterval.isHour = newInterval.timeShort.slice(3) === '00';

        timeIntervals.push(newInterval);
        timeSum = addMinutes(timeSum, intervalStep);
    }
    return timeIntervals;
};

/**
 * Создание массива колонок для сотрудников
 * @param {Array} staffColumnsList список колонок сотрудников
 * @param {Array} timeIntervals массива временных интервалов
 * @returns {Array} Массив колонок сотрудников
 */
const setStaffColumnsData = (staffColumnsList, timeIntervals) => {
    staffColumnsList.sort((a, b) => sortAsc(a, b, 'label'));

    // Получение массива доступных для записи интервалов
    const getEnableIntervals = column => {
        let enableIntervals = [];
        column.workingHours.forEach(interval => {
            let newInterval = {
                start: parse(interval.startHour, 'H', column.dateISO),
            };
            if (interval.endHour === 24) {
                newInterval.end = parse('23:59:59', 'HH:mm:s', column.dateISO);
            } else {
                newInterval.end = parse(interval.endHour, 'H', column.dateISO);
            }

            enableIntervals.push(newInterval);
        });
        return enableIntervals;
    };

    // Получение массива всех интервалов для колонки
    const getAllIntervals = column => {
        let clonedTimeIntervals = cloneDeep(timeIntervals);
        clonedTimeIntervals.forEach(interval => {
            let isEnableInterval = false;
            // Проверям каждый имеющийся интервал на пересечение с доступными для записи интервалами
            column.enableIntervals.forEach(workingInterval => {
                let isIntervalsOverlapping = isWithinInterval(interval.timeISO, workingInterval);

                if (isIntervalsOverlapping) {
                    if (getHours(workingInterval.end) === 23 || !isSameHour(interval.timeISO, workingInterval.end)) {
                        isEnableInterval = true;
                    }
                }
            });
            interval.columnId = column.columnId;
            interval.isEnableBooking = isEnableInterval;
        });
        return clonedTimeIntervals;
    };

    staffColumnsList.forEach(column => {
        column.bookingList = [];
        column.dateISO = parse(column.fullDate, 'dd.MM.yyyy', new Date());
        column.enableIntervals = getEnableIntervals(column);
        column.timeIntervals = getAllIntervals(column);
    });

    return staffColumnsList;
};

/**
 * Создание массива колонок для аппаратов
 * @param {Array} unitList список аппаратов
 * @param {Array} timeIntervals массива временных интервалов
 * @returns {Array} Массив колонок аппаратов
 */
const setUnitsColumnsData = (unitList, timeIntervals) => {
    let unitsColumns = [];

    unitList.forEach(unit => {
        let newColumn = {
            timeIntervals,
            unitId: unit.id,
            label: unit.title,
            labelPhotoUrl: unit.photoUrl,
            bookingList: [],
        };
        unitsColumns.push(newColumn);
    });
    return unitsColumns;
};

/**
 * Создание массива колонок для кабинетов
 * @param {Array} cabinetList список кабинетов
 * @param {Array} timeIntervals массива временных интервалов
 * @returns {Array} Массив колонок кабинетов
 */
const setCabinetsColumnsData = (cabinetList, timeIntervals) => {
    let cabinetsColumns = [];

    cabinetList.forEach(cabinet => {
        let newColumn = {
            timeIntervals,
            cabinetId: cabinet.id,
            label: cabinet.title,
            labelPhotoUrl: cabinet.photoUrl,
            bookingList: [],
        };
        cabinetsColumns.push(newColumn);
    });
    return cabinetsColumns;
};

/**
 * Создание массива колонок для кабинетов
 * @param {Array} columnsData массив колонок
 * @param {Object} pagination
 * @param {Number} pagination.currentPage текущая страница
 * @param {Number} pagination.columnsPerPage количество колонок на странице
 * @returns {Array} Массив колонок согласно пагинации
 */
const getPaginatedColumns = (columnsData, pagination) => {
    if (columnsData.length < 1) {
        return columnsData;
    }
    let from = (pagination.currentPage - 1) * pagination.columnsPerPage;
    let to = from + pagination.columnsPerPage;
    return columnsData.slice(from, to);
};

/**
 * Первичная сортировка списка записей
 * @param {String} tableType тип таблицы
 * @param {Array} bookingList массив записей
 * @returns {Object} Отсортированные записи
 */
const getSortedBookingList = (tableType, bookingList) => {
    let sortedBookings = {};

    const sortKeys = {
        staff: 'columnId',
        units: 'unit',
        cabinets: 'cabinet'
    };
    const isStaffColumn = tableType === 'staff';

    bookingList.forEach(booking => {
        let key;

        if (isStaffColumn) {
            key = booking[sortKeys[tableType]];
        } else if (booking[sortKeys[tableType]] !== null){
            key = booking[sortKeys[tableType]].id;
        }

        if (key === undefined) return;

        if (sortedBookings[key] === undefined) {
            sortedBookings[key] = [];
        }
        sortedBookings[key].push(booking);
    });

    return sortedBookings;
};

/**
 * Получение массива записей для колонки
 * @param {String} tableType тип таблицы
 * @param {Object} sortedBookingList сортированные записи
 * @param {String} column текущая колонка
 * @returns {Array} Массив записей
 */
const getColumnBookings = (tableType, sortedBookingList, column) => {
    const keys = {
        staff: 'columnId',
        units: 'unitId',
        cabinets: 'cabinetId'
    };
    let key = column[keys[tableType]];

    if (key === null || key === undefined || sortedBookingList[key] === undefined) return [];

    return sortedBookingList[key];
};

/**
 * Получение форматированной даты для заголовка таблицы
 * @param {String} date начальная дата
 * @returns {String} форматированная дата
 */
const formatCalendarTableHeadDate = date => {
    const getFormattedDate = formatStr => format(new Date(date), formatStr, optionsDateFns);
    return `${getFormattedDate('d MMM')} ${getFormattedDate('EEEEEE').toUpperCase()}`;
};

/**
 * Получение упорядоченного списка записей для колонки
 * @param {Array} bookingList список записей
 * @returns {Array} Упорядоченный список записей
 */
const setBookingOrder = bookingList => {
    bookingList.forEach(bookingItem => {
        bookingItem.order = {
            column: 1,
            width: 1,
            overlapped: false,
            totalColumnsCount: 0,
        };
        bookingItem.duration = differenceInMinutes(bookingItem.endDateISO, bookingItem.startDateISO);
    });

    if (bookingList.length === 1) {
        return bookingList;
    }

    let positionedBookings = [];
    let totalColumnCount = 1;

    bookingList.forEach(bookingItem => {
        if (positionedBookings.length === 0) {
            positionedBookings.push(bookingItem);
        } else {
            let isNeedCreateNewColumn = false;
            let isOverlapped = false;
            let overlappingColumns = new Set();

            const initialInterval = {
                start: bookingItem.startDateISO,
                end: bookingItem.endDateISO,
            };

            positionedBookings.forEach(item => {
                const comparableInterval = {
                    start: item.startDateISO,
                    end: item.endDateISO,
                };
                const isOverlapping = areIntervalsOverlapping(initialInterval, comparableInterval);
                if (isOverlapping) {
                    item.order.overlapped = true;
                    isOverlapped = true;
                    overlappingColumns.add(item.order.column);
                }
            });
            if (isOverlapped) {
                if (totalColumnCount === 1) {
                    isNeedCreateNewColumn = true;
                } else {
                    if (overlappingColumns.size === totalColumnCount) {
                        isNeedCreateNewColumn = true;
                    } else {
                        for (let i = 1; i <= totalColumnCount + 1; i += 1) {
                            if (!overlappingColumns.has(i)) {
                                bookingItem.order.column = i;
                                bookingItem.order.overlapped = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (isNeedCreateNewColumn) {
                totalColumnCount += 1;
                bookingItem.order.overlapped = true;
                bookingItem.order.column = totalColumnCount;
                positionedBookings.push(bookingItem);
            } else {
                positionedBookings.push(bookingItem);
            }
        }
    });

    positionedBookings.forEach(item => {
        const initialInterval = {
            start: item.startDateISO,
            end: item.endDateISO,
        };
        const findSibling = columnNumber => {
            if (columnNumber !== totalColumnCount) {
                const nextColumn = columnNumber + 1;
                const nextColumnBooking = positionedBookings.filter(booking => booking.order.column === nextColumn);
                if (nextColumnBooking.length > 0) {
                    const isBusy = nextColumnBooking.find(item => {
                        const comparableInterval = {
                            start: item.startDateISO,
                            end: item.endDateISO,
                        };
                        return areIntervalsOverlapping(initialInterval, comparableInterval);
                    });
                    if (!isBusy) {
                        item.order.width += 1;
                        findSibling(columnNumber + 1);
                    }
                }
            }

        };
        findSibling(item.order.column);
    });

    positionedBookings.forEach(item => {
        item.order.totalColumnsCount = totalColumnCount;
    });

    return positionedBookings;
};

/**
 * Позиционироавание записей внутри колонки
 * @param {Array} bookingList список записей
 * @param {Object} columnData данные колонки
 * @param {Object} workingTime
 * @param {Date} workingTime.start время начала работы
 * @param {Date} workingTime.end время окончания работы
 * @param {Number} intervalStep шаг интервала
 * @param {Number} tableRowHeight высота строки таблицы
 * @returns {Array} Массив записей с установленными параметрами позиционирования
 */
const setBookingsPosition = (bookingList, columnData, workingTime, intervalStep, tableRowHeight) => {
    const setOffsetFromTop = bookingData => {
        const totalMinutesDifference = differenceInMinutes(workingTime.end, workingTime.start);
        const rowsCount = Math.ceil(totalMinutesDifference / intervalStep);
        const minutesAfterStart = differenceInMinutes(bookingData.startDateISO, workingTime.start);
        return rowsCount * tableRowHeight / totalMinutesDifference * minutesAfterStart;
    };
    // Задать ширину записи
    const setWidth = bookingData => {
        if (bookingData.order.overlapped) {
            return 100 / bookingData.order.totalColumnsCount * bookingData.order.width;
        }
        return 100;
    };
    // Задать для записи отступ слева
    const setMarginLeft = bookingData => {
        if (bookingData.order.overlapped) {
            if (bookingData.order.column === 1) {
                return 0;
            }
            return 100 / bookingData.order.totalColumnsCount * (bookingData.order.column - 1);

        }
        return 0;
    };

    bookingList.forEach(bookingItem => {
        bookingItem.position = {
            width: setWidth(bookingItem),
            offsetFromTop: setOffsetFromTop(bookingItem),
            marginLeft: setMarginLeft(bookingItem),
        }
    });
    return bookingList;
};

/* Определие возможности редактирования цвета записи
* @param {String} statusCode код статуса записи
* @returns {Boolean} Можно ли менять цвет записи
*/
const getAbilityUseCustomColor = statusCode => {
    return statusCode !== 'visit_in_process' && statusCode !== 'visit_completed';
};

/**
 * Получение цвета отдельной записи
 * @param {Boolean} isEnableUseCustomColor можно ли менять цвет записи
 * @param {String} customColor пользовательский цвет записи
 * @param {String} statusCode код статуса записи
 * @returns {String} Значение цвета записи
 */
const getBookingColor = (isEnableUseCustomColor, customColor, statusCode) => {
    if (isEnableUseCustomColor && customColor) return customColor;

    return bookingTypesObj[statusCode];
};

/**
 * Модификация полученных от сервера данных о записи
 * @param {Object} bookingData данные о записи
 * @returns {Object} Модифицированные данные о записи
 */
const modifyResponseBookingData = bookingData => {
    let startDateISO = parse(bookingData.bookingDateStart, 'yyyy-MM-dd HH:mm:ss', new Date());

    return {
        startDateISO,
        endDateISO: addMinutes(startDateISO, bookingData.duration),
        duration: +bookingData.duration,
        statusCode: bookingData.statusCode,
        flags: {
            needCall: !!bookingData.needCall,
        },
    };
};

/**
 * Подготовка данных для запроса добавления нового клиента
 * @param {Object} customerData параметры фильтрации
 * @returns {Object} Подготовленные данные для запроса
 */
const prepareAddCustomerRequestData = customerData => {
    return {
        customer: {
            secondName: customerData.secondName,
            firstName: customerData.firstName,
            patronymic: customerData.patronymic,
            sex: customerData.sex || 'unknown',
            phone: customerData.phone.replace(/[^\d]/g, ''),
            email: customerData.email,
        }
    }
};

/**
 * Получение массива опций часов для выбора длительности записи
 * @param {Number} maxBookingDuration Максимальная длительность записи
 * @returns {Array} Массив опций часов для выбора длительности записи
 */
const getDurationHoursOptions = maxBookingDuration => {
    let resultArr = [];

    let id = 0;

    for (let i = 0; (i * 60) <= maxBookingDuration; i += 1) {
        resultArr.push({
            id,
            title: `${i}`,
            duration: i * 60,
        });
        id++;
    }

    return resultArr;

};

/**
 * Получение массива опций минут для выбора длительности записи
 * @param {Number} intervalStep шаг интервала записи
 * @returns {Array} Массив опций минут для выбора длительности записи
 */
const getDurationMinutesOptions = intervalStep => {
    let resultArr = [];
    let id = 0;

    for (let i = 0; i < 60; i += intervalStep) {
        resultArr.push({
            id,
            title: `${i}`,
            duration: i,
        });
        id++;
    }

    return resultArr;
};

/**
 * Получение массива опций для input range длительности записи
 * @param {Number} maxBookingDuration Максимальная длительность записи
 * @param {Number} intervalStep шаг интервала записи
 * @returns {Array} Массив опций
 */
const getTimeLineDatalistOptions = (maxBookingDuration, intervalStep) => {
    let resultArr = [];

    for (let i = 0; i <= maxBookingDuration; i += intervalStep) {
        resultArr.push({
            value: i,
            label: i % 60 ? null : i / 60,
        });
    }

    return resultArr;
};
/**
 * Форматирвоание времени на основе общего количества минут
 * @param {Number} duration общее количество минут
 * @returns {String} Форматированная строка времени
 */
const getFormattedTimeStringByMinutes = duration => {
    const hours = Math.floor(duration / 60);
    const minutes = duration - hours * 60;
    const resultStr = `${hours ? hours + ' ч.' : ''} ${minutes ? minutes + ' мин.' : ''}`;

    return resultStr.trim() ? resultStr : '0 мин.';
};
/**
 * Сортировка услуг по стоимости
 * @param {Object} a
 * @param {Object} b
 * @param {String} title наименование услуги
 * @param {Number} goodsDiscount величина скидки
 * @returns {Number} Позиция сортировки
 */
const sortGoodsByPrice = (a, b, title, goodsDiscount) => {
    const totalSumA = a.priceMin * a.amount;
    const totalSumB = b.priceMin * b.amount;
    const priceA = totalSumA - totalSumA / 100 * goodsDiscount;
    const priceB = totalSumB - totalSumB / 100 * goodsDiscount;
    return priceB - priceA;
};
/**
 * Сортировка услуг по количеству
 * @param {Object} a
 * @param {Object} b
 * @returns {Number} Позиция сортировки
 */
const sortGoodsByAmount = (a, b) => {
    return b.amount - a.amount;
};

/**
 * Сортировка услуг по продолжительности
 * @param {Object} a
 * @param {Object} b
 * @returns {Number} Позиция сортировки
 */
const sortGoodsByDuration = (a, b) => {
    return b.amount * b.duration - a.amount * a.duration;
};

/**
 * Получение списка опций для выбора кабинетов
 * @param {Array} cabinets изначальный список кабинетов
 * @returns {Array} Массив доступных для выбора кабинетов
 */
const getAvailableCabinets = cabinets => {
    return [...[{
        id: -1,
        title: 'Не выбрано',
    }], ...cabinets];
};

/**
 * Получение списка опций для выбора аппаратов
 * @param {Array} units изначальный список аппаратов
 * @param {Boolean} isUnitBinding включена ли привязка аппартов к услугам
 * @param {Array} selectedServices список выбранных услуг
 * @returns {Array} Массив доступных аппаратов
 */
const getAvailableUnits = (units, isUnitBinding, selectedServices)  => {
    const getFilteredUnits = () => {
        if (isUnitBinding && selectedServices.length) {

            let intersectionId = [];

            selectedServices.forEach(service => {
                if (service.unitList.length) {
                    let serviceUnitsId = service.unitList.map(unit => unit.id);

                    if (intersectionId.length) {
                        intersectionId = serviceUnitsId.filter(unitId => intersectionId.includes(unitId))
                    } else {
                        intersectionId.push(...serviceUnitsId);
                    }
                }
            });
            return units.filter(unit => intersectionId.includes(unit.id));
        }
        return units;
    };

    return [...[{
        id: -1,
        title: 'Не выбрано',
    }], ...getFilteredUnits()];
};

/**
 * Проверка на возможность добавления выбранной в дереве услуги
 * @param {Boolean} isUnitBinding включена ли привязка аппартов к услугам
 * @param {Array} serviceUnits список аппаратов добавляемой услуги
 * @param {Object} selectedUnit выбранный аппарат
 * @param {Array} availableUnits список доступных аппаратов
 * @returns {void}
 */
const checkIsEnableAddServiceByUnit = (isUnitBinding, serviceUnits, selectedUnit, availableUnits) => {
    if (!isUnitBinding || !serviceUnits.length) return;

    if (selectedUnit && !serviceUnits.map(unit => unit.id).includes(selectedUnit.id)) {
        throw new Error('К услуге не привязан выбранный аппарат');
    }

    const isUnitsNotIntersection = availableUnits.filter(unit => {
        return !!serviceUnits.find(serviceUnit => {
            return serviceUnit.id === unit.id;
        });
    }).length === 0;

    if (isUnitsNotIntersection) {
        throw new Error('Нельзя добавлять в запись услуги с разными аппаратами');
    }
};

/**
 * Получение продолжительности записи на основе длительности услуг
 * @param {Array} services список услуг записи
 * @param {Number} maxBookingDuration максимальная продолжительность записи
 * @returns {number} общая продолжительность записи в минутах
 */
const getBookingDurationByServices = (services, maxBookingDuration) => {
    const totalDuration = services.reduce((timeSum, item) => timeSum + item.duration * item.amount, 0);
    return totalDuration > maxBookingDuration ? maxBookingDuration : totalDuration;
};

/**
 * Подготовка данных для запроса сохранения записи
 * @param {Object} bookingData даннные записи
 * @param {Object} customerData даннные клиента
 * @param {Object} columnData даннные о колонке
 * @returns {Object} подготовленные для запроса данные
 */
const prepareSaveBookingRequestData = (bookingData, customerData, columnData) => {
    let preparedData = {
        customColor: bookingData.customColor,
        duration: bookingData.duration,
        id: bookingData.id,
        needCall: bookingData.flags.needCall ? 1 : 0,
        organizationStaffId: columnData.organizationStaffId,
        comment: bookingData.comment,
        bookingCustomer: customerData,
        bookingGoods: bookingData.serviceList,
        bookingDateStart: format(bookingData.startDateISO, 'yyyy-MM-dd HH:mm:ss'),
    };

    if (bookingData.unit) preparedData.bookingUnit = bookingData.unit;
    if (bookingData.cabinet) preparedData.bookingCabinet = bookingData.cabinet;

    return preparedData;
};


/**
 * Задать данные подсказки для копирования записи при открытии календаря
 * @returns {Object}
 */
const setCopyPromptData = () => {

    const settingName = 'scheduler.isShowCopyPrompt';
    let isShowPrompt = true;

    if (userVisualSettingsModule.hasValue(settingName)) {
        isShowPrompt = !!userVisualSettingsModule.getValue(settingName);
    }

    return {
        isShow: isShowPrompt,
        settingName,
        text: 'Для копирования записи нажмите на неё и удерживайте до появления контекстного меню',
    }

};

/**
 * Задать данные подсказки для вставки записи при её копировании
 * @returns {Object}
 */
const setPastePromptData = () => {
    const settingName = 'scheduler.isShowPastePrompt';
    let isShowPrompt = true;

    if (userVisualSettingsModule.hasValue(settingName)) {
        isShowPrompt = !!userVisualSettingsModule.getValue(settingName);
    }

    return {
        isShow: isShowPrompt,
        settingName,
        text: 'Для вставки записи нажмите на свободную ячейку и удерживайте её до появления контекстного меню',
    }
};

/**
 * Редирект на страницу оформления записи
 * @param {Number} bookingId id записи
 * @param {Number} customerId id клиента
 * @returns {void}
 */
const redirectToCompleteVisitPage = (bookingId, customerId) => {
    let path = '/crm/visit/list/?createVisit=true';
    path += `&customerId=${customerId}`;
    path += `&eventId=${bookingId}`;
    window.location = path;
};

/**
 * Получение даты окончания записи на основе её продолжительности
 * @param {Number} bookingDuration продолжительность записи
 * @param {Date} startDate время начала записи
 * @returns {Date} новая дата окончания записи
 */
const getBookingDateEndByDuration = (bookingDuration, startDate) => {
    const newDateEnd = addMinutes(startDate, bookingDuration);

    if (!isSameDay(newDateEnd, startDate)) {
        return set(startDate, {
            hours: 23,
            minutes: 59,
            seconds: 59,
        });
    }
    return newDateEnd;
};


export {
    getStaffWorkDaysInterval,
    getColumnsPerPageVisualSettings,
    setColumnsPerPageVisualSettings,
    getFilteredStaffList,
    getScheduleWorkDaysTemplate,
    getStaffScheduleData,
    addOneDay,
    subOneDay,
    prepareTimelineRequestData,
    modifyResponseBookingList,
    getWorkingTime,
    createIntervalsArray,
    setStaffColumnsData,
    setUnitsColumnsData,
    setCabinetsColumnsData,
    getPaginatedColumns,
    getSortedBookingList,
    getColumnBookings,
    formatCalendarTableHeadDate,
    setBookingOrder,
    setBookingsPosition,
    getAbilityUseCustomColor,
    getBookingColor,
    modifyResponseBookingData,
    prepareAddCustomerRequestData,
    getDurationHoursOptions,
    getDurationMinutesOptions,
    getTimeLineDatalistOptions,
    getFormattedTimeStringByMinutes,
    sortGoodsByPrice,
    sortGoodsByAmount,
    sortGoodsByDuration,
    getAvailableCabinets,
    getAvailableUnits,
    checkIsEnableAddServiceByUnit,
    getBookingDurationByServices,
    prepareSaveBookingRequestData,
    setCopyPromptData,
    setPastePromptData,
    redirectToCompleteVisitPage,
    getBookingDateEndByDuration,
};