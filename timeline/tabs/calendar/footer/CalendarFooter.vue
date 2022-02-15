<template>
    <div class="tl-calendar-footer">
        <ul class="tl-calendar-footer__status-list">
            <li
                v-for="item in bookingTypesArr"
                :key="item.title"
                class="tl-calendar-footer__status-item"
            >
                <span :style="{backgroundColor: item.colorCode}"></span>
                {{ item.title }}
            </li>
        </ul>
    </div>
</template>

<script>
    import {bookingTypesArr} from '../../../../../../../utils/dict/booking-types';

    export default {
        name: 'CalendarFooter',
        data: () => ({
            bookingTypesArr,
        }),
    };
</script>