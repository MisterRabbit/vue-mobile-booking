<template>
    <div>
        <native-select
            v-model="filters.positionId"
            :value="filters.positionId"
            :options="positionList"
            label="Специальность"
            name="position"
        />
        <div class="form-group filter-interval">
            <label>Дата с - по</label>
            <div class="filter-interval__fields">
                <input
                    type="date"
                    class="native-date-picker filter-interval__field"
                    v-model="filters.dateStart"
                >
                <input
                    type="date"
                    class="native-date-picker filter-interval__field"
                    v-model="filters.dateEnd"
                >
            </div>
        </div>
        <div class="filter__footer">
            <button class="btn_flat btn_flat_cancel" @click.prevent="clearFilter">Сбросить</button>
            <button class="btn_flat btn_flat_approve" @click.prevent="applyFilter">Применить</button>
        </div>
    </div>
</template>

<script>
    import NativeSelect from '../../../elements/NativeSelect';

    export default {
        name: 'ScheduleFilter',
        props: {
            defaultDates: {
                type: Object,
                required: true,
            },
        },
        components: {
            NativeSelect,
        },
        data: () => ({
            filters: {
                dateStart: '',
                dateEnd: '',
                positionId: null,
            },
        }),
        inject: ['positionList'],
        mounted() {
            this.setDefaultDates();
        },
        computed: {
        },
        methods: {
            setDefaultDates() {
                this.filters.dateStart = this.defaultDates.dateStart;
                this.filters.dateEnd = this.defaultDates.dateEnd;
            },
            clearFilter() {
                this.filters.positionId = null;
                this.setDefaultDates();
                this.applyFilter();
            },
            applyFilter() {
                this.$emit('apply-filter', this.filters);
            },
        }
    };
</script>

<style scoped lang="less">

</style>