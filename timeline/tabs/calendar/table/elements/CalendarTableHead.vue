<template>
    <div class="tl-calendar-table__head">
        <div class="tl-calendar-table__head-top">
            <span>{{ formattedDate }}</span>
            <button
                v-if="isShowPrevButton"
                class="btn btn--round btn--round--left"
                @click="prevColumn"
            ></button>
            <button
                v-if="isShowNextButton"
                class="btn btn--round btn--round--right"
                @click="nextColumn"
            ></button>
        </div>
        <div class="tl-calendar-table__columns">
            <div
                v-for="(column, index) in columns"
                :key="index"
                class="tl-calendar-table__head-column"
            >
                <div class="tl-calendar-table__head-info">
                    <avatar
                        :border-radius="columnsAvatarData.avatarBorderRadius"
                        :source="column.labelPhotoUrl"
                        :alt="column.label"
                        :custom-default-image="columnsAvatarData.isUsingCustomAvatar"
                    >
                        <template #custom-avatar>
                            <svg width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="columnsAvatarData.isUnitsTabActive">
                                <path d="M36 0H4a4 4 0 0 0-4 4v32a4 4 0 0 0 4 4h32a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4Z" fill="#DEDEDE"/>
                                <path d="M10.499 23.501h1.15a3.476 3.476 0 0 0 3.425 2.983h6.925v1.2a.529.529 0 0 1-.525.527h-8.949a1.534 1.534 0 0 0-1.526 1.533v.727a1.534 1.534 0 0 0 1.525 1.53h15.95a1.534 1.534 0 0 0 1.525-1.53v-6.017a1.534 1.534 0 0 0-1.525-1.53h-.65a10.07 10.07 0 0 0-6.349-7.9l1.575-1.58a.486.486 0 0 0 0-.7l-.45-.451.45-.451a2.249 2.249 0 0 0-3.175-3.184l-.45.451-.45-.451a.482.482 0 0 0-.7 0l-6.5 6.518a.486.486 0 0 0 0 .7l.475.476-1.277 1.279a.486.486 0 0 0 0 .7l2.426 2.437a.483.483 0 0 0 .7 0l1.275-1.279.475.476a.483.483 0 0 0 .7 0l1.925-1.93a6.392 6.392 0 0 1 5.7 4.914h-.625a1.534 1.534 0 0 0-1.525 1.53v1.028h-6.925a2.471 2.471 0 0 1-2.425-1.98h1.075a.5.5 0 0 0 0-1h-3.25a.5.5 0 0 0-.5.5.48.48 0 0 0 .5.476v-.002ZM20.574 9.362a1.251 1.251 0 0 1 1.75 0 1.267 1.267 0 0 1 0 1.78l-.45.451-1.775-1.779.475-.452Zm-6.85 10.329-1.7-1.7.925-.927 1.7 1.7-.925.927Zm2.45-.8-3.349-3.36 5.8-5.817 3.349 3.359-5.8 5.818Zm3.175-1.78 1.3-1.3a9.093 9.093 0 0 1 6.15 7.121h-1.625a7.378 7.378 0 0 0-5.825-5.817v-.004Zm3.65 7.343a.53.53 0 0 1 .526-.523h4.924a.529.529 0 0 1 .525.527V30.5a.529.529 0 0 1-.525.527H12.525a.53.53 0 0 1-.526-.531v-.727a.53.53 0 0 1 .525-.527h8.95a1.535 1.535 0 0 0 1.525-1.529v-3.259Z" fill="#fff"/>
                            </svg>
                            <svg width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg" v-else>
                                <path d="M36 0H4a4 4 0 0 0-4 4v32a4 4 0 0 0 4 4h32a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4Z" fill="#DEDEDE"/>
                                <path d="M13.436 8.005h13.127A1.409 1.409 0 0 1 28 9.385v21.238a1.409 1.409 0 0 1-1.438 1.376H13.436A1.412 1.412 0 0 1 12 30.678V9.32a1.413 1.413 0 0 1 1.436-1.321v.006Zm4.343 10.668a1.231 1.231 0 1 1-1.285 1.23 1.26 1.26 0 0 1 1.285-1.23ZM15.59 9.646l5.567 2.839a.813.813 0 0 1 .452.721c.004 4.533.004 9.067 0 13.6a.821.821 0 0 1-.524.756l-5.5 2.8h10.7V9.645l-10.695.001Zm-1.877 19.817 6.186-3.151V13.685l-6.186-3.146v18.924Z" fill="#fff"/>
                            </svg>
                        </template>
                    </avatar>
                    <strong>{{ column.label }}</strong>
                    <p v-if="column.position">{{ column.position }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Avatar from '../../../../../modules/avatar/Avatar';

    import {
        formatCalendarTableHeadDate,
    } from '../../../../services/timeline-services';

    export default {
        name: 'CalendarTableHead',
        props: {
            selectedDate: {
                type: String,
                required: true,
            },
            pagination: {
                type: Object,
                required: true,
            },
            activeTableType: {
                type: String,
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
        },
        components: {
            Avatar,
        },
        data: () => ({
        }),
        inject: [
            'changeCurrentPage',
        ],
        mounted() {
        },
        computed: {
            formattedDate() {
                return formatCalendarTableHeadDate(this.selectedDate);
            },
            isStaffTabActive() {
                return this.activeTableType === 'staff';
            },
            columnsAvatarData() {
                return {
                    isUsingCustomAvatar: !this.isStaffTabActive,
                    isUnitsTabActive: this.activeTableType === 'units',
                    avatarBorderRadius: this.isStaffTabActive ? '50% !important' : '4px !important',
                }
            },
            isShowPrevButton() {
                return this.pagination.currentPage > 1;
            },
            isShowNextButton() {
                return (this.pagination.currentPage * this.pagination.columnsPerPage) < this.totalColumnsCount;
            },
        },
        methods: {
            prevColumn() {
                this.changeCurrentPage(this.pagination.currentPage - 1);
            },
            nextColumn() {
                this.changeCurrentPage(this.pagination.currentPage + 1);
            },
        }
    };
</script>

<style scoped lang="less">

</style>