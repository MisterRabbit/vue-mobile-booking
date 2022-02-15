<template>
    <article class="tl-booking-modal-services-item" @click="editService">
        <div class="tl-booking-modal-services-item__header">
            <div class="tl-booking-modal-services-item__title">
                <icon-good/>
                <h4>{{ serviceData.goodName }}</h4>
            </div>
            <button class="btn btn-close" @click.stop="removeBookingService(serviceData.id)">
                <icon-close/>
            </button>
        </div>
        <div class="tl-booking-modal-services-item__main">
            <div class="tl-booking-modal-services-item__discount" v-if="isShowDiscount">
                <span>Скидка</span>
            </div>
            <div class="tl-booking-modal-services-item__info">
                <div>{{ serviceData.priceMin | localize(2, 0) }} {{ currencyShortTitle }}</div>
                <div>
                    <icon-multiply/>
                    {{ serviceData.amount }} шт.
                </div>
                <div>
                    <icon-clock/>
                    {{ serviceData.duration }} мин.
                </div>
                <div v-if="isShowDiscount">
                    <icon-minus/>
                    {{ goodsDiscount }} %
                </div>
                <strong>{{totalPrice | localize(2, 0)}} {{ currencyShortTitle }}</strong>
            </div>
        </div>
    </article>
</template>

<script>
    import IconGood from '../../../../../../../../../../assets/img/icons/common/goods/good-single.svg';
    import IconClose from '../../../../../../../../../../assets/img/icons/common/buttons/remove.svg';
    import IconClock from '../../../../../../../../../../assets/img/icons/common/clock.svg';
    import IconMultiply from '../../../../../../../../../../assets/img/icons/common/multiply.svg';
    import IconMinus from '../../../../../../../../../../assets/img/icons/common/minus.svg';

    export default {
        name: 'ServicesListItem',
        props: {
            serviceData: {
                type: Object,
                required: true,
            },
            goodsDiscount: {
                type: Number,
                require: true,
            },
        },
        components: {
            IconGood,
            IconClose,
            IconClock,
            IconMultiply,
            IconMinus,
        },
        inject: [
            'currencyShortTitle',
            'removeBookingService',
        ],
        data: () => ({
        }),
        mounted() {
        },
        computed: {
            isShowDiscount() {
                return this.goodsDiscount !== 0 && this.serviceData.discountIgnored !== 1;
            },
            totalPrice() {
                let amountedPrice = this.serviceData.priceMin * this.serviceData.amount;

                if (this.isShowDiscount) {
                    return amountedPrice - amountedPrice * (this.goodsDiscount / 100)
                }

                return amountedPrice;
            }
        },
        methods: {
            editService() {
                this.$emit('edit-service', this.serviceData);
            },
        }
    };
</script>

<style scoped lang="less">

</style>