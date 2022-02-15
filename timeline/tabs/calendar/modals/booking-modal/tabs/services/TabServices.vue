<template>
    <div class="tl-booking-modal-panel">
        <div class="tl-booking-modal-panel__header">
            <h6 class="tl-booking-modal-panel__title">Услуги</h6>
        </div>
        <div class="tl-booking-modal-panel__content">
            <services-list
                :booking-data="bookingData"
                :goods-list="goodsList"
                :goods-discount="goodsDiscount"
                :available-units="availableUnits"
                :available-cabinets="availableCabinets"
            />
            <native-select
                v-model="selectedUnit"
                class="tl-booking-modal-duration__select"
                :is-gray-label="true"
                :options="availableUnits"
                label="Выберите аппарат"
                name="unitsOptions"
                @input="selectUnit"
            />
            <native-select
                v-if="isShowCabinets"
                v-model="selectedCabinet"
                class="tl-booking-modal-duration__select"
                :is-gray-label="true"
                :options="availableCabinets"
                label="Выберите кабинет"
                name="cabinetsOptions"
                @input="selectCabinet"
            />
            <services-summary
                :booking-goods="bookingData.serviceList"
                :goods-discount="goodsDiscount"
            />
        </div>
    </div>
</template>

<script>
    import ServicesList from './ServicesList';
    import NativeSelect from '../../../../../../../elements/NativeSelect';
    import ServicesSummary from './ServicesSummary';
    import {
        getAvailableCabinets,
        getAvailableUnits,
    } from '../../../../../../services/timeline-services';

    export default {
        name: 'TabServices',
        props: {
            bookingData: {
                type: Object,
                required: true,
            },
            goodsList: {
                type: Array,
                required: true,
            },
            discountCard: {
                type: Object,
                required: true,
            },
            unitList: {
                type: Array,
                required: true,
            },
            cabinetList: {
                type: Array,
                required: true,
            },
        },
        components: {
            NativeSelect,
            ServicesList,
            ServicesSummary,
        },
        inject: [
            'organizationInfo',
            'selectUnit',
            'selectCabinet',
        ],
        data: () => ({
            selectedUnit: -1,
            selectedCabinet: -1,
        }),
        mounted() {
            this.setSelectedUnitAndCabinet();
        },
        computed: {
            goodsDiscount() {
                return 'id' in this.discountCard ? this.discountCard.discountGoods : 0;
            },
            isShowCabinets() {
                return this.organizationInfo.modeType === 'crm';
            },
            availableUnits() {
                return getAvailableUnits(this.unitList, !!this.organizationInfo.processUnitBinding, this.bookingData.serviceList)
            },
            availableCabinets() {
                return getAvailableCabinets(this.cabinetList);
            },
        },
        methods: {
            setSelectedUnitAndCabinet() {
                this.selectedCabinet = this.bookingData.cabinet ? this.bookingData.cabinet.id : -1;
                this.selectedUnit = this.bookingData.unit ? this.bookingData.unit.id : -1;
            },
        },
        watch: {
            'bookingData.cabinet'() {
                this.setSelectedUnitAndCabinet();
            },
            'bookingData.unit'() {
                this.setSelectedUnitAndCabinet();
            },
        }
    };
</script>

<style scoped lang="less">

</style>