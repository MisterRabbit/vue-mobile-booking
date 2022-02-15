<template>
    <div class="tl-booking-modal-panel">
        <div class="tl-booking-modal-panel__header">
            <h6 class="tl-booking-modal-panel__title">Измененить цвет</h6>
        </div>
        <div class="tl-booking-modal-panel__content">
            <input
                class="tl-booking-modal-color-picker"
                type="color"
                v-model="color"
                @change="changeColorEvent"
            >
            <button
                class="button tl-booking-modal-color-reset"
                @click="setDefaultColor"
            >
                <icon-trash/>
                <span>Задать цвет по умолчанию</span>
            </button>
        </div>
    </div>
</template>

<script>
    import IconTrash from '../../../../../../../../../../assets/img/icons/common/trash.svg';
    import {bookingTypesObj} from '../../../../../../../../../../utils/dict/booking-types';

    export default {
        name: 'TabChangeColor',
        props: {
            bookingData: {
                type: Object,
                required: true,
            },
        },
        components: {
            IconTrash,
        },
        data: () => ({
            color: null,
        }),
        mounted() {
            this.color = this.bookingData.customColor;
        },
        computed: {
        },
        methods: {
            setDefaultColor() {
                this.color = bookingTypesObj[this.bookingData.statusCode];
                this.changeColor(this.color);
            },
            changeColorEvent() {
                this.changeColor(this.color);
            },
            changeColor(newColor) {
                this.$emit('update-color', newColor);
            },
        },
    };
</script>

<style scoped lang="less">

</style>