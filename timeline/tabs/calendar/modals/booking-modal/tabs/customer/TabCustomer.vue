<template>
    <div class="tl-booking-modal-panel">
        <div class="tl-booking-modal-panel__header">
            <h6 class="tl-booking-modal-panel__title">Клиент</h6>
        </div>
        <div class="tl-booking-modal-panel__content">
            <vue-select
                label="fio"
                name="customer-list"
                required
                v-model="selectedCustomer"
                :options="customerList"
                :searchable="true"
                :clearable="false"
                placeholder="Поиск"
                :is-debounce-search="true"
                @input="selectCustomer"
                @search="getCustomerList"
            />
            <customer-card
                :customer-data="customerData"
                :discount-card="discountCard"
            />
        </div>
        <div class="tl-booking-modal-panel-accordion">
            <a class="tl-booking-modal-panel-accordion__header" role="button" data-toggle="collapse" href="#collapseBooking" aria-expanded="true" aria-controls="collapseBooking">
                <h6>Запись</h6>
                <button class="button">
                    <icon-arrow/>
                </button>
            </a>
            <div class="collapse in" id="collapseBooking" aria-expanded="true">
                <div class="tl-booking-modal-panel-accordion__body">
                    <booking-duration
                        :booking-data="bookingData"
                        :is-duration-exceeds-work-time="isDurationExceedsWorkTime"
                    />
                    <div class="form-group">
                        <label class="active">Дополнительно</label>
                        <toggle-checkbox
                            v-model="needCallStatus"
                            :value-false="false"
                            :value-true="true"
                            sync="true"
                            @input="changeNeedCallFlag"
                        />
                        <div class="label-toggle">
                            <span>Позвонить клиенту</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="tl-booking-modal-panel-accordion">
            <a class="tl-booking-modal-panel-accordion__header collapsed" role="button" data-toggle="collapse" href="#collapseComment" aria-expanded="false" aria-controls="collapseBooking">
                <h6>Комментарий</h6>
                <button class="button">
                    <icon-arrow/>
                </button>
            </a>
            <div class="collapse" id="collapseComment" aria-expanded="false">
                <div class="tl-booking-modal-panel-accordion__body">
                    <textarea
                        class="textarea"
                        v-model="comment"
                        @input="updateComment"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import VueSelect from '../../../../../../../elements/VueSelect';
    import CustomerCard from './CustomerCard';
    import BookingDuration from './BookingDuration';
    import ToggleCheckbox from '../../../../../../../../../components/elements/ToggleCheckbox';
    import timelineRepository from '../../../../../../../../../../repository/timeline-repository';
    import IconArrow from '../../../../../../../../../../assets/img/icons/common/arrows/simple-arrow-top.svg?inline';

    export default {
        name: 'TabCustomer',
        props: {
            discountCard: {
                type: Object,
                required: true,
            },
            bookingData: {
                type: Object,
                required: true,
            },
            customerData: {
                type: Object,
                required: true,
            },
            isDurationExceedsWorkTime: {
                type: Boolean,
                required: true,
            },
        },
        components: {
            VueSelect,
            CustomerCard,
            BookingDuration,
            ToggleCheckbox,
            IconArrow,
        },
        inject: [
            'getCustomerData',
        ],
        data: () => ({
            customerList: [],
            selectedCustomer: null,
            needCallStatus: false,
            comment: ''
        }),
        mounted() {
            this.updateSelectedCustomer();
            this.comment = this.bookingData.comment;
        },
        computed: {
        },
        methods: {
            async getCustomerList(searchStr) {
                this.customerList = searchStr && searchStr.length > 1 ? await timelineRepository.searchCustomer(searchStr) : [];
            },
            updateSelectedCustomer() {
                if (this.customerData.id !== -1) {
                    const isCustomerAlreadyInList = this.customerList.some(customer => customer.id === this.customerData.id);
                    if (!isCustomerAlreadyInList) {
                        this.customerList.push({
                            id: this.customerData.id,
                            fio: this.customerData.fio,
                        });
                    }
                    this.selectedCustomer = this.customerData.id;
                } else {
                    this.selectedCustomer = null;
                }
            },
            selectCustomer(customerId) {
                if (customerId === this.customerData.id) return;
                if (customerId) this.getCustomerData(customerId);
            },
            updateComment() {
                this.$emit('update-comment', this.comment);
            },
            changeNeedCallFlag() {
                this.$emit('change-need-call-flag', this.needCallStatus);
            },
        },
        watch: {
            'customerData.id'() {
                this.updateSelectedCustomer();
            },
            'bookingData.flags.needCall': {
                immediate: true,
                deep: false,
                handler () {
                    this.needCallStatus = this.bookingData.flags.needCall;
                },
            },
        }
    };
</script>

<style scoped lang="less">

</style>