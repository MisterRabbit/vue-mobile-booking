<template>
    <vue-modal
        modal-caption="Добавить"
        :is-show-success-button="false"
        @cancel="closeModalWindow"
    >
        <div class="tl-booking-modal-services-tree-modal">
            <searching
                :is-debounce="false"
                :is-clearable="true"
                :is-use-single="true"
                @update-search-field="updateSearchStr"
            />
            <base-tree
                v-if="this.goodsList.length"
                :base-tree-data="treeData"
                title-key="goodName"
                :show-header="false"
                :show-footer="false"
                :show-linked="false"
                :show-parent-checkbox="false"
                :show-selected-count="false"
                :show-checkbox="false"
                class="tl-booking-modal-services-tree"
                @on-change="onChangeGood"
            />
            <div class="not-data" v-else>
                Список услуг пуст
            </div>
        </div>
    </vue-modal>
</template>

<script>
    import vueModal from '../../../../../../../../modules/modal-window/modal-window';
    import Searching from '../../../../../../../../elements/Searching';
    import BaseTree from '../../../../../../../../elements/base-tree/BaseTree';
    import { convertToTreeFormat } from '../../../../../../../../../../../utils/convertTree';
    import toastr from 'toastr';
    import {
        checkIsEnableAddServiceByUnit,
    } from '../../../../../../../services/timeline-services';


    export default {
        name: 'ServicesTreeModal',
        props: {
            goodsList: {
                type: Array,
                required: true,
            },
            availableUnits: {
                type: Array,
                required: true,
            },
            availableCabinets: {
                type: Array,
                required: true,
            },
            bookingData: {
                type: Object,
                required: true,
            },
        },
        components: {
            vueModal,
            Searching,
            BaseTree,
        },
        inject: [
            'organizationInfo',
        ],
        data: () => ({
            searchStr: '',
        }),
        mounted() {
        },
        computed: {
            treeData() {
                if (this.searchStr) {
                    return convertToTreeFormat(this.goodsList, this.searchStr, 'goodName');
                }
                return [{
                    goodName: 'Все услуги',
                    type: 'folder',
                    isActive: 1,
                    children: convertToTreeFormat(this.goodsList)
                }];
            },
        },
        methods: {
            updateSearchStr(searchStr) {
                this.searchStr = searchStr;
            },
            closeModalWindow() {
                this.$emit('close-modal-window');
            },
            onChangeGood(treeItemData) {
                if (treeItemData.type === 'folder') return;

                try {
                    checkIsEnableAddServiceByUnit(
                        !!this.organizationInfo.processUnitBinding,
                        treeItemData.unitList,
                        this.bookingData.unit,
                        this.availableUnits
                    );

                    treeItemData.amount = 1;
                    this.$emit('select-service', treeItemData);
                } catch (e) {
                    toastr.warning(e.message);
                }
            },
        }
    };
</script>

<style scoped lang="less">

</style>