<template>
    <div>
        <div class="not-data" v-if="isCustomerDataEmpty">
            Клиент не выбран. Выберите клиента для оформления записи
        </div>
        <div class="tl-booking-modal-customer-card" v-else>
            <div class="tl-booking-modal-customer-card__main">
                <div class="tl-booking-modal-customer-card__avatar">
                    <avatar
                        :source="customerData.photoUrl"
                        :alt="customerData.fio"
                        :gender="customerData.sex"
                    />
                </div>
                <div class="tl-booking-modal-customer-card__info">
                    <strong>{{ customerData.fio }}</strong>
                    <span
                        class="tl-booking-modal-customer-card__status"
                        :class="{active: customerData.isActive}"
                    >{{ customerData.isActive ? 'Активен' : 'Не активен' }}</span>
                    <input
                        v-if="customerData.phone"
                        v-mask="getPhoneMask"
                        :value="customerData.phone"
                        class="tl-booking-modal-customer-card__phone"
                        disabled="disabled"
                        type="tel"
                    />
                    <span class="tl-booking-modal-customer-card__card-type">
                        <em :class="cardData.class"></em>
                        {{ cardData.title }}
                    </span>
                </div>
                <div class="tl-booking-modal-customer-card__action">
                    <dropdown-btn size="small" type="blue">
                        <button class="dropdown-item" @click="goToCustomer">
                            <icon-watch/>
                            <span>Посмотреть</span>
                        </button>
                        <button class="dropdown-item remove" @click="clearCustomerData">
                            <icon-trash/>
                            <span>Удалить</span>
                        </button>
                    </dropdown-btn>
                </div>
            </div>
            <div
                class="tl-booking-modal-customer-card__bottom"
                :class="{'tl-booking-modal-customer-card__bottom--opened': isShowFinanceInfo}"
                @click="toggleFinanceInfo"
            >
                <icon-arrow/>
                <p v-if="isShowFinanceInfo">
                    <span>Скидка на товары:</span> {{ discountCard.discountGoods || 0 }} %
                </p>
                <p v-if="isShowFinanceInfo">
                    <span>Скидка на услуги:</span> {{ discountCard.discountServices || 0 }} %
                </p>
                <p>
                    <span>Остаток на счёте:</span> {{ customerData.personalAccountBalance | localize(2, 0) }} {{ currencyShortTitle }}
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    import Avatar from '../../../../../../../modules/avatar/Avatar';
    import IconArrow from '../../../../../../../../../../assets/img/icons/common/arrows/simple-arrow-top.svg';
    import IconTrash from '../../../../../../../../../../assets/img/icons/common/trash.svg';
    import IconWatch from '../../../../../../../../../../assets/img/icons/common/watch-eye.svg';
    import DropdownBtn from '../../../../../../../../../components/elements/DropdownBtn';

    import { mask } from 'vue-the-mask';
    import {convertPhoneMask} from '../../../../../../../../../../utils/base-utils';

    export default {
        name: 'CustomerCard',
        props: {
            customerData: {
                type: Object,
                required: true,
            },
            discountCard: {
                type: Object,
                required: true,
            },
        },
        components: {
            Avatar,
            IconArrow,
            IconTrash,
            IconWatch,
            DropdownBtn,
        },
        inject: [
            'currencyShortTitle',
            'organizationInfo',
            'clearCustomerData',
        ],
        directives: {
            mask: (el, binding) => {
                if (!binding.value) {
                    return;
                }
                mask(el, binding);
            }
        },
        data: () => ({
            isShowFinanceInfo: false,
        }),
        mounted() {

        },
        computed: {
            isCustomerDataEmpty() {
                return this.customerData.id === -1;
            },
            getPhoneMask() {
                if (!this.organizationInfo.usePhoneMask) return '';
                let { phoneMask } = this.organizationInfo;
                if (phoneMask) {
                    return convertPhoneMask(phoneMask);
                }
                return '8 (xxx) xxx xx-xx';
            },
            cardData() {
                let type = 'discount';
                let title = 'Нет карты';

                if ('type' in this.discountCard) {
                    if (this.discountCard.type === 'Персональная') {
                        type = 'person';
                    } else if (this.discountCard.type === 'Скидочная') {
                        type = 'discount';
                    } else if (this.discountCard.type === 'Накопительная') {
                        type = 'up';
                    }
                    title = this.discountCard.title;
                } else {
                    type = 'empty';
                }

                return {
                    class: type,
                    title,
                };
            }
        },
        methods: {
            toggleFinanceInfo() {
                this.isShowFinanceInfo = !this.isShowFinanceInfo;
            },
            goToCustomer() {
                let path = this.organizationInfo.modeType === 'crm'
                    ? '/crm/customer/view/'
                    : '/online/organization/customer/view/';
                window.location =  `${path}${this.customerData.id}`;
            },
        }
    };
</script>

<style scoped lang="less">

</style>