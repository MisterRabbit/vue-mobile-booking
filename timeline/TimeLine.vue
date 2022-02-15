<template>
    <div class="tl-page">
        <div class="portlet">
            <calendar
                v-show="isActiveCalendarTab"
                :unit-list="unitList"
                :cabinet-list="cabinetList"
                :is-active-calendar-tab="isActiveCalendarTab"
            />
            <schedule
                v-show="!isActiveCalendarTab"
            />
        </div>
        <bottom-nav-panel
            :tab-list="tabs"
            :active-tab="activeTab"
            @change-active-tab="changeActiveTab"
        />
    </div>
</template>

<script>
    import Calendar from './tabs/calendar/Calendar';
    import Schedule from './tabs/schedule/Schedule';
    import BottomNavPanel from '../layout/parts/BottomNavPanel';
    import timelineRepository from '../../../../repository/timeline-repository';
    import {sortAsc} from '../../../../utils/sort';

    const tabs = [
        {
            id: 'calendar',
            title: 'Записи клиентов',
        },
        {
            id: 'schedule',
            title: 'График работы',
        },
    ];

    export default {
        name: 'TimeLine',
        props: {},
        components: {
            Calendar,
            Schedule,
            BottomNavPanel,
        },
        data: () => ({
            tabs,
            organizationInfo: appData.organizationInfo,
            staffList: appData.staffList.sort((a, b) => sortAsc(a, b, 'FIO')),
            positionList: appData.positionList.sort(sortAsc),
            subdivisionList: appData.subdivisionList.sort(sortAsc),
            isDisableBookingDelete: !!appData.isDisableBookingDelete,
            unitList: [],
            cabinetList: [],
            activeTab: 'calendar',
        }),
        provide() {
            return {
                staffList: this.staffList,
                positionList: this.positionList,
                subdivisionList: this.subdivisionList,
                organizationInfo: this.organizationInfo,
                isDisableBookingDelete: this.isDisableBookingDelete,
                currencyShortTitle: this.organizationInfo.currencyShortTitle,
            }
        },
        mounted() {
            appData = null; // clear for garbage collector
            this.getUnitList();
            this.getCabinetList();
        },
        computed: {
            isActiveCalendarTab() {
                return this.activeTab === 'calendar';
            },
        },
        methods: {
            async getUnitList() {
                this.unitList = await timelineRepository.getUnitList();
            },
            async getCabinetList() {
                this.cabinetList = await timelineRepository.getCabinetList();
            },
            changeActiveTab(tabId) {
                this.activeTab = tabId;
                window.scrollTo({
                    top: 0,
                });
            },
        }
    };
</script>

<style lang="less">
    @import '../../../../less/variables';
    @import '../../../../less/modules/timeline/mobile-timeline';
    @import '../../../../less/elements/mobile/form-element-style';
    @import '../../../../less/elements/form';
    @import '../../../../less/elements/button';
    @import '../../../../less/elements/radio-button-style';

    /** Reset layout styles **/
    .page-content-title {
        margin: 25px 0 15px;
        padding: 15px 0 !important;
        background-color: white;
        color: @font-header !important;
        font-family: @font-semiBold !important;
    }
    .page-footer {
        padding-bottom: 65px !important;
    }
    .page-content-inner {
        padding: 0 !important;
    }
    .portlet {
        padding: 15px;
        margin-bottom: 0;
    }
    /** Reset layout styles end**/
</style>

<style scoped lang="less">
    @import '../../../../less/variables';
</style>