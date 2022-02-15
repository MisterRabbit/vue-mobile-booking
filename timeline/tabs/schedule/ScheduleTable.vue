<template>
    <div>
        <div v-if="isStaffListNotEmpty">
            <p class="tl-staff-count">Показано сотрудников: {{ this.filteredStaffList.length }}</p>
            <div class="tl-schedule-table">
                <div class="tl-schedule-table__header">
                    <div class="tl-schedule-table__staff-info">
                        <avatar
                            :source="currentStaffData.photoUrl"
                            :gender="currentStaffData.gender"
                        />
                        <strong>{{ currentStaffData.fio }}</strong>
                        <p>{{ currentStaffData.position }}</p>
                    </div>
                    <button
                        v-if="isShowPrevButton"
                        class="btn btn--round btn--round--left"
                        @click="prevStaff"
                    ></button>
                    <button
                        v-if="isShowNextButton"
                        class="btn btn--round btn--round--right"
                        @click="nextStaff"
                    ></button>
                </div>
                <div class="tl-schedule-table__body">
                    <div
                        v-for="(row, index) in currentScheduleData"
                        :key="index"
                        class="tl-schedule-table__row"
                    >
                        <div
                            class="tl-schedule-table__cell tl-schedule-table__cell--date"
                            :class="{'tl-schedule-table__cell--today': row.isToday}"
                        >
                            <span>{{ row.weekDay }} — {{ row.formattedDate }}</span>
                        </div>
                        <div
                            v-if="row.type"
                            class="tl-schedule-table__cell tl-schedule-table__cell--value"
                            :class="`tl-schedule-table__cell--${row.type}`"
                        >
                            <strong>{{ row.title }}</strong>
                        </div>
                        <div
                            v-else
                            class="tl-schedule-table__cell tl-schedule-table__cell--empty"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18">
                                <path d="M3.561 17.998A3.524 3.524 0 0 1 .49 16.262a3.443 3.443 0 0 1-.012-3.519l6.447-10.99a3.577 3.577 0 0 1 6.159 0l6.439 10.979a3.409 3.409 0 0 1-.008 3.5 3.551 3.551 0 0 1-3.1 1.768zM8.32 2.544L1.877 13.529a1.879 1.879 0 0 0 0 1.931 1.913 1.913 0 0 0 1.676.945h12.858a1.95 1.95 0 0 0 1.7-.965 1.873 1.873 0 0 0 .012-1.907L11.68 2.548a1.949 1.949 0 0 0-3.364 0zm.652 11.114a1.03 1.03 0 0 1 1.027-1.012 1.012 1.012 0 0 1 0 2.023 1.031 1.031 0 0 1-1.027-1.009zm.257-2.417c-.067-1.218-.138-2.413-.209-3.631-.024-.319-.043-.642-.067-.961a1.1 1.1 0 0 1 .791-1.105 1.038 1.038 0 0 1 1.19.567 1.227 1.227 0 0 1 .095.506c-.023.507-.071 1.013-.095 1.519-.043.782-.095 1.564-.138 2.347a6.53 6.53 0 0 0-.028.735.761.761 0 0 1-.767.736.753.753 0 0 1-.772-.711z" fill="#a0aab0"/>
                            </svg>
                            <strong>Не заполнено</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="not-data" v-else>
            Список сотрудников пуст
        </div>
    </div>
</template>

<script>
    import Avatar from '../../../modules/avatar/Avatar';
    import {cloneDeep} from 'lodash';

    export default {
        name: 'ScheduleTable',
        props: {
            filteredStaffList: {
                type: Array,
                required: true,
            },
            staffScheduleData: {
                type: Object,
                required: true,
            },
            workDaysTemplate: {
                type: Array,
                required: true,
            },
        },
        components: {
            Avatar,
        },
        data: () => ({
            selectedStaffIndex: 0,
        }),
        mounted() {
        },
        computed: {
            isStaffListNotEmpty() {
                return !!this.filteredStaffList.length
            },
            currentStaffData() {
                return this.filteredStaffList[this.selectedStaffIndex];
            },
            currentScheduleData() {
                const staffSchedule = this.staffScheduleData[this.currentStaffData.id];
                let scheduleTemplate = cloneDeep(this.workDaysTemplate);

                if (staffSchedule.length) {
                    staffSchedule.forEach(staffWorkDay => {
                        let scheduleDay = scheduleTemplate.find(day => day.date === staffWorkDay.scheduleDate);
                        if (scheduleDay) {
                            scheduleDay.title = staffWorkDay.dayTypeTitle;
                            scheduleDay.type = staffWorkDay.dayTypeKindCode;
                        }
                    })
                }
                return scheduleTemplate;

            },
            isShowPrevButton() {
                return this.selectedStaffIndex > 0;
            },
            isShowNextButton() {
                return this.selectedStaffIndex + 1 < this.filteredStaffList.length;
            },
        },
        methods: {
            nextStaff() {
                this.selectedStaffIndex += 1
            },
            prevStaff() {
                this.selectedStaffIndex -= 1
            },
        },
        watch: {
            'filteredStaffList.length'() {
                this.selectedStaffIndex = 0;
            },
        }
    };
</script>

<style scoped lang="less">
</style>