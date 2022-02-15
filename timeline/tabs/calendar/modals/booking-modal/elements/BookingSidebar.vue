<template>
    <div class="tl-booking-modal-sidebar">
        <div class="tl-booking-modal-sidebar__top">
            <badges
                :current-states="[bookingData.statusCode]"
            />
            <dropdown-btn size="large" type="gray" v-if="isShowDropdown">
                <button class="dropdown-item" @click="showConfirmComplete" v-if="isEnableCompleteBooking">
                    <icon-complete-booking/>
                    <span>Офорить визит</span>
                </button>
                <button class="dropdown-item" @click="copyBooking">
                    <icon-copy/>
                    <span>Копировать</span>
                </button>
                <!--<button class="dropdown-item" @click="moveBooking">
                    <icon-move/>
                    <span>Переместить</span>
                </button>-->
                <button class="dropdown-item remove" @click="showConfirmDelete" v-if="isEnableDeleteBooking">
                    <icon-trash/>
                    <span>Удалить</span>
                </button>
            </dropdown-btn>
        </div>
        <div class="tl-booking-modal-sidebar__staff">
            <avatar
                :source="columnData.labelPhotoUrl"
            />
            <div class="tl-booking-modal-sidebar__staff-info">
                <strong>{{ columnData.label }}</strong>
                <span>{{ columnData.position }}</span>
            </div>
        </div>
        <div class="tl-booking-modal-sidebar__date-info">
            <strong>{{ bookingDate }}</strong>
            <span>{{ bookingTime }}</span>
        </div>
        <booking-nav
            :is-new-booking="isNewBooking"
            :status-code="bookingData.statusCode"
        />
        <transition name="slide-fade-bottom">
            <modal-window-confirm
                v-if="isShowConfirmCompleteModal"
                query-text="Офорить визит?"
                type="info"
                button-caption-success="Оформить"
                @success="completeBooking"
                @cancel="hideConfirmModal"
            />
        </transition>
        <transition name="slide-fade-bottom">
            <modal-window-confirm
                v-if="isShowConfirmDeleteModal"
                query-text="Удалить запись?"
                button-caption-success="Удалить"
                @success="deleteBooking"
                @cancel="hideConfirmModal"
            />
        </transition>
    </div>
</template>

<script>
    import Avatar from '../../../../../../modules/avatar/Avatar';
    import Badges from '../../../../../../elements/Badges';
    import DropdownBtn from '../../../../../../../../components/elements/DropdownBtn';
    import BookingNav from './BookingNav';
    import ModalWindowConfirm from '../../../../../../modules/modal-window/modal-window-confirm';

    import IconCompleteBooking from '../../../../../../../../../assets/img/icons/common/calendar-user.svg';
    import IconCopy from '../../../../../../../../../assets/img/icons/common/copy.svg';
    import IconMove from '../../../../../../../../../assets/img/icons/common/arrows/move-arrows.svg';
    import IconTrash from '../../../../../../../../../assets/img/icons/common/trash.svg';
    import {
        redirectToCompleteVisitPage,
    } from '../../../../../services/timeline-services';
    import {formatDate, getIntervalLimits} from '../../../../../../../../../utils/date-format';

    export default {
        name: 'BookingSidebar',
        props: {
            isNewBooking: {
                type: Boolean,
                required: true,
            },
            columnData: {
                type: Object,
                required: true,
            },
            bookingData: {
                type: Object,
                required: true,
            },
            customerData: {
                type: Object,
                required: true,
            },
        },
        components: {
            Avatar,
            Badges,
            DropdownBtn,
            BookingNav,
            ModalWindowConfirm,
            IconCompleteBooking,
            IconCopy,
            IconMove,
            IconTrash,
        },
        data: () => ({
            isShowConfirmDeleteModal: false,
            isShowConfirmCompleteModal: false,
        }),
        inject: [
            'isDisableBookingDelete',
            'organizationInfo',
        ],
        mounted() {
        },
        computed: {
            bookingDate() {
                return formatDate(this.bookingData.startDateISO, 'EEEEEE - d MMMM');
            },
            bookingTime() {
                return getIntervalLimits(this.bookingData.startDateISO, this.bookingData.endDateISO);
            },
            isShowDropdown() {
                return !this.isNewBooking;
            },
            isEnableDeleteBooking() {
                return !this.isDisableBookingDelete;
            },
            isEnableCompleteBooking() {
                return this.organizationInfo.modeType === 'crm' && this.bookingData.statusCode !== 'visit_completed';
            },
        },
        methods: {
            copyBooking() {
                this.$emit('copy-booking');
            },
            moveBooking() {
                this.$emit('move-booking');
            },
            showConfirmComplete() {
                this.isShowConfirmCompleteModal = true;
            },
            completeBooking() {
                this.hideConfirmModal();
                redirectToCompleteVisitPage(this.bookingData.id, this.customerData.id);
            },
            showConfirmDelete() {
                this.isShowConfirmDeleteModal = true;
            },
            deleteBooking() {
                this.hideConfirmModal();
                this.$emit('delete-booking');
            },
            hideConfirmModal() {
                this.isShowConfirmDeleteModal = false;
                this.isShowConfirmCompleteModal = false;
            },
        }
    };
</script>

<style scoped lang="less">

</style>