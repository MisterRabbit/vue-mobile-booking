<template>
    <div>
        <div class="tl-booking-modal-services">
            <div class="tl-booking-modal-services__header">
                <button class="btn tl-booking-modal-services__add" @click="addService">
                    <icon-plus/>
                </button>
                <native-select
                    v-model="sortType"
                    class="tl-booking-modal-services__select"
                    :is-show-label="false"
                    :is-form-group="false"
                    :options="sortOptions"
                    name="servicesSortOptions"
                />
            </div>
            <div class="tl-booking-modal-services__list" v-if="bookingData.serviceList.length">
                <services-list-item
                    v-for="(service, index) in sortedGoods"
                    :key="index"
                    :service-data="service"
                    :goods-discount="goodsDiscount"
                    @edit-service="editService"
                />
            </div>
            <div class="not-data tl-booking-modal-services__empty" v-else>
                Услуги не выбраны. Добавьте первую услугу
            </div>
        </div>
        <transition name="slide-fade-right">
            <services-tree-modal
                v-if="isShowServicesTreeModal"
                :goods-list="goodsList"
                :available-units="availableUnits"
                :available-cabinets="availableCabinets"
                :booking-data="bookingData"
                @select-service="editService"
                @close-modal-window="closeServicesTreeModal"
            />
        </transition>
        <transition name="slide-fade-right">
            <edit-service-modal
                v-if="isShowEditServiceModal"
                :booking-data="bookingData"
                :available-units="availableUnits"
                :available-cabinets="availableCabinets"
                :init-service-data="editedServiceData"
                @close-modal-window="closeEditServiceModal"
            />
        </transition>
    </div>
</template>

<script>
    import ServicesListItem from './ServicesListItem';
    import NativeSelect from '../../../../../../../elements/NativeSelect';
    import ServicesTreeModal from './modals/ServicesTreeModal';
    import EditServiceModal from './modals/EditServiceModal';
    import IconPlus from '../../../../../../../../../../assets/img/icons/common/plus.svg';
    import {sortAsc} from '../../../../../../../../../../utils/sort';
    import {cloneDeep} from 'lodash';
    import {
        sortGoodsByPrice,
        sortGoodsByAmount,
        sortGoodsByDuration,
    } from '../../../../../../services/timeline-services';

    const sortOptions = [
        {
            id: 'title',
            title: 'По алфавиту',
        },
        {
            id: 'price',
            title: 'По цене',
        },
        {
            id: 'amount',
            title: 'По количеству',
        },
        {
            id: 'duration',
            title: 'По продолжительности',
        }
    ];

    export default {
        name: 'ServicesList',
        props: {
            bookingData: {
                type: Object,
                required: true,
            },
            goodsDiscount: {
                type: Number,
                require: true,
            },
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
        },
        components: {
            ServicesListItem,
            NativeSelect,
            ServicesTreeModal,
            EditServiceModal,
            IconPlus,
        },
        data: () => ({
            sortOptions,
            sortType: 'title',
            isShowServicesTreeModal: false,
            isShowEditServiceModal: false,
            editedServiceData: {},
        }),
        mounted() {
        },
        computed: {
            sortedGoods() {
                let sortedArray = cloneDeep(this.bookingData.serviceList);

                const funcOfSort = {
                    title: sortAsc,
                    price: sortGoodsByPrice,
                    amount: sortGoodsByAmount,
                    duration: sortGoodsByDuration,
                };

                return sortedArray.sort((a, b) => funcOfSort[this.sortType](a, b, 'goodName', this.goodsDiscount));
            },
        },
        methods: {
            closeServicesTreeModal() {
                this.isShowServicesTreeModal = false;
            },
            closeEditServiceModal(isNeedCloseTreeModal) {
                if (typeof isNeedCloseTreeModal === 'boolean' && isNeedCloseTreeModal) this.closeServicesTreeModal();
                this.isShowEditServiceModal = false;
                this.editedServiceData = {};
            },
            editService(serviceData) {
                this.editedServiceData = serviceData;
                this.isShowEditServiceModal = true;
            },
            addService() {
                this.isShowServicesTreeModal = true;
            },
        }
    };
</script>

<style scoped lang="less">

</style>