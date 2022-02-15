<template>
    <div class="tl-booking-modal-duration">
        <div class="tl-booking-modal-duration__timeline">
            <input
                v-model.number="selectedRange"
                type="range"
                min="0"
                max="300"
                :step="intervalStep"
                list="range-markers"
                class="tl-booking-modal-duration__range"
                :class="{'tl-booking-modal-duration__range--error': isDurationExceedsWorkTime}"
                @input="selectRange"
            >
            <div
                class="tl-booking-modal-duration__filled-track"
                :style="{width: filledTrackWidth}"
            >
            </div>
            <div id="range-markers" class="tl-booking-modal-duration__markers">
                <div
                    v-for="(item, index) in timeLineDataList"
                    :key="index"
                    :value="item.value"
                    :label="item.label || null"
                    class="tl-booking-modal-duration__range-option"
                >{{ item.label }}</div>
            </div>
        </div>
        <div class="tl-booking-modal-duration__warning" v-if="isDurationExceedsWorkTime">
            Время записи превышает время работы сотрудника
        </div>
        <div class="tl-booking-modal-duration__selects">
            <native-select
                class="tl-booking-modal-duration__select"
                v-model="currentHourOption"
                :is-gray-label="true"
                :options="hoursOptions"
                label="Часы, ч."
                name="hoursOptions"
                @input="selectOption"
            />
            <native-select
                class="tl-booking-modal-duration__select"
                v-model="currentMinuteOption"
                :is-gray-label="true"
                :options="minutesOptions"
                :is-disabled="isDisableSelectMinutes"
                label="Минуты, м."
                name="minutesOptions"
                @input="selectOption"
            />
        </div>
    </div>
</template>

<script>
    import NativeSelect from '../../../../../../../elements/NativeSelect';

    import {
        getDurationHoursOptions,
        getDurationMinutesOptions,
        getTimeLineDatalistOptions,
    } from '../../../../../../services/timeline-services';
    export default {
        name: 'BookingDuration',
        props: {
            bookingData: {
                type: Object,
                required: true,
            },
            isDurationExceedsWorkTime: {
                type: Boolean,
                required: true,
            },
        },
        components: {
            NativeSelect,
        },
        inject: [
            'intervalStep',
            'maxBookingDuration',
            'updateDuration',
        ],
        data() {
            return {
                hoursOptions: [],
                minutesOptions: [],
                timeLineDataList: [],
                currentHourOption: 0,
                currentMinuteOption: 0,
                selectedRange: this.intervalStep,
            }
        },
        created() {
            this.hoursOptions = getDurationHoursOptions(this.maxBookingDuration);
            this.minutesOptions = getDurationMinutesOptions(this.intervalStep);
            this.timeLineDataList = getTimeLineDatalistOptions(this.maxBookingDuration, this.intervalStep);
        },
        mounted() {
            this.setDefaultDurationData();
        },
        computed: {
            filledTrackWidth() {
                return `${this.selectedRange / (this.maxBookingDuration / 100)}%`;
            },
            isDisableSelectMinutes() {
                return this.selectedRange === this.maxBookingDuration;
            },
        },
        methods: {
            setDefaultDurationData() {
                if (this.selectedRange !== this.bookingData.duration) {
                    this.selectedRange = this.bookingData.duration;
                    this.updateSelectedValues();
                }
            },
            updateSelectedValues() {
                const hours = Math.floor(this.selectedRange / 60);
                const allMinutesInHours = hours * 60;
                const minutes = this.selectedRange - allMinutesInHours;
                this.currentHourOption = (this.hoursOptions.find(option => option.duration === allMinutesInHours)).id;
                this.currentMinuteOption = (this.minutesOptions.find(option => option.duration === minutes)).id;
            },
            getSelectedOptionDuration() {
                const allMinutesInHours = (this.hoursOptions.find(option => option.id === this.currentHourOption)).duration;
                const minutes = (this.minutesOptions.find(option => option.id === this.currentMinuteOption)).duration;
                return allMinutesInHours + minutes;
            },
            selectOption() {
                const totalDuration = this.getSelectedOptionDuration();
                if (totalDuration > this.maxBookingDuration) {
                    this.selectedRange = this.maxBookingDuration;
                    this.updateSelectedValues();
                } else {
                    this.selectedRange = totalDuration;
                }
                this.updateDuration(this.selectedRange);
            },
            selectRange() {
                this.updateSelectedValues();
                this.updateDuration(this.selectedRange);
            },
        },
        watch: {
            'bookingData.duration'() {
                this.setDefaultDurationData();
            }
        }
    };
</script>

<style scoped lang="less">

</style>