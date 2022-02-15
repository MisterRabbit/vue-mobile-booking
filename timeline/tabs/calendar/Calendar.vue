<template>
    <div>
        <preloader
            v-if="isShowPreloader"
            class="tl-calendar-preloader"
            type="white"
        />
        <calendar-header
            :active-table-type="activeTableType"
            :pagination="pagination"
            :total-columns-count="activeTableColumns.length"
            @change-columns-per-page="changeColumnsPerPage"
            @update-filters="updateFilters"
        />
        <calendar-table
            :active-table-type="activeTableType"
            :current-time="currentTime"
            :time-intervals="timeIntervals"
            :working-time="workingTime"
            :selected-date="selectedDate"
            :pagination="pagination"
            :copy-booking-data="copyBookingData"
            :total-columns-count="activeTableColumns.length"
            :columns="filledPaginatedColumns"
        />
        <calendar-footer v-if="activeTableColumns.length"/>
        <transition name="slide-fade-right">
            <booking-modal
                v-if="bookingModal.isShow"
                :is-copy="bookingModal.isCopy"
                :init-booking-data="bookingModal.bookingData"
                :column-data="bookingModal.columnData"
                :goods-list="bookingModal.goodsList"
                :unit-list="unitList"
                :cabinet-list="cabinetList"
                :card-types-list="bookingModal.cardTypes"
                :is-goods-list-loaded="bookingModal.isGoodsListLoaded"
                :is-card-types-loaded="bookingModal.isCardTypesLoaded"
                @delete-booking="deleteBooking"
                @copy-booking="copyBooking"
                @save-booking="saveBooking"
                @close-modal-window="closeBookingModal"
            />
        </transition>
        <transition name="slide-fade-bottom">
            <prompt-modal
                v-if="promptData.isShow"
                :is-save-settings="true"
                :setting-name="promptData.settingName"
                :prompt-text="promptData.text"
                @hide-prompt="hidePromptModal"
            />
        </transition>
        <transition name="slide-fade-bottom">
            <context-menu-modal
                v-if="contextMenuModal.isShow"
                :option-list="contextMenuModal.optionList"
                @context-menu-action="contextMenuAction"
                @close-modal="closeContextMenuModal"
            />
        </transition>
        <transition name="slide-fade-bottom">
            <modal-window-confirm
                v-if="isShowConfirmCompleteModal"
                query-text="Офорить визит?"
                type="info"
                button-caption-success="Оформить"
                @success="completeBooking"
                @cancel="hideConfirmModal"
            />
        </transition>
        <transition name="slide-fade-bottom">
            <modal-window-confirm
                v-if="isShowConfirmDeleteModal"
                query-text="Удалить запись?"
                button-caption-success="Удалить"
                @success="sendDeleteBookingRequest"
                @cancel="hideConfirmModal"
            />
        </transition>
    </div>
</template>

