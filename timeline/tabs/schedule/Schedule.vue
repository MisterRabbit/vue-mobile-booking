<template>
    <div>
        <list-options-bar
            :is-visible-filter="isVisibleFilter"
            :is-show-add-button="false"
            element-name="schedule-filter"
            @change-filter-visibility="changeFilterVisibility"
            @update-search-str="updateFilterStr"
        >
            <template #filter>
                <schedule-filter
                    :default-dates="defaultDates"
                    @apply-filter="applyFilters"
                />
            </template>
        </list-options-bar>
            <preloader
                v-if="isShowPreloader"
                type="white"
                size="full"
            />
            <schedule-table
                :filtered-staff-list="filteredStaffList"
                :staff-schedule-data="staffScheduleData"
                :work-days-template="workDaysTemplate"
            />
    </div>
</template>

<script>
    import ListOptionsBar from '../../../layout/parts/ListOptionsBar';
    import ScheduleFilter from './ScheduleFilter';
    import ScheduleTable from './ScheduleTable';
    import timelineRepository from '../../../../../../repository/timeline-repository';
    import Preloader from '../../../../../components/elements/preloader';
    import {sortAsc} from '../../../../../../utils/sort';
    import toastr from 'toastr';
    import {
        getFilteredStaffList,
        getStaffWorkDaysInterval,
        getStaffScheduleData,
        getScheduleWorkDaysTemplate
    } from '../../services/timeline-services';

    const defaultDates = getStaffWorkDaysInterval();

    export default {
        name: 'Schedule',
        props: {
        },
        components: {
            ListOptionsBar,
            ScheduleFilter,
            ScheduleTable,
            Preloader,
        },
        data: () => ({
            defaultDates,
            isVisibleFilter: false,
            isShowPreloader: false,
            isWorkDaysDataLoaded: false,
            filters: {
                searchStr: '',
                dateStart: defaultDates.dateStart,
                dateEnd: defaultDates.dateEnd,
                positionId: null,
            },
            staffList: [],
            staffWorkDays: [],
        }),
        mounted() {
            this.getWorkingStaffList();
            this.getWorkDays();
        },
        computed: {
            staffScheduleData() {
                return getStaffScheduleData(this.staffList, this.staffWorkDays);
            },
            filteredStaffList() {
                return getFilteredStaffList(this.staffList, this.filters.searchStr, this.filters.positionId);
            },
            workDaysTemplate() {
                return getScheduleWorkDaysTemplate(this.filters.dateStart, this.filters.dateEnd);
            },
        },
        methods: {
            async getWorkingStaffList() {
                this.staffList = (await timelineRepository.getWorkingStaffList()).sort((a,b) => sortAsc(a, b, 'fio'));
            },
            async getWorkDays() {
                const dataRange = {
                    dateStart: this.filters.dateStart,
                    dateEnd: this.filters.dateEnd,
                };
                this.isShowPreloader = true;
                try {
                    this.staffWorkDays = await timelineRepository.getStaffWorkDays(dataRange);
                } catch (e) {
                    toastr.error(e.message);
                } finally {
                    this.isShowPreloader = false;
                }
            },
            changeFilterVisibility(newVisibilityStatus) {
                this.isVisibleFilter = newVisibilityStatus;
            },
            updateFilterStr(val) {
                this.filters.searchStr = val;
            },
            applyFilters(newFilterData) {
                const isDateStartWasChanged = this.defaultDates.dateStart !== this.filters.dateStart;
                const isDateEndWasChanged = this.defaultDates.dateEnd !== this.filters.dateEnd;
                const isDatesWasChanged = isDateStartWasChanged || isDateEndWasChanged;

                this.filters = {...this.filters, ...newFilterData};

                if (isDatesWasChanged) this.getWorkDays();

                this.changeFilterVisibility(!this.isVisibleFilter);
            },
        }
    };
</script>

<style scoped lang="less">
</style>