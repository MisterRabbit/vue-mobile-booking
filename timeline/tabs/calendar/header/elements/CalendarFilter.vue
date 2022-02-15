<template>
    <div>
        <div class="form-group">
            <label>
                Клиент
            </label>
            <vue-select
                label="fio"
                name="customer-list"
                required
                v-model="filters.customerId"
                :options="customerList"
                :searchable="true"
                :clearable="true"
                :is-debounce-search="true"
                @search="getCustomerList"
            />
        </div>
        <native-select
            v-model="filters.subdivisionId"
            :value="filters.subdivisionId"
            :options="subdivisionList"
            label="Подразделение"
            name="subdivision"
        />
        <native-select
            v-model="filters.positionId"
            :value="filters.positionId"
            :options="positionList"
            label="Специальность"
            name="position"
        />
        <native-select
            v-model="filters.staffId"
            :value="filters.staffId"
            :options="staffList"
            option-title="FIO"
            label="Сотрудник"
            name="staff"
        />
        <div class="filter__footer">
            <button class="btn_flat btn_flat_cancel" @click.prevent="clearFilter">Сбросить</button>
            <button class="btn_flat btn_flat_approve" @click.prevent="applyFilter">Применить</button>
        </div>
    </div>
</template>

<script>
    import NativeSelect from '../../../../../elements/NativeSelect';
    import VueSelect from '../../../../../elements/VueSelect';
    import timelineRepository from '../../../../../../../../repository/timeline-repository';

    export default {
        name: 'CalendarFilter',
        props: {},
        components: {
            NativeSelect,
            VueSelect,
        },
        data: () => ({
            filters: {
                positionId: null,
                staffId: null,
                subdivisionId: null,
                customerId: null,
            },
            customerList: [],
        }),
        inject: [
            'positionList',
            'staffList',
            'subdivisionList',
        ],
        mounted() {
        },
        computed: {},
        methods: {
            clearFilter() {
                for (let key in this.filters) {
                    if (this.filters.hasOwnProperty(key)) {
                        this.filters[key] = null;
                    }
                }
                this.applyFilter();
            },
            applyFilter() {
                this.$emit('apply-filter', this.filters);
            },
            async getCustomerList(searchStr) {
                this.customerList = searchStr ? await timelineRepository.searchCustomer(searchStr) : [];
            },
        }
    };
</script>

<style scoped lang="less">

</style>