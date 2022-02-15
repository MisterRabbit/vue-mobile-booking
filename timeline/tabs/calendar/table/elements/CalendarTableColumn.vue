<template>
    <div class="tl-calendar-table__column">
        <div class="tl-calendar-table__cells">
            <div class="tl-calendar-table__cell"
                 v-for="(cell, index) in columnData.timeIntervals"
                 :key="index"
                 :class="{
                    disable: !cell.isEnableBooking,
                    'disable-user-select': isDisableUserSelect(cell)
                 }"
                 :style="{height: `${tableRowHeight}px`}"
                 @touchstart="touchstart(cell)"
                 @touchmove="touchmove(cell)"
                 @touchend="touchend(cell)"
                 @touchcancel="touchcancel(cell)"
                 @click="addBooking(cell)"
            >
            </div>
        </div>
        <calendar-booking-item
            v-for="item in columnData.bookingList"
            :key="item.id"
            :booking-data="item"
            :class="{
                'disable-user-select': isDisableUserSelect(item),
             }"
            @touchstart="touchstart"
            @touchmove="touchmove"
            @touchend="touchend"
            @touchcancel="touchcancel"
        />
    </div>
</template>

<script>
    import CalendarBookingItem from './CalendarBookingItem';

    let longTouchTimerId = null;
    const LONG_TOUCH_DURATION = 600;

    export default {
        name: 'CalendarTableColumn',
        props: {
            columnData: {
                type: Object,
                required: true,
            },
            copyBookingData: {
                type: Object,
                required: true,
            },
        },
        components: {
            CalendarBookingItem,
        },
        data: () => ({
            touchedItem: {
                isCell: null,
                data: null,
            },
        }),
        inject: [
            'addBooking',
            'tableRowHeight',
            'showContextMenuModal',
        ],
        mounted() {
        },
        computed: {
        },
        methods: {
            endLongTouch() {
                if (longTouchTimerId) {
                    clearTimeout(longTouchTimerId);
                }
                this.touchedItem = {
                    type: null,
                    data: null,
                };
            },
            startLongTouch(targetData) {
                this.endLongTouch();

                this.touchedItem = {
                    isCell: 'timeISO' in targetData,
                    data: targetData,
                };

                longTouchTimerId = setTimeout(() => {
                    this.showContextMenuModal(this.touchedItem.isCell, targetData);
                }, LONG_TOUCH_DURATION)
            },
            touchstart(targetData) {
                this.startLongTouch(targetData);
            },
            touchmove(targetData) {
                this.endLongTouch(targetData);
            },
            touchend(targetData) {
                this.endLongTouch(targetData);
            },
            touchcancel(targetData) {
                this.endLongTouch(targetData);
            },
            isDisableUserSelect(targetData) {
                if (this.touchedItem.isCell === null || this.touchedItem.isCell === undefined) return;
                if (this.touchedItem.isCell) {
                    return this.touchedItem.data.timeISO === targetData.timeISO;
                }
                return this.touchedItem.data.id === targetData.id;
            },
        }
    };
</script>

<style scoped lang="less">

</style>