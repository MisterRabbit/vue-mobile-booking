<template>
    <div class="tl-booking-summary-table">
        <div class="tl-booking-summary-table__cell">
            <div class="tl-booking-summary-table__title">Итого:</div>
            <div class="tl-booking-summary-table__value">{{ summaryData.totalPrice | localize(2, 0)}} {{ currencyShortTitle }}</div>
        </div>
        <div class="tl-booking-summary-table__cell">
            <div class="tl-booking-summary-table__title">Время:</div>
            <div class="tl-booking-summary-table__value">{{ summaryData.duration }}</div>
        </div>
        <div class="tl-booking-summary-table__cell">
            <div class="tl-booking-summary-table__title">Скидка:</div>
            <div class="tl-booking-summary-table__value">{{ summaryData.discount | localize(2, 0)}} {{ currencyShortTitle }}</div>
        </div>
        <div class="tl-booking-summary-table__cell">
            <div class="tl-booking-summary-table__title">К оплате:</div>
            <div class="tl-booking-summary-table__value price">{{ summaryData.toPay | localize(2, 0)}} {{ currencyShortTitle }}</div>
        </div>
    </div>
</template>

<script>
    import {
        getFormattedTimeStringByMinutes,
    } from '../../../../../../services/timeline-services';

    export default {
        name: 'ServicesSummary',
        props: {
            bookingGoods: {
                type: Array,
                required: true,
            },
            goodsDiscount: {
                type: Number,
                require: true,
            },
        },
        components: {
        },
        inject: [
            'currencyShortTitle',
        ],
        data: () => ({
        }),
        mounted() {
        },
        computed: {
            summaryData() {
                let summaryData = {
                    totalPrice: 0,
                    duration: 0,
                    discount: 0,
                    toPay: 0
                };
                this.bookingGoods.forEach(goodsItem => {
                    let purePrice = goodsItem.priceMin * goodsItem.amount;

                    if (this.goodsDiscount) {
                        let discount = goodsItem.discountIgnored === 1 ? 0 : (goodsItem.priceMin / 100) * this.goodsDiscount * goodsItem.amount;
                        summaryData.discount += discount;
                        summaryData.toPay += purePrice - discount;
                    } else {
                        summaryData.toPay += purePrice;
                    }

                    summaryData.duration += goodsItem.amount * goodsItem.duration;
                    summaryData.totalPrice += purePrice;
                });
                summaryData.duration = getFormattedTimeStringByMinutes(summaryData.duration);

                return summaryData;
            }
        },
        methods: {

        }
    };
</script>

<style scoped lang="less">

</style>