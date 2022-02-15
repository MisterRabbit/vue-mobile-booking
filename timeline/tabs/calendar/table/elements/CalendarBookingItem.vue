<template>
    <div
        class="tl-calendar-booking"
        :style="{
            height: bookingPosition.bookingHeight,
            top: bookingPosition.offsetFromTop,
            width: bookingPosition.bookingWidth,
            marginLeft: bookingPosition.marginLeft
        }"
        @touchstart="$emit('touchstart', bookingData)"
        @touchmove="$emit('touchmove', bookingData)"
        @touchend="$emit('touchend', bookingData)"
        @touchcancel="$emit('touchcancel', bookingData)"
        @click="openBooking(bookingData)"
    >
        <div
            class="tl-calendar-booking__inner"
            :style="{backgroundColor: bookingColor}"
        >
            <div class="tl-calendar-booking__header">
                <div class="tl-calendar-booking__header-info">
                    <span class="tl-calendar-booking__time">
                        {{ bookingTime }}
                    </span>
                    <span class="tl-calendar-booking__icon" v-if="bookingData.flags.newClient">
                        <icon-new-customer/>
                    </span>
                    <span class="tl-calendar-booking__icon" v-if="bookingData.flags.needCall">
                        <icon-need-call/>
                    </span>
                </div>
            </div>
            <div class="tl-calendar-booking__body">
                <p class="tl-calendar-booking__fio">{{ customerFio }}</p>
                <input
                    v-if="bookingData.phone"
                    v-mask="getPhoneMask"
                    :value="bookingData.phone"
                    class="tl-calendar-booking__phone"
                    disabled="disabled"
                    type="tel"
                />
                <p class="tl-calendar-booking__comment" v-if="bookingData.comment">{{ bookingData.comment }}</p>
                <ul class="tl-calendar-booking__services" v-if="isBookingHasServices">
                    <li
                        v-for="service in bookingData.serviceList"
                        :key="service.service"
                        class="tl-calendar-booking__services-item"
                    >
                        {{ service.goodName }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    import {
        getAbilityUseCustomColor,
        getBookingColor,
    } from '../../../../services/timeline-services';
    import { mask } from 'vue-the-mask';
    import {getIntervalLimits} from '../../../../../../../../utils/date-format';
    import {convertPhoneMask} from '../../../../../../../../utils/base-utils';
    import IconNewCustomer from '../../../../../../../../assets/img/icons/modules/timeline/new-customer.svg';
    import IconNeedCall from '../../../../../../../../assets/img/icons/modules/timeline/need-call.svg';

    export default {
        name: 'CalendarBookingItem',
        props: {
            bookingData: {
                type: Object,
                required: true,
            },
        },
        components: {
            IconNewCustomer,
            IconNeedCall,
        },
        data: () => ({
        }),
        directives: {
            mask: (el, binding) => {
                if (!binding.value) {
                    return;
                }
                mask(el, binding);
            }
        },
        inject: [
            'organizationInfo',
            'intervalStep',
            'openBooking',
            'tableRowHeight'
        ],
        mounted() {
        },
        computed: {
            bookingPosition() {
                return {
                    bookingHeight: `${(Math.ceil(this.bookingData.duration / this.intervalStep))  * this.tableRowHeight}px`,
                    offsetFromTop: `${this.bookingData.position.offsetFromTop}px`,
                    marginLeft: `${this.bookingData.position.marginLeft}%`,
                    bookingWidth: `${this.bookingData.position.width}%`,
                }
            },
            bookingTime() {
                return getIntervalLimits(this.bookingData.startDateISO, this.bookingData.endDateISO);
            },
            bookingColor() {
                let statusCode = this.bookingData.statusCode;
                return getBookingColor(getAbilityUseCustomColor(statusCode), this.bookingData.customColor, statusCode);
            },
            getPhoneMask() {
                if (!this.organizationInfo.usePhoneMask) return '';
                let { phoneMask } = this.organizationInfo;
                if (phoneMask) {
                    return convertPhoneMask(phoneMask);
                }
                return '8 (xxx) xxx xx-xx';
            },
            customerFio() {
                return `${this.bookingData.firstName} ${this.bookingData.secondName} ${this.bookingData.patronymic}`;
            },
            isBookingHasServices() {
                return this.bookingData.serviceList && this.bookingData.serviceList.length;
            },
        },
        methods: {
        }
    };
</script>

<style scoped lang="less">

</style>