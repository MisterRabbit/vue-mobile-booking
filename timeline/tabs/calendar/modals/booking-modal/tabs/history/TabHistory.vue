<template>
    <div class="tl-booking-modal-panel">
        <div class="tl-booking-modal-panel__header">
            <h6 class="tl-booking-modal-panel__title">История изменений</h6>
        </div>
        <div class="tl-booking-modal-panel__content">
            <div class="not-data" v-if="isChangeLogEmpty">
                Список истории измненений пуст
            </div>
            <div class="tl-booking-modal-changelog" v-else>
                <div class="tl-booking-modal-changelog__sort">
                    <span>Сортировка</span>
                    <native-select
                        class="tl-booking-modal-changelog__select"
                        v-model="selectedSortType"
                        :value="selectedSortType"
                        :is-show-label="false"
                        :is-form-group="false"
                        :options="sortTypes"
                        name="sortChangelog"
                    />
                </div>
                <ul class="tl-booking-modal-changelog__list">
                    <li
                        class="tl-booking-modal-changelog__item"
                        v-for="(item, index) in sortedChangeLog"
                        :key="index"
                    >
                        <span>{{ item.createdAt | dateTime }}</span>
                        <strong>{{ item.changedStaff }}<br/> {{item.changedBy}}</strong>
                        <p>
                            {{ item.description }}
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    import {sortAsc, sortDesc, sortByDateAsc, sortByDateDesc}  from '../../../../../../../../../../utils/sort';
    import NativeSelect from '../../../../../../../elements/NativeSelect';
    import {cloneDeep} from 'lodash';

    const sortTypes = [
        {id: 'sortByDateDesc', title: 'По дате (убыв.)', sortFunc: sortByDateDesc, label: 'createdAt'},
        {id: 'sortByDateAsc', title: 'По дате (возр.)', sortFunc: sortByDateAsc, label: 'createdAt'},
        {id: 'sortByNameDesc', title: 'По ФИО (А-Я)', sortFunc: sortDesc, label: 'changedBy'},
        {id: 'sortByNameAsc', title: 'По ФИО (Я-А)', sortFunc: sortAsc, label: 'changedBy'},
    ];

    export default {
        name: 'TabHistory',
        props: {
            changelog: {
                type: Array,
                required: true,
            },
        },
        components: {
            NativeSelect,
        },
        data: () => ({
            sortTypes,
            selectedSortType: 'sortByDateDesc',
        }),
        mounted() {
            this.$emit('get-changelog');
        },
        computed: {
            isChangeLogEmpty() {
                return this.changelog.length === 0;
            },
            clonedChangeLog() {
                return cloneDeep(this.changelog);
            },
            sortedChangeLog() {
                const sortParams = sortTypes.find(sort => sort.id === this.selectedSortType);
                return this.clonedChangeLog.sort((a, b) => sortParams.sortFunc(a, b, sortParams.label));
            },
        },
        methods: {
        }
    };
</script>

<style scoped lang="less">

</style>