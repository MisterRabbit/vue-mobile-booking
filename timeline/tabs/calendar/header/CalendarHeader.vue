<template>
    <div>
        <calendar-nav-tabs
            :active-table-type="activeTableType"
        />
        <list-options-bar
            :is-visible-filter="isVisibleFilter"
            :is-show-add-button="false"
            :is-show-search="false"
            margin-bottom="15px"
            element-name="calendar-filter"
            @change-filter-visibility="changeFilterVisibility"
        >
            <template #filter>
                <calendar-filter
                    @apply-filter="applyFilters"
                />
            </template>
            <template #extra>
                <calendar-date-select/>
            </template>
        </list-options-bar>
        <div class="tl-calendar-columns-count" v-if="totalColumnsCount > 1">
            <span>Показывать колонок</span>
            <native-select
                class="tl-calendar-columns-count__select"
                v-model="columnsPerPage"
                :value="columnsPerPage"
                :is-show-label="false"
                :is-form-group="false"
                :options="columnsPerPageOptions"
                :is-use-not-selected-option="false"
                name="columnPerPage"
                @input="changeColumnsPerPage"
            />
        </div>
    </div>
</template>

<script>
    import CalendarNavTabs from './elements/CalendarNavTabs';
    import ListOptionsBar from '../../../../layout/parts/ListOptionsBar';
    import CalendarDateSelect from './elements/CalendarDateSelect';
    import CalendarFilter from './elements/CalendarFilter';
    import NativeSelect from '../../../../elements/NativeSelect';

    import {
        setColumnsPerPageVisualSettings,
    } from '../../../services/timeline-services';

    const columnsPerPageOptions = [
        {id: 1, title: '1'},
        {id: 2, title: '2'},
        {id: 3, title: '3'},
        {id: 4, title: '4'},
    ];

    export default {
        name: 'CalendarHeader',
        props: {
            activeTableType: {
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
        },
        components: {
            CalendarNavTabs,
            ListOptionsBar,
            CalendarDateSelect,
            CalendarFilter,
            NativeSelect,
        },
        data: () => ({
            columnsPerPageOptions,
            isVisibleFilter: false,
            columnsPerPage: null,
        }),
        created() {
            this.columnsPerPage = this.pagination.columnsPerPage;
        },
        mounted() {
        },
        computed: {
        },
        methods: {
            changeFilterVisibility(newVisibilityStatus) {
                this.isVisibleFilter = newVisibilityStatus;
            },
            applyFilters(newFilterData) {
                this.changeFilterVisibility(!this.isVisibleFilter);
                this.$emit('update-filters', newFilterData);
            },
            changeColumnsPerPage(columnsPerPage) {
                setColumnsPerPageVisualSettings(columnsPerPage);
                this.$emit('change-columns-per-page', columnsPerPage);
            },
        }
    };
</script>

<style scoped lang="less">

</style>