<template>
    <vue-modal
        :modal-caption="modalCaption"
        :is-show-cancel-button="isShowModalCancelButton"
        :title-success-button="modalSuccessButtonText"
        @success="saveModalData"
        @cancel="closeModalWindow"
    >
        <preloader
            v-if="isShowPreloader"
            class="tl-booking-modal-preloader"
            type="white"
        />
        <booking-sidebar
            :is-new-booking="isNewBooking"
            :column-data="columnData"
            :booking-data="bookingData"
            :customer-data="customerData"
            @copy-booking="copyBooking"
            @delete-booking="deleteBooking"
        />
        <div class="tl-booking-modal-main">
            <tab-customer
                v-if="isActiveTab('customer')"
                :discount-card="discountCard"
                :customer-data="customerData"
                :booking-data="bookingData"
                :is-duration-exceeds-work-time="isDurationExceedsWorkTime"
                @change-need-call-flag="changeNeedCallFlag"
                @update-comment="updateComment"
            />
            <tab-services
                v-if="isActiveTab('services')"
                :booking-data="bookingData"
                :goods-list="goodsList"
                :discount-card="discountCard"
                :unit-list="unitList"
                :cabinet-list="cabinetList"
            />
            <tab-history
                v-if="isActiveTab('history')"
                :changelog="changelog"
                @get-changelog="getChangelog"
            />
            <tab-change-color
                v-if="isActiveTab('change-color')"
                :booking-data="bookingData"
                @update-color="updateColor"
            />
            <tab-new-customer
                ref="newCustomerComponent"
                v-if="isActiveTab('new-customer')"
                @add-new-customer="addNewCustomer"
            />
        </div>
    </vue-modal>
