<template>
    <div class="tl-booking-modal-panel">
        <div class="tl-booking-modal-panel__header">
            <h6 class="tl-booking-modal-panel__title">Новый клиент</h6>
        </div>
        <div class="tl-booking-modal-panel__content">
            <vue-form :state="formState" @submit.prevent="submitForm">
                <validate class="form-group">
                    <label
                        class="form-group__label"
                        for="new-client__second-name"
                        :class="{active: newCustomer.secondName}"
                    >
                        Фамилия
                    </label>
                    <input
                        id="new-client__second-name"
                        v-model.trim="newCustomer.secondName"
                        name="secondName"
                        type="text"
                        class="form-control"
                    />
                </validate>
                <validate class="form-group required-field">
                    <label
                        class="form-group__label"
                        for="new-client__first-name"
                        :class="{active: newCustomer.firstName}"
                    >
                        Имя*
                    </label>
                    <input
                        id="new-client__first-name"
                        v-model.trim="newCustomer.firstName"
                        required
                        name="firstName"
                        type="text"
                        class="form-control"
                    />
                    <field-messages name="firstName" show="$submitted" class="form-control-error">
                        <div slot="required">
                            Поле необходимо заполнить
                        </div>
                    </field-messages>
                </validate>
                <validate class="form-group">
                    <label
                        class="form-group__label"
                        for="new-client__patronymic"
                        :class="{active: newCustomer.patronymic}"
                    >
                        Отчество
                    </label>
                    <input
                        id="new-client__patronymic"
                        v-model.trim="newCustomer.patronymic"
                        name="patronymic"
                        type="text"
                        class="form-control"
                    />
                </validate>
                <div class="form-group calendar-new-client__radio">
                    <label class="form-group__label active">Пол</label>
                    <radio
                        v-model="newCustomer.sex"
                        :checked="!isWoman && !isMan"
                        :value="null"
                        name="sex"
                    >
                        Не указан
                    </radio>
                    <radio
                        v-model="newCustomer.sex"
                        :checked="isMan"
                        value="male"
                        name="sex"
                    >
                        Мужской
                    </radio>
                    <radio
                        v-model="newCustomer.sex"
                        :checked="isWoman"
                        value="female"
                        name="sex"
                    >
                        Женский
                    </radio>
                </div>
                <validate class="form-group required-field">
                    <label
                        class="form-group__label"
                        for="new-client__phone"
                        :class="{active: newCustomer.phone}"
                    >
                        Телефон*
                    </label>
                    <input
                        id="new-client__phone"
                        v-mask="getPhoneMask"
                        v-model.trim="newCustomer.phone"
                        class="form-control"
                        required
                        name="phone"
                        type="tel"
                    />
                    <field-messages name="phone" show="$submitted" class="form-control-error">
                        <div slot="required">
                            Поле необходимо заполнить
                        </div>
                    </field-messages>
                </validate>
                <validate class="form-group">
                    <label
                        class="form-group__label"
                        for="new-client__mail"
                        :class="{active: newCustomer.mail}"
                    >
                        E-mail
                    </label>
                    <input
                        id="new-client__mail"
                        v-model.trim="newCustomer.mail"
                        name="mail"
                        type="text"
                        class="form-control"
                    />
                </validate>
            </vue-form>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import VueForm from 'vue-form';
    import { Radio } from 'vue-checkbox-radio';
    import { mask } from 'vue-the-mask';
    import {convertPhoneMask} from '../../../../../../../../../../utils/base-utils';

    Vue.use(VueForm);

    export default {
        name: 'TabNewCustomer',
        props: {},
        components: {
            Radio,
        },
        directives: {
            mask: (el, binding) => {
                if (!binding.value) {
                    return;
                }
                mask(el, binding);
            }
        },
        inject: [
            'organizationInfo',
        ],
        data: () => ({
            newCustomer: {
                secondName: '',
                firstName: '',
                patronymic: '',
                sex: '',
                phone: '',
                email: '',
            },
            formState: {},
        }),
        computed: {
            getPhoneMask() {
                if (!this.organizationInfo.usePhoneMask) return '';
                let { phoneMask } = this.organizationInfo;
                if (phoneMask) {
                    return convertPhoneMask(phoneMask);
                }
                return '8 (xxx) xxx xx-xx';
            },
            isWoman() {
                return this.newCustomer.sex === 'female';
            },
            isMan() {
                return this.newCustomer.sex === 'male';
            }
        },
        methods: {
            submitForm() {
                this.formState.$submitted = true;
                if(this.formState.$invalid) {
                    return;
                }
                this.$emit('add-new-customer', this.newCustomer);
            },
        }
    };
</script>

<style scoped lang="less">

</style>