<script>
    import CalendarHeader from './header/CalendarHeader';
    import CalendarTable from './table/CalendarTable';
    import CalendarFooter from './footer/CalendarFooter';
    import BookingModal from './modals/booking-modal/BookingModal';
    import PromptModal from '../../../modules/modal-window/PromptModal';
    import ContextMenuModal from '../../../modules/modal-window/ContextMenuModal';
    import ModalWindowConfirm from '../../../modules/modal-window/modal-window-confirm';

    import timelineRepository from '../../../../../../repository/timeline-repository';
    import Preloader from '../../../../../components/elements/preloader';
    import {formatDate} from '../../../../../../utils/date-format';
    import {cloneDeep} from 'lodash';
    import { enablePageScroll } from 'scroll-lock';
    import toastr from 'toastr';
    import {
        getColumnsPerPageVisualSettings,
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
        setBookingOrder,
        setBookingsPosition,
        setCopyPromptData,
        setPastePromptData,
        redirectToCompleteVisitPage,
    } from '../../services/timeline-services';

    import {
        addMinutes,
    } from 'date-fns';

    const UPDATE_TIMELINE_PERIOD = 30000;
    const INTERVAL_STEP = 15;
    const TABLE_ROW_HEIGHT = 55;
    const MAX_BOOKING_DURATION = 300;
    let updateTimelineTimerId = null;
    let isMissedUpdateTimelineData = false;

    export default {
        name: 'Calendar',
        props: {
            isActiveCalendarTab: {
                type: Boolean,
                required: true,
            },
            unitList: {
                type: Array,
                required: true,
            },
            cabinetList: {
                type: Array,
                required: true,
            },
        },
        components: {
            CalendarHeader,
            CalendarTable,
            CalendarFooter,
            Preloader,
            BookingModal,
            PromptModal,
            ContextMenuModal,
            ModalWindowConfirm,
        },
        data: () => ({
            selectedDate: formatDate(new Date(), 'yyyy-MM-dd'),
            currentTime: formatDate(new Date(), 'HH:mm'),
            activeTableType: 'staff',
            isShowPreloader: false,
            filters: {
                positionId: null,
                staffId: null,
                subdivisionId: null,
                customerId: null,
            },
            pagination: {
                currentPage: 1,
                columnsPerPage: getColumnsPerPageVisualSettings(),
            },
            bookingList: [],
            timeIntervals: [],
            workingTime: {
                start: 8,
                end: 21,
            },
            staffColumnsData: [],
            bookingModal: {
                isShow: false,
                isCopy: false,
                columnData: {},
                bookingData: {
                    id: -1,
                },
                goodsList: [],
                cardTypes: [],
                isGoodsListLoaded: false,
                isCardTypesLoaded: false,
            },
            promptData: {
                isShow: false,
                settingName: '',
                text: ''
            },
            contextMenuModal: {
                isShow: false,
                optionList: [],
                targetData: {},
            },
            copyBookingData: {
                id: -1,
            },
            isShowConfirmCompleteModal: false,
            isShowConfirmDeleteModal: false,

        }),
        provide() {
            return {
                updateSelectedDate: this.updateSelectedDate,
                changeTableType: this.changeTableType,
                changeCurrentPage: this.changeCurrentPage,
                addBooking: this.addBooking,
                openBooking: this.openBooking,
                showContextMenuModal: this.showContextMenuModal,
                intervalStep: INTERVAL_STEP,
                tableRowHeight: TABLE_ROW_HEIGHT,
                maxBookingDuration: MAX_BOOKING_DURATION,
            }
        },
        inject: [
            'organizationInfo',
            'isDisableBookingDelete',
        ],
        mounted() {
            this.getTimeLineData();
            this.promptData = setCopyPromptData();
        },
        beforeDestroy() {
            this.removeUpdateTimelineDataTimer();
        },
        computed: {
            activeTableColumns() {
                const columnsDataType = {
                    staff: this.staffColumnsData,
                    units: this.unitsColumnsData,
                    cabinets: this.cabinetsColumnsData,
                };
                return columnsDataType[this.activeTableType];
            },
            paginatedColumns() {
                return getPaginatedColumns(this.activeTableColumns, this.pagination);
            },
            filledPaginatedColumns() {
                const newColumnsData = cloneDeep(this.paginatedColumns);
                const sortedBookingList = getSortedBookingList(this.activeTableType, this.bookingList);

                if (Object.keys(sortedBookingList).length === 0) return newColumnsData;

                newColumnsData.forEach(column => {
                    let columnsBookings = getColumnBookings(this.activeTableType, sortedBookingList, column);
                    if (!columnsBookings.length) return;

                    let orderedBookings = setBookingOrder(columnsBookings);
                    column.bookingList = setBookingsPosition(orderedBookings, column, this.workingTime, INTERVAL_STEP, TABLE_ROW_HEIGHT);
                });

                return newColumnsData;
            },
            unitsColumnsData() {
                return setUnitsColumnsData(this.unitList, this.timeIntervals);
            },
            cabinetsColumnsData() {
                if (this.organizationInfo.modeType === 'crm') {
                    return setCabinetsColumnsData(this.cabinetList, this.timeIntervals);
                }
                return [];
            },
            isDisableUpdateTimelineData() {
                return !this.isActiveCalendarTab || this.bookingModal.isShow;
            },
        },
        methods: {
            async getTimeLineData(backgroundMode) {
                this.currentTime = formatDate(new Date(), 'HH:mm');

                this.removeUpdateTimelineDataTimer();

                if (this.isDisableUpdateTimelineData) {
                    this.setUpdateTimelineDataTimer();
                    isMissedUpdateTimelineData = true;
                    return;
                }
                isMissedUpdateTimelineData = false;

                if (!backgroundMode) this.isShowPreloader = true;
                const requestData = prepareTimelineRequestData(this.selectedDate, this.filters);

                try {
                    let response = await timelineRepository.getTimelineData(requestData);

                    this.bookingList = modifyResponseBookingList(response.bookingList);
                    this.workingTime = getWorkingTime(this.selectedDate, response.columnsList, this.organizationInfo);
                    this.timeIntervals = createIntervalsArray(this.workingTime, INTERVAL_STEP);
                    this.staffColumnsData = setStaffColumnsData(response.columnsList, this.timeIntervals);
                } catch (e) {
                    toastr.error(e.message);
                } finally {
                    this.isShowPreloader = false;
                    this.setUpdateTimelineDataTimer();
                }
            },
            setUpdateTimelineDataTimer() {
                updateTimelineTimerId = setInterval(() => {
                    this.getTimeLineData(true);
                }, UPDATE_TIMELINE_PERIOD);
            },
            removeUpdateTimelineDataTimer() {
                if (updateTimelineTimerId) clearInterval(updateTimelineTimerId);
            },
            updateSelectedDate(newDate) {
                this.selectedDate = newDate;
                this.changeCurrentPage();
                this.getTimeLineData();
            },
            changeTableType(newType) {
                this.activeTableType = newType;
                this.changeCurrentPage();
            },
            changeColumnsPerPage(newColumnsPerPage) {
                this.pagination.columnsPerPage = newColumnsPerPage;
                this.changeCurrentPage();
            },
            updateFilters(newFilterData) {
                this.filters = newFilterData;
                this.changeCurrentPage();
                this.getTimeLineData();
            },
            changeCurrentPage(pageNumber) {
                this.pagination.currentPage = pageNumber || 1;
            },
            async getGoodsList() {
                try {
                    let goods = await timelineRepository.getGoodsList();
                    goods.forEach(item => {
                        if (item.type === 'folder') item.children = [];
                    });
                    this.bookingModal.goodsList = goods;
                    this.bookingModal.isGoodsListLoaded = true;
                } catch (e) {}
            },
            async getCardTypesList() {
                try {
                    this.bookingModal.cardTypes = await timelineRepository.getCardTypes();
                    this.bookingModal.isCardTypesLoaded = true;
                } catch (e) {}
            },
            addBooking(cellData) {
                this.bookingModal.bookingData.startDateISO = cellData.timeISO;
                this.bookingModal.bookingData.endDateISO = addMinutes(cellData.timeISO, INTERVAL_STEP);
                this.openBookingModal(cellData.columnId);
            },
            openBooking(bookingData) {
                this.bookingModal.bookingData = bookingData;
                this.openBookingModal(bookingData.columnId);
            },
            openBookingModal(columnId) {
                this.hidePromptModal();
                this.bookingModal.columnData = this.staffColumnsData.find(staffColumn => staffColumn.columnId === columnId);
                this.bookingModal.isShow = true;
                if (!this.bookingModal.isGoodsListLoaded) this.getGoodsList();
                if (!this.bookingModal.isCardTypesLoaded) this.getCardTypesList();
            },
            closeBookingModal() {
                this.bookingModal.isShow = false;
                this.bookingModal.isCopy = false;
                this.bookingModal.columnData = {};
                this.bookingModal.bookingData = {
                    id: -1,
                };
                enablePageScroll();
                if (isMissedUpdateTimelineData) this.getTimeLineData(true)
            },
            deleteBooking(bookingId) {
                this.bookingList = this.bookingList.filter(bookingItem => bookingItem.id !== bookingId);
                toastr.success('Запись удалена');
                this.closeBookingModal();
            },
            saveBooking(bookingData, isNewBooking) {
                if (isNewBooking) {
                    isMissedUpdateTimelineData = false;
                    this.getTimeLineData();
                } else {
                    this.bookingList = this.bookingList.filter(booking => booking.id !== bookingData.id);
                    this.bookingList.push(bookingData);
                }
                this.closeBookingModal();
            },
            hidePromptModal() {
                this.promptData.isShow = false;
            },
            showContextMenuModal(isCell, targetData) {
                if (isCell) {
                    if (this.copyBookingData.id === -1) return;
                    this.contextMenuModal.optionList = [{id: 'paste', title: 'Вставить'}];
                } else {
                    this.contextMenuModal.optionList = [
                        {id: 'copy', title: 'Копировать'},
                    ];
                    if (this.organizationInfo.modeType === 'crm' && targetData.statusCode !== 'visit_completed') {
                        this.contextMenuModal.optionList.push({id: 'complete', title: 'Оформить визит'});
                    }
                    if (!this.isDisableBookingDelete) {
                        this.contextMenuModal.optionList.push({id: 'delete', title: 'Удалить'});
                    }
                }
                this.contextMenuModal.targetData = cloneDeep(targetData);
                this.contextMenuModal.isShow = true;
            },
            closeContextMenuModal() {
                this.contextMenuModal.isShow = false;
                this.contextMenuModal.optionList = [];
            },
            async copyBooking(bookingData, customerId) {
                this.copyBookingData = cloneDeep(bookingData);
                if (customerId) {
                    this.copyBookingData.customerId = customerId;
                } else {
                    let response =  await timelineRepository.setBookingData(this.copyBookingData.id);
                    this.copyBookingData.customerId = response.bookingCustomer.id;
                }
                this.promptData = setPastePromptData();
            },
            pasteBooking(cellData) {
                let clonedCellData = cloneDeep(cellData);
                let clonedBookingData = cloneDeep(this.copyBookingData);

                clonedBookingData.columnId = clonedCellData.columnId;
                clonedBookingData.startDateISO = clonedCellData.timeISO;
                clonedBookingData.endDateISO = addMinutes(clonedCellData.timeISO, clonedBookingData.duration);
                this.bookingModal.isCopy = true;

                this.openBooking(clonedBookingData);
            },
            async completeBooking() {
                let clonedBookingData = cloneDeep(this.contextMenuModal.targetData);
                this.hideConfirmModal();
                let bookingData = await timelineRepository.setBookingData(clonedBookingData.id);
                redirectToCompleteVisitPage(bookingData.id, bookingData.bookingCustomer.id)
            },
            async sendDeleteBookingRequest() {
                let clonedBookingData = cloneDeep(this.contextMenuModal.targetData);
                this.hideConfirmModal();
                try {
                    await timelineRepository.deleteBooking({id: clonedBookingData.id});
                    this.deleteBooking(clonedBookingData.id);
                } catch(error) {
                    toastr.error(error.message);
                }
            },
            contextMenuAction(actionType) {
                const actionTypesFunc = {
                    paste: () => {this.pasteBooking(this.contextMenuModal.targetData)},
                    complete: () => {this.isShowConfirmCompleteModal = true;},
                    copy: () => {this.copyBooking(this.contextMenuModal.targetData)},
                    delete: () => {this.isShowConfirmDeleteModal = true;},
                };
                actionTypesFunc[actionType]();
                this.closeContextMenuModal();
            },
            hideConfirmModal() {
                this.isShowConfirmCompleteModal = false;
                this.isShowConfirmDeleteModal = false;
                this.contextMenuModal.targetData = {};
            },
        },
        watch: {
            isActiveCalendarTab(val) {
                if (val && isMissedUpdateTimelineData) this.getTimeLineData(true);
            },
        }
    };
</script>

<style scoped lang="less">

</style>