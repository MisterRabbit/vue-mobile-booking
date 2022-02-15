<template>
    <div class="tl-calendar-date">
        <button
            class="btn tl-calendar-date__button tl-calendar-date__button--prev"
            @click="prevDay"
        >
        </button>
        <div class="tl-calendar-date__control">
            <input
                v-model="selectedDate"
                type="date"
                class="tl-calendar-date__input"
                @change="changeDate"
            >
            <div class="tl-calendar-date__value">
                <span>
                    {{ formattedDate }}
                </span>
            </div>
        </div>
        <button
            class="btn tl-calendar-date__button tl-calendar-date__button--next"
            @click="nextDay"
        >
        </button>
    </div>
</template>

<script>
    import {formatDate} from '../../../../../../../../utils/date-format';
    import {addOneDay, subOneDay} from '../../../../services/timeline-services';

    export default {
        name: 'CalendarDateSelect',
        props: {},
        components: {
        },
        data: () => ({
            selectedDate: formatDate(new Date(), 'yyyy-MM-dd'),
        }),
        inject: [
            'updateSelectedDate',
        ],
        mounted() {
        },
        computed: {
            formattedDate() {
                return formatDate(this.selectedDate, 'EEEEEE — dd.MM.yyyy');
            },
        },
        methods: {
            prevDay() {
                this.selectedDate = subOneDay(this.selectedDate);
                this.changeDate();
            },
            nextDay() {
                this.selectedDate = addOneDay(this.selectedDate);
                this.changeDate();
            },
            changeDate() {
                this.updateSelectedDate(this.selectedDate);
            },
        }
    };
</script>

<style scoped lang="less">

</style>