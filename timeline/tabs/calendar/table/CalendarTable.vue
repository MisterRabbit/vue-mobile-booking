<template>
    <div>
        <div
            v-if="isTableNotEmpty"
            class="tl-calendar-table"
        >
            <calendar-table-head
                :selected-date="selectedDate"
                :pagination="pagination"
                :active-table-type="activeTableType"
                :total-columns-count="totalColumnsCount"
                :columns="columns"
            />
            <div class="tl-calendar-table__columns">
                <div class="tl-calendar-timeline">
                    <div
                        class="tl-calendar-timeline__cell"
                        v-for="(cell, index) in timeIntervals"
                        :key="index"
                        :style="{height: `${tableRowHeight}px`}"
                        :class="{'tl-calendar-timeline__cell--bold': cell.isHour}"
                    >
                        <span>{{ cell.timeShort }}</span>
                    </div>
                </div>
                <calendar-table-column
                    v-for="(column, index) in columns"
                    :key="index"
                    :column-data="column"
                    :copy-booking-data="copyBookingData"
                />
                <div
                    class="tl-calendar-timeline-indicator"
                    v-if="isVisibleTimeIndicator"
                    :style="{top: timeIndicatorPosition}"
                ></div>
            </div>
        </div>
        <div class="not-data" v-else>
            Нет данных
        </div>
    </div>
</template>

<script>
    import CalendarTableHead from './elements/CalendarTableHead';
    import CalendarTableColumn from './elements/CalendarTableColumn';
    import {
        parse,
        differenceInMinutes,
        isWithinInterval,
    } from 'date-fns';

    export default {
        name: 'CalendarTable',
        props: {
            activeTableType: {
                type: String,
                required: true,
            },
            currentTime: {
                type: String,
                required: true,
            },
            timeIntervals: {
                type: Array,
                required: true,
            },
            workingTime: {
                type: Object,
                required: true,
            },
            selectedDate: {
                type: String,
                required: true,
            },
            pagination: {
                type: Object,
                required: true,
            },
            totalColumnsCount: {
                type: Number,
                required: true,
            },
            columns: {
                type: Array,
                required: true,
            },
            copyBookingData: {
                type: Object,
                required: true,
            },
        },
        components: {
            CalendarTableHead,
            CalendarTableColumn,
        },
        inject: [
            'tableRowHeight',
        ],
        data: () => ({
        }),
        mounted() {
        },
        computed: {
            isTableNotEmpty() {
                return this.totalColumnsCount !== 0;
            },
            currentDate() {
                return parse(this.currentTime, 'HH:mm', new Date(this.selectedDate));
            },
            isVisibleTimeIndicator() {
                return isWithinInterval(this.currentDate, this.workingTime);
            },
            totalMinutes() {
                return differenceInMinutes(this.workingTime.end, this.workingTime.start);
            },
            timeIndicatorPosition() {
                const columnHeight = this.timeIntervals.length * this.tableRowHeight;
                const minutesAfterStart = differenceInMinutes(this.currentDate, this.workingTime.start);
                const offsetFromTop = columnHeight / this.totalMinutes * minutesAfterStart;

                return `${offsetFromTop}px`;
            },
        },
        methods: {
        }
    };
</script>

<style scoped lang="less">

</style>