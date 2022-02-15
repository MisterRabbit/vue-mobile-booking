<template>
    <ul class="tl-booking-modal-nav">
        <li
            v-for="(item, index) in filteredMenu"
            :key="index"
        >
            <button
                class="tl-booking-modal-nav__button"
                :class="{active: isActiveTab(item.type)}"
                @click="changeActiveTab(item.type)"
            >
                <component :is="item.icon"></component>
                <span>{{ item.title }}</span>
            </button>
        </li>
    </ul>
</template>


<script>
    import IconMonitor from '../../../../../../../../../assets/img/icons/common/monitor.svg';
    import IconService from '../../../../../../../../../assets/img/icons/common/calendar.svg';
    import IconHistory from '../../../../../../../../../assets/img/icons/common/list.svg';
    import IconChangeColor from '../../../../../../../../../assets/img/icons/modules/timeline/color-palette.svg';
    import IconUser from '../../../../../../../../../assets/img/icons/common/user-rounded.svg';

    import {
        getAbilityUseCustomColor,
    } from '../../../../../services/timeline-services';

    const menu = [
        {title: 'Клиент', type: 'customer', icon: IconMonitor, },
        {title: 'Услуги', type: 'services', icon: IconService},
        {title: 'История изменений', type: 'history', icon: IconHistory},
        {title: 'Изменить цвет', type: 'change-color', icon: IconChangeColor},
        {title: 'Новый клиент', type: 'new-customer', icon: IconUser},
    ];

    export default {
        name: 'BookingNav',
        props: {
            isNewBooking: {
                type: Boolean,
                required: true,
            },
            statusCode: {
                type: String,
                required: true,
            },
        },
        components: {
            IconMonitor,
            IconService,
            IconHistory,
            IconChangeColor,
            IconUser,
        },
        data: () => ({
        }),
        inject: [
            'isActiveTab',
            'changeActiveTab',
        ],
        mounted() {
        },
        computed: {
            isEnableUseCustomColor() {
                return getAbilityUseCustomColor(this.statusCode);
            },
            filteredMenu() {
                return menu.filter(menuItem => {
                    if (menuItem.type === 'history') {
                        return !this.isNewBooking;
                    } else if (menuItem.type === 'change-color') {
                        return this.isEnableUseCustomColor;
                    }
                    return true;
                });
            },
        },
        methods: {

        }
    };
</script>

<style scoped lang="less">

</style>