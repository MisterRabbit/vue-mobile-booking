<template>
    <vue-modal
        modal-caption="Редактировать"
        @success="saveServiceData"
        @cancel="closeModalWindow"
    >
        <div class="tl-booking-modal-add-service">
            <div class="tl-booking-modal-add-service-card">
               <div class="tl-booking-modal-add-service-card__top">
                   <div class="tl-booking-modal-add-service-card__title">
                       <icon-good/>
                       <h4>{{ serviceData.goodName }}</h4>
                   </div>
                   <button class="btn btn-close" @click="closeModalWindow">
                       <icon-close/>
                   </button>
               </div>
               <div class="tl-booking-modal-add-service-card__bottom">
                   Продолжительность: <span>{{ serviceDuration }}</span>
               </div>
            </div>
            <native-select
                v-if="isShowUnits"
                v-model="selectedUnit"
                class="tl-booking-modal-duration__select"
                :is-gray-label="true"
                :options="filteredUnits"
                label="Выберите аппарат"
                name="unitsOptions"
            />
            <native-select
                v-if="isShowCabinets"
                v-model="selectedCabinet"
                class="tl-booking-modal-duration__select"
                :is-gray-label="true"
                :options="filteredCabinets"
                label="Выберите кабинет"
                name="serviceCabinetsOptions"
            />
            <div class="form-group">
                <label class="active">Цена, руб</label>
                <input
                    v-model="formattedPrice"
                    disabled="disabled"
                    class="form-control full"
                    type="text"
                />
            </div>
            <div class="form-group">
                <label class="active">Количество</label>
                <div class="tl-booking-modal-add-service-amount">
                    <button class="btn-incr" @click="changeCount(false)">
                        <icon-minus/>
                    </button>
                    <button class="btn-decr" @click="changeCount(true)">
                        <icon-plus/>
                    </button>
                    <input
                        v-model.trim="serviceData.amount"
                        class="form-control full"
                        type="text"
                    />
                </div>
            </div>
            <div class="tl-booking-summary-table">
                <div class="tl-booking-summary-table__cell">
                    <div class="tl-booking-summary-table__title">Время:</div>
                    <div class="tl-booking-summary-table__value">{{ totalDuration }}</div>
                </div>
                <div class="tl-booking-summary-table__cell">
                    <div class="tl-booking-summary-table__title">Сумма:</div>
                    <div class="tl-booking-summary-table__value price">{{ totalPrice | localize(2, 0)}} {{ currencyShortTitle }}</div>
                </div>
            </div>
        </div>
    </vue-modal>
</template>

<script>
    import vueModal from '../../../../../../../../modules/modal-window/modal-window';
    import NativeSelect from '../../../../../../../../elements/NativeSelect';
    import IconGood from '../../../../../../../../../../../assets/img/icons/common/goods/good-single.svg';
    import IconClose from '../../../../../../../../../../../assets/img/icons/common/buttons/remove.svg';
    import IconPlus from '../../../../../../../../../../../assets/img/icons/common/buttons/plus.svg';
    import IconMinus from '../../../../../../../../../../../assets/img/icons/common/buttons/minus.svg';
    import {cloneDeep} from 'lodash';
    import {localizePrice} from '../../../../../../../../../../../utils/numbers';
    import {
        getFormattedTimeStringByMinutes,
    } from '../../../../../../../services/timeline-services';

    export default {
        name: 'EditServiceModal',
        props: {
            initServiceData: {
                type: Object,
                required: true,
            },
            bookingData: {
                type: Object,
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
            vueModal,
            NativeSelect,
            IconGood,
            IconClose,
            IconPlus,
            IconMinus,
        },
        inject: [
            'currencyShortTitle',
            'updateServiceList',
            'organizationInfo',
            'selectUnit',
            'selectCabinet',
        ],
        data() {
            return {
                serviceData: cloneDeep(this.initServiceData),
                formattedPrice: localizePrice(this.initServiceData.priceMin),
                selectedUnit: -1,
                selectedCabinet: -1,
            }
        },
        mounted() {
            this.selectedUnit = this.setDefaultSelectedOption('unit', this.filteredUnits);
            this.selectedCabinet = this.setDefaultSelectedOption('cabinet', this.filteredCabinets);
        },
        computed: {
            totalDuration() {
                return getFormattedTimeStringByMinutes(this.serviceData.duration * this.serviceData.amount);
            },
            totalPrice() {
                return this.serviceData.amount * this.serviceData.priceMin;
            },
            serviceDuration() {
                return getFormattedTimeStringByMinutes(this.serviceData.duration);
            },
            filteredUnits() {
                const filteredUnits = this.serviceData.unitList.filter(unit => {
                    return !!this.availableUnits.find(availableUnit => {
                        return unit.id === availableUnit.id;
                    });
                });
                return [...[{
                    id: -1,
                    title: 'Не выбрано',
                }], ...filteredUnits];
            },
            filteredCabinets() {
                const filteredCabinets = this.serviceData.cabinetList.filter(cabinet => {
                    return !!this.availableCabinets.find(availableCabinet => {
                        return cabinet.id === availableCabinet.id;
                    });
                });
                return [...[{
                    id: -1,
                    title: 'Не выбрано',
                }], ...filteredCabinets];
            },
            isShowUnits() {
                return !!this.serviceData.unitList.length;
            },
            isShowCabinets() {
                return this.organizationInfo.modeType === 'crm' && this.serviceData.cabinetList.length;
            },
        },
        methods: {
            setDefaultSelectedOption(type, availableArray) {
                if (this.bookingData[type] && availableArray.find(item => item.id === this.bookingData[type].id)) {
                    return this.bookingData[type].id;
                }
                return -1;
            },
            changeCount(incr) {
                this.serviceData.amount = +this.serviceData.amount;
                if (incr) {
                    this.serviceData.amount += 1;
                } else if (this.serviceData.amount > 1) {
                    this.serviceData.amount -= 1;
                } else {
                    this.serviceData.amount = 1;
                }
            },
            saveServiceData() {
                if (!this.serviceData.amount) this.serviceData.amount = 1;
                if (this.selectedUnit !== -1) this.selectUnit(this.selectedUnit);
                if (this.selectedCabinet !== -1) this.selectCabinet(this.selectedCabinet);
                this.updateServiceList(this.serviceData);
                this.closeModalWindow(true);
            },
            closeModalWindow(isNeedCloseTreeModal) {
                this.$emit('close-modal-window', isNeedCloseTreeModal);
            },
        },
        watch: {
            'serviceData.amount'() {
                this.serviceData.amount = this.serviceData.amount.toString().replace(/\D+/g, '');
            }
        }
    };
</script>

<style scoped lang="less">

</style>