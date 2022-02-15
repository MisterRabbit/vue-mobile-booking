<template>
    <div class="tl-tabs-group">
        <button
            v-for="button in tabButtons"
            :key="button.name"
            class="tl-tabs-group__item"
            :class="{'tl-tabs-group__item--active': isActiveTabButton(button.name)}"
            @click="changeTableType(button.name)"
        >
            {{ button.text }}
        </button>
    </div>
</template>

<script>
    const tabButtons = [
        {
            name: 'staff',
            text: 'Сотрудники',
        },
        {
            name: 'units',
            text: 'Аппараты',
        },
    ];

    export default {
        name: 'CalendarNavTabs',
        props: {
            activeTableType: {
                type: String,
                required: true,
            },
        },
        components: {
        },
        data: () => ({
            tabButtons,
        }),
        inject: [
            'organizationInfo',
            'changeTableType',
        ],
        mounted() {
            this.modifyTabButtons();
        },
        computed: {
        },
        methods: {
            modifyTabButtons() {
                if (this.organizationInfo.modeType === 'crm') {
                    this.tabButtons.push({
                        name: 'cabinets',
                        text: 'Кабинеты',
                    });
                }
            },
            isActiveTabButton(tabName) {
                return this.activeTableType === tabName;
            },
        }
    };
</script>

<style scoped lang="less">

</style>