</template>
<script>
    import vueModal from '../../../../../modules/modal-window/modal-window';
    import Preloader from '../../../../../../../components/elements/preloader';
    import BookingSidebar from './elements/BookingSidebar';
    import TabCustomer from './tabs/customer/TabCustomer';
    import TabServices from './tabs/services/TabServices';
    import TabHistory from './tabs/history/TabHistory';
    import TabChangeColor from './tabs/color/TabChangeColor';
    import TabNewCustomer from './tabs/new-client/TabNewCustomer';
    import timelineRepository from '../../../../../../../../repository/timeline-repository';
    import {bookingTypesObj} from '../../../../../../../../utils/dict/booking-types';
    import {
        modifyResponseBookingData,
        prepareAddCustomerRequestData,
        getBookingDurationByServices,
        prepareSaveBookingRequestData,
        getBookingDateEndByDuration,
    } from '../../../../services/timeline-services';
    import {
        addMinutes,
        isWithinInterval,
    } from 'date-fns';
    import toastr from 'toastr';
    import {cloneDeep} from 'lodash';

    export default {
        name: 'BookingModal',
        props: {
            isCopy: {
                type: Boolean,
                required: true,
            },
            columnData: {
                type: Object,
                required: true,
            },
            initBookingData: {
                type: Object,
                required: true,
            },
            goodsList: {
                type: Array,
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
            cardTypesList: {
                type: Array,
                required: true,
            },
            isGoodsListLoaded: {
                type: Boolean,
                required: true,
            },
            isCardTypesLoaded: {
                type: Boolean,
                required: true,
            },
        },
        components: {
            vueModal,
            Preloader,
            BookingSidebar,
            TabCustomer,
            TabServices,
            TabHistory,
            TabChangeColor,
            TabNewCustomer,
        },
        data() {
            return {
                isSendingRequest: false,
                isLoadedBookingData: false,
                isLoadedCustomerData: false,
                isLoadedChangeLogData: false,
                activeTab: 'customer',
                bookingData: {
                    duration: this.intervalStep,
                    statusCode: 'booking_new',
                    customColor: bookingTypesObj['booking_new'],
                    comment: '',
                    flags: {needCall: false},
                    serviceList: [],
                    cabinet: null,
                    unit: null,
                },
                customerData: {
                    id: -1,
                    cardTypeId: null,
                },
                changelog: [],
            }
        },
        provide() {
            return {
                isActiveTab: this.isActiveTab,
                changeActiveTab: this.changeActiveTab,
                getCustomerData: this.getCustomerData,
                clearCustomerData: this.clearCustomerData,
                updateDuration: this.updateDuration,
                removeBookingService: this.removeBookingService,
                updateServiceList: this.updateServiceList,
                selectUnit: this.selectUnit,
                selectCabinet: this.selectCabinet,
            }
        },
        inject: [
            'intervalStep',
            'maxBookingDuration',
        ],
        created() {
            this.bookingData = {...this.bookingData, ...cloneDeep(this.initBookingData)};
            if (this.isCopy) {
                this.bookingData.id = -1;
                this.bookingData.statusCode = 'booking_new';
            }
            this.bookingData.serviceList.forEach(goodItem => {goodItem.id = goodItem.organizationGoodId});
        },
        mounted() {
            if (this.isCopy) {
                this.getCustomerData(this.bookingData.customerId);
                this.isLoadedBookingData = true;
            } else if (this.isNewBooking) {
                this.isLoadedBookingData = true;
                this.isLoadedCustomerData = true;
            } else {
                this.getBookingData();
            }
        },
        computed: {
            isNewBooking() {
                return this.bookingData.id === -1;
            },
            modalCaption() {
                return this.isNewBooking ? 'Новая запись' : 'Редактировать запись';
            },
            isLoadedAllData() {
                return this.isGoodsListLoaded && this.isCardTypesLoaded && this.isLoadedBookingData && this.isLoadedCustomerData;
            },
            isShowPreloader() {
                return this.isSendingRequest || !this.isLoadedAllData;
            },
            discountCard() {
                return this.cardTypesList.find(card => card.id === this.customerData.cardTypeId) || {};
            },
            isActiveAddCustomerTab() {
                return this.activeTab === 'new-customer';
            },
            isShowModalCancelButton() {
                return !this.isActiveAddCustomerTab;
            },
            modalSuccessButtonText() {
                return this.isActiveAddCustomerTab ? 'Добавить нового клиента' : 'Сохранить';
            },
            isDurationExceedsWorkTime() {
                const currentWorkingInterval = this.columnData.enableIntervals.find(workingInterval => {
                    return isWithinInterval(this.bookingData.startDateISO, workingInterval)
                });
                const dateEnd = addMinutes(this.bookingData.startDateISO, this.bookingData.duration - 1);
                return !isWithinInterval(dateEnd, currentWorkingInterval);
            },
        },
        methods: {
            async getBookingData() {
                try {
                    let response = await timelineRepository.setBookingData(this.bookingData.id);
                    this.bookingData = {...this.bookingData, ...modifyResponseBookingData(response)};
                    this.getCustomerData(response.bookingCustomer.id);
                } finally {
                    this.isLoadedBookingData = true;
                }
            },
            async getCustomerData(customerId) {
                try {
                    this.customerData = await timelineRepository.getCustomerInfo(customerId);
                } finally {
                    this.isLoadedCustomerData = true;
                }
            },
            clearCustomerData() {
                this.customerData = {
                    id: -1,
                    cardTypeId: null,
                };
            },
            async addNewCustomer(newCustomerData) {
                this.isSendingRequest = true;
                try {
                    let response = await timelineRepository.addNewCustomer(prepareAddCustomerRequestData(newCustomerData));
                    this.getCustomerData(response.id);
                    this.changeActiveTab('customer');
                } catch(error) {
                    toastr.error(error.message);
                } finally {
                    this.isSendingRequest = false;
                }
            },
            async getChangelog() {
                if (this.isLoadedChangeLogData) return;

                this.isSendingRequest = true;
                try {
                    this.changelog = await timelineRepository.getBookingChangelog(this.bookingData.id);
                } finally {
                    this.isSendingRequest = false;
                    this.isLoadedChangeLogData = true;
                }
            },
            isActiveTab(tabName) {
                return this.activeTab === tabName;
            },
            changeActiveTab(tabName) {
                this.activeTab = tabName;
            },
            updateColor(newColor) {
                this.bookingData.customColor = newColor;
            },
            changeNeedCallFlag(newFlagValue) {
                this.bookingData.flags.needCall = newFlagValue;
            },
            updateComment(comment) {
                this.bookingData.comment = comment.trim();
            },
            updateDuration(duration) {
                this.bookingData.duration = duration || this.intervalStep;
                this.bookingData.endDateISO = getBookingDateEndByDuration(duration, this.bookingData.startDateISO);
            },
            removeBookingService(serviceId) {
                this.bookingData.serviceList = this.bookingData.serviceList.filter(service => service.id !== serviceId);
                this.updateDuration(getBookingDurationByServices(this.bookingData.serviceList, this.maxBookingDuration));
            },
            updateServiceList(serviceData) {
                this.removeBookingService(serviceData.id);
                this.bookingData.serviceList.push(serviceData);
                this.updateDuration(getBookingDurationByServices(this.bookingData.serviceList, this.maxBookingDuration));
            },
            copyBooking() {
                this.$emit('copy-booking', this.initBookingData);
                this.closeModalWindow();
            },
            async deleteBooking() {
                this.isSendingRequest = true;
                try {
                    await timelineRepository.deleteBooking({id: this.bookingData.id});
                    this.$emit('delete-booking', this.bookingData.id);
                } catch(error) {
                    toastr.error(error.message);
                } finally {
                    this.isSendingRequest = false;
                }
            },
            saveModalData() {
                if (this.isActiveAddCustomerTab) {
                    this.$refs.newCustomerComponent.submitForm();
                } else {
                    this.saveBooking();
                }
            },
            async saveBooking() {
                if (this.isSendingRequest) return;

                if (this.customerData.id === -1) {
                    toastr.warning('Выберите клиента');
                    this.changeActiveTab('customer');
                    return;
                }
                if (this.isDurationExceedsWorkTime) {
                    toastr.warning('Время записи превышает время работы сотрудника');
                    this.changeActiveTab('customer');
                    return;
                }

                const requestData = prepareSaveBookingRequestData(this.bookingData, this.customerData, this.columnData);

                this.isSendingRequest = true;
                try {
                    await timelineRepository.saveBooking(requestData);
                    toastr.success(`Запись успешно ${this.isNewBooking ? 'добавлена' : 'отредактирована'}`);
                    this.$emit('save-booking', this.bookingData, this.isNewBooking);
                } catch(error) {
                    toastr.error(error.message);
                } finally {
                    this.isSendingRequest = false;
                }
            },
            closeModalWindow() {
                this.$emit('close-modal-window');
            },
            selectUnit(unitId) {
                this.bookingData.unit = unitId === -1 ? null : this.unitList.find(unit => unit.id === unitId);
            },
            selectCabinet(cabinetId) {
                this.bookingData.cabinet = cabinetId === -1 ? null : this.cabinetList.find(cabinet => cabinet.id === cabinetId);
            },
        }
    };
</script>

<style scoped lang="less">

</style>