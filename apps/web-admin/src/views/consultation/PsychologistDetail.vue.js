/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, reactive, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, User, CircleCheck, Medal, Star, Check, Calendar, Location, InfoFilled, VideoCamera, ChatDotRound, Microphone, OfficeBuilding, Sunrise, Sunny, Moon, Warning } from '@element-plus/icons-vue';
import { getPsychologistDetail, toggleFavorite as apiToggleFavorite, createAppointment, getPsychologistSchedule, payAppointment } from '@/api/psychologist';
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const psychologist = ref(null);
const activeTab = ref('intro');
const isFavorite = ref(false);
const selectedService = ref(null);
const reviews = ref([]);
// 排班相关
const selectedSlot = ref(null);
// 预约表单
const bookingFormVisible = ref(false);
const submitting = ref(false);
const bookingForm = reactive({
    personalSituation: '',
    problems: ''
});
// 时段选择弹窗
const timeSlotDialogVisible = ref(false);
const selectedTimeSlot = ref(null);
const currentSlotDate = ref(null);
// 支付确认对话框
const paymentDialogVisible = ref(false);
const paymentLoading = ref(false);
const pendingAppointment = ref(null);
const timeSlotPeriods = computed(() => {
    const slots = getDaySlots(currentSlotDate.value);
    const periods = [
        { key: 'morning', name: '上午', slots: [] },
        { key: 'afternoon', name: '下午', slots: [] },
        { key: 'evening', name: '晚上', slots: [] }
    ];
    slots.forEach(slot => {
        const [morningPeriod, afternoonPeriod, eveningPeriod] = periods;
        if (slot.timeSlot?.toLowerCase().includes('morning')) {
            morningPeriod.slots.push(slot);
        }
        else if (slot.timeSlot?.toLowerCase().includes('afternoon')) {
            afternoonPeriod.slots.push(slot);
        }
        else {
            eveningPeriod.slots.push(slot);
        }
    });
    return periods;
});
// 检查所有时段是否为空
const allSlotsEmpty = computed(() => {
    return timeSlotPeriods.value.every(p => p.slots.length === 0);
});
// 选择时段
const selectTimeSlot = (slot) => {
    selectedTimeSlot.value = slot;
};
// 确认时段选择
const confirmTimeSlot = () => {
    if (selectedTimeSlot.value && currentSlotDate.value) {
        selectSlot(currentSlotDate.value, selectedTimeSlot.value);
        timeSlotDialogVisible.value = false;
        selectedTimeSlot.value = null;
    }
};
const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
// 服务类型映射
const serviceTypeMap = {
    text: '图文咨询',
    video: '线上咨询',
    voice: '语音咨询',
    offline: '线下面询',
    TEXT: '图文咨询',
    VIDEO: '线上咨询',
    VOICE: '语音咨询',
    OFFLINE: '线下面询'
};
const getServiceTypeName = (type) => serviceTypeMap[type] || type;
// 获取领域图标HTML
const getFieldIcon = (icon) => {
    if (!icon)
        return '<span>🎯</span>';
    // 如果是SVG直接返回
    if (icon.startsWith('<'))
        return icon;
    // 如果是URL或图标类名，包装成span
    return `<span>${icon}</span>`;
};
const getServiceIcon = (type) => {
    const icons = {
        text: ChatDotRound,
        video: VideoCamera,
        voice: Microphone,
        offline: OfficeBuilding
    };
    return icons[type] || ChatDotRound;
};
// 只显示线上和线下服务，语音咨询合并到线上
const displayedServices = computed(() => {
    if (!psychologist.value?.services)
        return [];
    const onlineService = psychologist.value.services.find((s) => (s.serviceType === 'video' || s.serviceType === 'VIDEO' || s.serviceType === 'voice' || s.serviceType === 'VOICE'));
    const offlineService = psychologist.value.services.find((s) => s.serviceType === 'offline' || s.serviceType === 'OFFLINE');
    const result = [];
    // 判断线上服务是否可用（video和voice都禁用则线上不可用）
    const onlineEnabled = onlineService && onlineService.status !== 0;
    if (onlineEnabled) {
        result.push({
            id: 'online',
            serviceType: 'online',
            displayName: '线上咨询',
            price: onlineService.price,
            disabled: false
        });
    }
    else {
        result.push({
            id: 'online',
            serviceType: 'online',
            displayName: '线上咨询',
            price: onlineService?.price || 0,
            disabled: true
        });
    }
    // 判断线下面询是否可用
    const offlineEnabled = offlineService && offlineService.status !== 0;
    if (offlineEnabled) {
        result.push({
            id: 'offline',
            serviceType: 'offline',
            displayName: '线下面询',
            price: offlineService.price,
            disabled: false
        });
    }
    else {
        result.push({
            id: 'offline',
            serviceType: 'offline',
            displayName: '线下面询',
            price: offlineService?.price || 0,
            disabled: true
        });
    }
    return result;
});
// 格式化价格显示
const formatPrice = (service) => {
    if (!service)
        return '0';
    const price = service.price;
    if (price === null || price === undefined)
        return '0';
    // 如果已经是数字或能转成数字
    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(numPrice))
        return '0';
    return numPrice.toFixed(2);
};
// 时间段标签
const timeSlotLabels = {
    MORNING: '上午',
    AFTERNOON: '下午',
    EVENING: '晚上',
    morning: '上午',
    afternoon: '下午',
    evening: '晚上'
};
const getTimeSlotLabel = (slot) => timeSlotLabels[slot] || slot;
// 计算近7天日程
const scheduleDays = computed(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // 生成近7天的日期
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push(date);
    }
    return days;
});
// 计算月份标签（显示近7天的范围）
const currentMonthLabel = computed(() => {
    if (scheduleDays.value.length === 0)
        return '';
    const start = scheduleDays.value[0];
    const end = scheduleDays.value[scheduleDays.value.length - 1];
    if (!start || !end)
        return '';
    return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
});
// 获取星期几名称
const getWeekDayName = (day) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[day.getDay()];
};
// 获取时段状态样式类
const getSlotStatusClass = (slot) => {
    if (slot.status === 0)
        return 'available';
    if (slot.status === 1)
        return 'booked';
    return 'rest';
};
// 选择服务后自动滚动到预约咨询
const selectService = (service) => {
    if (service.disabled) {
        ElMessage.warning('心理咨询师暂不支持该服务类型');
        return;
    }
    selectedService.value = service;
    // 如果当前在服务与价格标签，自动滚动到预约咨询
    if (activeTab.value === 'services') {
        setTimeout(() => {
            activeTab.value = 'schedule';
            nextTick(() => {
                const tabsEl = document.querySelector('.detail-tabs');
                if (tabsEl) {
                    tabsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }, 200);
    }
};
// 获取某天的排班
const getDaySlots = (day) => {
    if (!day)
        return [];
    if (!psychologist.value?.schedules || psychologist.value.schedules.length === 0) {
        return [];
    }
    // 标准化日期格式进行匹配
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const date = String(day.getDate()).padStart(2, '0');
    const targetDateStr = `${year}-${month}-${date}`;
    // 查找该日期的排班 - 支持多种格式
    const daySchedule = psychologist.value.schedules.find((s) => {
        const scheduleDate = s.date || s.scheduleDate;
        if (!scheduleDate)
            return false;
        // 如果是 Date 对象
        if (scheduleDate instanceof Date) {
            const sd = scheduleDate;
            const sdStr = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}-${String(sd.getDate()).padStart(2, '0')}`;
            return sdStr === targetDateStr;
        }
        // 如果是字符串（后端 LocalDate 返回格式，如 "2026-04-15"）
        if (typeof scheduleDate === 'string') {
            const sdStr = scheduleDate.slice(0, 10);
            return sdStr === targetDateStr;
        }
        // 如果是对象（可能是 Jackson 序列化后的 LocalDate）
        if (typeof scheduleDate === 'object' && scheduleDate.year !== undefined) {
            const sdStr = `${scheduleDate.year}-${String(scheduleDate.month).padStart(2, '0')}-${String(scheduleDate.dayOfMonth).padStart(2, '0')}`;
            return sdStr === targetDateStr;
        }
        return false;
    });
    if (!daySchedule)
        return [];
    // 处理 slots 可能是数组或需要转换的情况
    let slots = daySchedule.slots;
    if (!slots) {
        // 如果没有 slots，可能整个 daySchedule 就是一条排班记录
        if (daySchedule.timeSlot) {
            return [{
                    timeSlot: daySchedule.timeSlot || daySchedule.timeSlot,
                    status: getSlotStatus(daySchedule),
                    id: daySchedule.id,
                    bookedCount: daySchedule.bookedCount || daySchedule.booked_count || 0,
                    maxAppointments: daySchedule.maxAppointments || daySchedule.max_appointments || 1
                }];
        }
        return [];
    }
    if (!Array.isArray(slots))
        return [];
    return slots.map((slot) => ({
        timeSlot: slot.timeSlot || slot.time_slot || 'MORNING',
        status: getSlotStatus(slot),
        id: slot.id,
        bookedCount: slot.bookedCount || slot.booked_count || 0,
        maxAppointments: slot.maxAppointments || slot.max_appointments || 1
    }));
};
const getSlotStatus = (slot) => {
    if (!slot)
        return 2; // 无数据=休息
    const status = slot.status;
    if (status === 0)
        return 2; // 休息
    if (status === 1) {
        // 可预约，但需要检查是否约满
        const bookedCount = slot.bookedCount || slot.booked_count || 0;
        const maxAppointments = slot.maxAppointments || slot.max_appointments || 1;
        if (bookedCount >= maxAppointments)
            return 1; // 已约满
        return 0; // 可预约
    }
    return 2; // 默认休息
};
const isPastDay = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day < today;
};
const isToday = (day) => {
    const today = new Date();
    return day.getDate() === today.getDate() &&
        day.getMonth() === today.getMonth() &&
        day.getFullYear() === today.getFullYear();
};
const formatSelectedDate = computed(() => {
    if (!selectedSlot.value?.date)
        return '';
    const d = new Date(selectedSlot.value.date);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
});
const selectSlot = (day, slot) => {
    selectedSlot.value = {
        date: day.toISOString().slice(0, 10),
        timeSlot: slot.timeSlot,
        scheduleId: slot.id || getScheduleId(day, slot.timeSlot)
    };
    ElMessage.success(`已选择：${day.getMonth() + 1}月${day.getDate()}日 ${getTimeSlotLabel(slot.timeSlot)}`);
};
const handleDayClick = (day) => {
    const slots = getDaySlots(day);
    if (slots.length === 0) {
        ElMessage.info('该日期暂无排班');
        return;
    }
    const availableSlots = slots.filter(s => s.status === 0);
    if (availableSlots.length === 0) {
        ElMessage.info('该日期无可预约时段');
        return;
    }
    // 打开时段选择弹窗
    currentSlotDate.value = day;
    selectedTimeSlot.value = null;
    timeSlotDialogVisible.value = true;
};
const hasAvailableSlot = (day) => {
    const slots = getDaySlots(day);
    return slots.some(s => s.status === 0);
};
const getScheduleId = (day, timeSlot) => {
    const dateStr = day.toISOString().slice(0, 10);
    const daySchedule = psychologist.value?.schedules?.find((s) => {
        const scheduleDate = s.date || s.scheduleDate;
        if (scheduleDate instanceof Date) {
            return scheduleDate.toISOString().slice(0, 10) === dateStr;
        }
        return scheduleDate === dateStr;
    });
    if (!daySchedule || !daySchedule.slots)
        return null;
    const slot = daySchedule.slots.find((s) => s.timeSlot === timeSlot);
    return slot?.id;
};
const parseJsonArray = (jsonStr) => {
    if (!jsonStr)
        return [];
    try {
        const parsed = JSON.parse(jsonStr);
        // 如果是数组直接返回
        if (Array.isArray(parsed))
            return parsed;
        // 如果是字符串，尝试按逗号分隔
        if (typeof parsed === 'string')
            return parsed.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    }
    catch {
        // 如果JSON.parse失败，可能是逗号分隔的字符串
        if (typeof jsonStr === 'string' && jsonStr.includes(',')) {
            return jsonStr.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
    }
};
const formatDate = (dateStr) => {
    if (!dateStr)
        return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const goBack = () => {
    router.back();
};
const scrollToSchedule = () => {
    activeTab.value = 'services';
    selectedService.value = null; // 清空选择，让用户自己选择
};
const toggleFavorite = async () => {
    if (!psychologist.value)
        return;
    try {
        const res = await apiToggleFavorite(psychologist.value.id);
        if (res.code === 200) {
            isFavorite.value = !isFavorite.value;
            ElMessage.success(isFavorite.value ? '收藏成功' : '取消收藏');
        }
    }
    catch (e) {
        ElMessage.error('操作失败');
    }
};
const showBookingForm = () => {
    if (!selectedService.value || !selectedSlot.value) {
        ElMessage.warning('请选择服务类型和时间');
        return;
    }
    if (selectedService.value.disabled) {
        ElMessage.warning('心理咨询师暂不支持该服务类型');
        return;
    }
    bookingForm.personalSituation = '';
    bookingForm.problems = '';
    bookingFormVisible.value = true;
};
// 提交预约表单（仅保存信息，弹出支付对话框）
const submitBooking = async () => {
    if (!bookingForm.problems.trim()) {
        ElMessage.warning('请填写主要问题');
        return;
    }
    submitting.value = true;
    try {
        // 将显示的 'online' 类型映射回后端可识别的 'video'
        let serviceType = selectedService.value.serviceType;
        if (serviceType === 'online') {
            serviceType = 'video';
        }
        // 保存预约信息到待支付对象（此时不发请求）
        pendingAppointment.value = {
            psychologistId: psychologist.value.id,
            scheduleId: selectedSlot.value.scheduleId,
            serviceType: serviceType,
            personalSituation: bookingForm.personalSituation,
            problems: bookingForm.problems,
            serviceName: selectedService.value.displayName,
            appointmentTime: formatSelectedDate.value + ' ' + getTimeSlotLabel(selectedSlot.value.timeSlot),
            price: formatPrice(selectedService.value)
        };
        bookingFormVisible.value = false;
        paymentDialogVisible.value = true;
    }
    catch (e) {
        ElMessage.error(e.message || '操作失败');
    }
    finally {
        submitting.value = false;
    }
};
// 取消支付
const handlePaymentCancel = () => {
    paymentDialogVisible.value = false;
    pendingAppointment.value = null;
    ElMessage.info('已取消预约');
};
// 确认支付 - 支付成功后才发送预约请求
const handlePaymentConfirm = async () => {
    if (!pendingAppointment.value?.psychologistId) {
        ElMessage.error('预约信息不存在');
        return;
    }
    paymentLoading.value = true;
    try {
        // 支付成功后发送预约请求
        const appointmentRes = await createAppointment({
            psychologistId: pendingAppointment.value.psychologistId,
            scheduleId: pendingAppointment.value.scheduleId,
            serviceType: pendingAppointment.value.serviceType,
            personalSituation: pendingAppointment.value.personalSituation,
            problems: pendingAppointment.value.problems
        });
        if (appointmentRes.code === 200) {
            // 预约创建成功后，调用支付接口
            const appointmentId = appointmentRes.data?.appointmentId || appointmentRes.data;
            if (appointmentId) {
                await payAppointment(appointmentId);
            }
            ElMessage.success('预约成功！');
            paymentDialogVisible.value = false;
            pendingAppointment.value = null;
            // 跳转到我的预约页面
            router.push('/my-psychology');
        }
        else {
            ElMessage.error(appointmentRes.message || '预约失败');
        }
    }
    catch (e) {
        ElMessage.error(e.message || '预约失败');
    }
    finally {
        paymentLoading.value = false;
    }
};
const fetchDetail = async () => {
    loading.value = true;
    const id = route.params.id;
    try {
        const psychologistId = Number(Array.isArray(id) ? id[0] : id);
        if (!Number.isFinite(psychologistId)) {
            ElMessage.error('心理咨询师ID无效');
            return;
        }
        const res = await getPsychologistDetail(psychologistId);
        if (res.code === 200) {
            psychologist.value = res.data;
            isFavorite.value = res.data.isFavorited || false;
            // 从 displayedServices 中设置默认选中的服务（确保有正确的 id）
            // 使用 nextTick 确保 computed 属性已更新
            await nextTick();
            if (displayedServices.value.length > 0) {
                selectedService.value = displayedServices.value[0];
            }
            // 获取排班数据
            await fetchSchedules();
        }
    }
    catch (e) {
        ElMessage.error('获取详情失败');
    }
    finally {
        loading.value = false;
    }
};
// 获取排班数据
const schedulesLoading = ref(false);
const fetchSchedules = async () => {
    if (!psychologist.value)
        return;
    schedulesLoading.value = true;
    try {
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const startDate = today.toISOString().slice(0, 10);
        const endDate = nextMonth.toISOString().slice(0, 10);
        console.log('获取排班数据:', {
            psychologistId: psychologist.value.id,
            startDate,
            endDate
        });
        const res = await getPsychologistSchedule(psychologist.value.id, startDate, endDate);
        if (res.code === 200) {
            console.log('排班数据:', res.data);
            psychologist.value.schedules = res.data || [];
        }
        else {
            console.error('获取排班失败:', res.message);
            ElMessage.warning('获取排班数据失败，请刷新重试');
        }
    }
    catch (e) {
        console.error('获取排班失败', e);
        ElMessage.error('获取排班数据失败');
    }
    finally {
        schedulesLoading.value = false;
    }
};
onMounted(() => {
    fetchDetail();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars2']} */ ;
/** @type {__VLS_StyleScopedClasses['stars2']} */ ;
/** @type {__VLS_StyleScopedClasses['stars3']} */ ;
/** @type {__VLS_StyleScopedClasses['stars3']} */ ;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars2']} */ ;
/** @type {__VLS_StyleScopedClasses['stars3']} */ ;
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['online-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['verified-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['active-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['offline-location']} */ ;
/** @type {__VLS_StyleScopedClasses['offline-address-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['offline-address-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['book-now-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['day-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['day-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['day-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['available']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-header']} */ ;
/** @type {__VLS_StyleScopedClasses['week-header']} */ ;
/** @type {__VLS_StyleScopedClasses['week-day']} */ ;
/** @type {__VLS_StyleScopedClasses['day-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['day-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['day-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['day-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['today']} */ ;
/** @type {__VLS_StyleScopedClasses['day-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['day-slots']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['available']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['no-slots']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-date-display']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-date-display']} */ ;
/** @type {__VLS_StyleScopedClasses['time-slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['available']} */ ;
/** @type {__VLS_StyleScopedClasses['time-slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['booked']} */ ;
/** @type {__VLS_StyleScopedClasses['time-slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['time-slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
/** @type {__VLS_StyleScopedClasses['time-slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['available']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-status']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['service-name']} */ ;
/** @type {__VLS_StyleScopedClasses['date-text']} */ ;
/** @type {__VLS_StyleScopedClasses['booking-notice']} */ ;
/** @type {__VLS_StyleScopedClasses['booking-notice']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['booked']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['rest']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['available']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['booked']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['rest']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-info']} */ ;
/** @type {__VLS_StyleScopedClasses['booking-notice']} */ ;
/** @type {__VLS_StyleScopedClasses['booking-notice']} */ ;
/** @type {__VLS_StyleScopedClasses['info-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
/** @type {__VLS_StyleScopedClasses['tags-row']} */ ;
/** @type {__VLS_StyleScopedClasses['language-row']} */ ;
/** @type {__VLS_StyleScopedClasses['field-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-detail-container']} */ ;
/** @type {__VLS_StyleScopedClasses['field-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['certifications-list']} */ ;
/** @type {__VLS_StyleScopedClasses['no-services']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['payment-header']} */ ;
/** @type {__VLS_StyleScopedClasses['order-row']} */ ;
/** @type {__VLS_StyleScopedClasses['order-value']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psychologist-detail-container" },
});
/** @type {__VLS_StyleScopedClasses['psychologist-detail-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stars-background" },
});
/** @type {__VLS_StyleScopedClasses['stars-background']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stars" },
});
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stars2" },
});
/** @type {__VLS_StyleScopedClasses['stars2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stars3" },
});
/** @type {__VLS_StyleScopedClasses['stars3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "planet planet-1" },
});
/** @type {__VLS_StyleScopedClasses['planet']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "planet planet-2" },
});
/** @type {__VLS_StyleScopedClasses['planet']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "comet" },
});
/** @type {__VLS_StyleScopedClasses['comet']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "back-nav" },
});
/** @type {__VLS_StyleScopedClasses['back-nav']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    link: true,
    ...{ class: "back-btn" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    link: true,
    ...{ class: "back-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.goBack) });
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const { default: __VLS_13 } = __VLS_11.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.ArrowLeft} */
ArrowLeft;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
// @ts-ignore
[goBack,];
var __VLS_11;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "detail-content" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
if (__VLS_ctx.psychologist) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-card cosmic-card" },
    });
    /** @type {__VLS_StyleScopedClasses['info-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-header" },
    });
    /** @type {__VLS_StyleScopedClasses['info-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "avatar-section" },
    });
    /** @type {__VLS_StyleScopedClasses['avatar-section']} */ ;
    let __VLS_19;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        size: (130),
        src: (__VLS_ctx.psychologist.headPath),
        ...{ class: "psychologist-avatar cosmic-avatar" },
    }));
    const __VLS_21 = __VLS_20({
        size: (130),
        src: (__VLS_ctx.psychologist.headPath),
        ...{ class: "psychologist-avatar cosmic-avatar" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    /** @type {__VLS_StyleScopedClasses['psychologist-avatar']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-avatar']} */ ;
    const { default: __VLS_24 } = __VLS_22.slots;
    let __VLS_25;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        size: (60),
    }));
    const __VLS_27 = __VLS_26({
        size: (60),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    const { default: __VLS_30 } = __VLS_28.slots;
    let __VLS_31;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({}));
    const __VLS_33 = __VLS_32({}, ...__VLS_functionalComponentArgsRest(__VLS_32));
    // @ts-ignore
    [vLoading, loading, psychologist, psychologist,];
    var __VLS_28;
    // @ts-ignore
    [];
    var __VLS_22;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "online-indicator" },
        ...{ class: ({ online: __VLS_ctx.psychologist.onlineStatus === 1 }) },
    });
    /** @type {__VLS_StyleScopedClasses['online-indicator']} */ ;
    /** @type {__VLS_StyleScopedClasses['online']} */ ;
    (__VLS_ctx.psychologist.onlineStatus === 1 ? '在线' : '离线');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "basic-info" },
    });
    /** @type {__VLS_StyleScopedClasses['basic-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "name-row" },
    });
    /** @type {__VLS_StyleScopedClasses['name-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "psychologist-name" },
    });
    /** @type {__VLS_StyleScopedClasses['psychologist-name']} */ ;
    (__VLS_ctx.psychologist.realName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "status-badges" },
    });
    /** @type {__VLS_StyleScopedClasses['status-badges']} */ ;
    if (__VLS_ctx.psychologist.auditStatus === 3) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "verified-badge" },
        });
        /** @type {__VLS_StyleScopedClasses['verified-badge']} */ ;
        let __VLS_36;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({}));
        const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
        const { default: __VLS_41 } = __VLS_39.slots;
        let __VLS_42;
        /** @ts-ignore @type {typeof __VLS_components.CircleCheck} */
        CircleCheck;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({}));
        const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
        // @ts-ignore
        [psychologist, psychologist, psychologist, psychologist,];
        var __VLS_39;
    }
    if (__VLS_ctx.psychologist.status === 1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "active-badge" },
        });
        /** @type {__VLS_StyleScopedClasses['active-badge']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stats-row" },
    });
    /** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    (__VLS_ctx.psychologist.yearsExperience);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    (__VLS_ctx.psychologist.consultationCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    (__VLS_ctx.psychologist.ratingScore);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    (__VLS_ctx.psychologist.ratingCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "tags-row" },
    });
    /** @type {__VLS_StyleScopedClasses['tags-row']} */ ;
    for (const [field] of __VLS_vFor((__VLS_ctx.psychologist.fields))) {
        let __VLS_47;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
            ...{ class: "field-tag" },
            key: (field.id),
        }));
        const __VLS_49 = __VLS_48({
            ...{ class: "field-tag" },
            key: (field.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        /** @type {__VLS_StyleScopedClasses['field-tag']} */ ;
        const { default: __VLS_52 } = __VLS_50.slots;
        (field.name);
        // @ts-ignore
        [psychologist, psychologist, psychologist, psychologist, psychologist, psychologist,];
        var __VLS_50;
        // @ts-ignore
        [];
    }
    for (const [q] of __VLS_vFor((__VLS_ctx.psychologist.qualifications))) {
        let __VLS_53;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
            ...{ class: "qualification-tag" },
            key: (q.id),
            type: "warning",
        }));
        const __VLS_55 = __VLS_54({
            ...{ class: "qualification-tag" },
            key: (q.id),
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        /** @type {__VLS_StyleScopedClasses['qualification-tag']} */ ;
        const { default: __VLS_58 } = __VLS_56.slots;
        let __VLS_59;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({}));
        const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
        const { default: __VLS_64 } = __VLS_62.slots;
        let __VLS_65;
        /** @ts-ignore @type {typeof __VLS_components.Medal} */
        Medal;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({}));
        const __VLS_67 = __VLS_66({}, ...__VLS_functionalComponentArgsRest(__VLS_66));
        // @ts-ignore
        [psychologist,];
        var __VLS_62;
        (q.name);
        // @ts-ignore
        [];
        var __VLS_56;
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.psychologist.languages) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "language-row" },
        });
        /** @type {__VLS_StyleScopedClasses['language-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "language-label" },
        });
        /** @type {__VLS_StyleScopedClasses['language-label']} */ ;
        for (const [lang] of __VLS_vFor((__VLS_ctx.parseJsonArray(__VLS_ctx.psychologist.languages)))) {
            let __VLS_70;
            /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
            elTag;
            // @ts-ignore
            const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
                size: "large",
                ...{ class: "language-tag" },
                key: (lang),
            }));
            const __VLS_72 = __VLS_71({
                size: "large",
                ...{ class: "language-tag" },
                key: (lang),
            }, ...__VLS_functionalComponentArgsRest(__VLS_71));
            /** @type {__VLS_StyleScopedClasses['language-tag']} */ ;
            const { default: __VLS_75 } = __VLS_73.slots;
            (lang);
            // @ts-ignore
            [psychologist, psychologist, parseJsonArray,];
            var __VLS_73;
            // @ts-ignore
            [];
        }
    }
    if (__VLS_ctx.psychologist.offlineRegion || __VLS_ctx.psychologist.offlineAddress) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "offline-info" },
        });
        /** @type {__VLS_StyleScopedClasses['offline-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "offline-location" },
        });
        /** @type {__VLS_StyleScopedClasses['offline-location']} */ ;
        let __VLS_76;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({}));
        const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
        const { default: __VLS_81 } = __VLS_79.slots;
        let __VLS_82;
        /** @ts-ignore @type {typeof __VLS_components.Location} */
        Location;
        // @ts-ignore
        const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({}));
        const __VLS_84 = __VLS_83({}, ...__VLS_functionalComponentArgsRest(__VLS_83));
        // @ts-ignore
        [psychologist, psychologist,];
        var __VLS_79;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "offline-label" },
        });
        /** @type {__VLS_StyleScopedClasses['offline-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "offline-address-detail" },
        });
        /** @type {__VLS_StyleScopedClasses['offline-address-detail']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "region" },
        });
        /** @type {__VLS_StyleScopedClasses['region']} */ ;
        (__VLS_ctx.psychologist.offlineRegion);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "address" },
        });
        /** @type {__VLS_StyleScopedClasses['address']} */ ;
        (__VLS_ctx.psychologist.offlineAddress);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "action-section" },
    });
    /** @type {__VLS_StyleScopedClasses['action-section']} */ ;
    let __VLS_87;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.isFavorite ? __VLS_ctx.Star : 'Star'),
        type: (__VLS_ctx.isFavorite ? 'warning' : 'default'),
        ...{ class: "favorite-btn" },
    }));
    const __VLS_89 = __VLS_88({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.isFavorite ? __VLS_ctx.Star : 'Star'),
        type: (__VLS_ctx.isFavorite ? 'warning' : 'default'),
        ...{ class: "favorite-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    let __VLS_92;
    const __VLS_93 = ({ click: {} },
        { onClick: (__VLS_ctx.toggleFavorite) });
    /** @type {__VLS_StyleScopedClasses['favorite-btn']} */ ;
    const { default: __VLS_94 } = __VLS_90.slots;
    (__VLS_ctx.isFavorite ? '已收藏' : '收藏');
    // @ts-ignore
    [psychologist, psychologist, isFavorite, isFavorite, isFavorite, Star, toggleFavorite,];
    var __VLS_90;
    var __VLS_91;
    let __VLS_95;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "book-now-btn cosmic-btn-primary cosmic-btn" },
    }));
    const __VLS_97 = __VLS_96({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "book-now-btn cosmic-btn-primary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    let __VLS_100;
    const __VLS_101 = ({ click: {} },
        { onClick: (__VLS_ctx.scrollToSchedule) });
    /** @type {__VLS_StyleScopedClasses['book-now-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_102 } = __VLS_98.slots;
    // @ts-ignore
    [scrollToSchedule,];
    var __VLS_98;
    var __VLS_99;
    let __VLS_103;
    /** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
    elTabs;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
        modelValue: (__VLS_ctx.activeTab),
        ...{ class: "detail-tabs cosmic-tabs" },
    }));
    const __VLS_105 = __VLS_104({
        modelValue: (__VLS_ctx.activeTab),
        ...{ class: "detail-tabs cosmic-tabs" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    /** @type {__VLS_StyleScopedClasses['detail-tabs']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-tabs']} */ ;
    const { default: __VLS_108 } = __VLS_106.slots;
    let __VLS_109;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
        label: "个人简介",
        name: "intro",
    }));
    const __VLS_111 = __VLS_110({
        label: "个人简介",
        name: "intro",
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    const { default: __VLS_114 } = __VLS_112.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "intro-content" },
    });
    /** @type {__VLS_StyleScopedClasses['intro-content']} */ ;
    if (__VLS_ctx.psychologist.introduction) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "intro-section" },
        });
        /** @type {__VLS_StyleScopedClasses['intro-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "section-title" },
        });
        /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "intro-text" },
        });
        /** @type {__VLS_StyleScopedClasses['intro-text']} */ ;
        (__VLS_ctx.psychologist.introduction);
    }
    if (__VLS_ctx.psychologist.educationBackground) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "intro-section" },
        });
        /** @type {__VLS_StyleScopedClasses['intro-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "section-title" },
        });
        /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "intro-text" },
        });
        /** @type {__VLS_StyleScopedClasses['intro-text']} */ ;
        (__VLS_ctx.psychologist.educationBackground);
    }
    if (__VLS_ctx.psychologist.trainingExperience) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "intro-section" },
        });
        /** @type {__VLS_StyleScopedClasses['intro-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "section-title" },
        });
        /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "intro-text" },
        });
        /** @type {__VLS_StyleScopedClasses['intro-text']} */ ;
        (__VLS_ctx.psychologist.trainingExperience);
    }
    if (__VLS_ctx.psychologist.certifications) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "intro-section" },
        });
        /** @type {__VLS_StyleScopedClasses['intro-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "section-title" },
        });
        /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "certifications-list" },
        });
        /** @type {__VLS_StyleScopedClasses['certifications-list']} */ ;
        for (const [cert] of __VLS_vFor((__VLS_ctx.parseJsonArray(__VLS_ctx.psychologist.certifications)))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "cert-item" },
                key: (cert),
            });
            /** @type {__VLS_StyleScopedClasses['cert-item']} */ ;
            let __VLS_115;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({}));
            const __VLS_117 = __VLS_116({}, ...__VLS_functionalComponentArgsRest(__VLS_116));
            const { default: __VLS_120 } = __VLS_118.slots;
            let __VLS_121;
            /** @ts-ignore @type {typeof __VLS_components.CircleCheck} */
            CircleCheck;
            // @ts-ignore
            const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({}));
            const __VLS_123 = __VLS_122({}, ...__VLS_functionalComponentArgsRest(__VLS_122));
            // @ts-ignore
            [psychologist, psychologist, psychologist, psychologist, psychologist, psychologist, psychologist, psychologist, parseJsonArray, activeTab,];
            var __VLS_118;
            (cert);
            // @ts-ignore
            [];
        }
    }
    // @ts-ignore
    [];
    var __VLS_112;
    let __VLS_126;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
        label: "擅长领域",
        name: "fields",
    }));
    const __VLS_128 = __VLS_127({
        label: "擅长领域",
        name: "fields",
    }, ...__VLS_functionalComponentArgsRest(__VLS_127));
    const { default: __VLS_131 } = __VLS_129.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fields-content" },
    });
    /** @type {__VLS_StyleScopedClasses['fields-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['field-grid']} */ ;
    for (const [field] of __VLS_vFor((__VLS_ctx.psychologist.fields))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "field-card cosmic-card" },
            key: (field.id),
        });
        /** @type {__VLS_StyleScopedClasses['field-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "field-icon" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.getFieldIcon(field.icon)) }, null, null);
        /** @type {__VLS_StyleScopedClasses['field-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
            ...{ class: "field-name" },
        });
        /** @type {__VLS_StyleScopedClasses['field-name']} */ ;
        (field.name || field.fieldName || '未知领域');
        // @ts-ignore
        [psychologist, getFieldIcon,];
    }
    if (!__VLS_ctx.psychologist.fields?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-text" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    }
    // @ts-ignore
    [psychologist,];
    var __VLS_129;
    let __VLS_132;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({
        label: "服务与价格",
        name: "services",
    }));
    const __VLS_134 = __VLS_133({
        label: "服务与价格",
        name: "services",
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    const { default: __VLS_137 } = __VLS_135.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "services-content" },
    });
    /** @type {__VLS_StyleScopedClasses['services-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "service-cards" },
    });
    /** @type {__VLS_StyleScopedClasses['service-cards']} */ ;
    for (const [service] of __VLS_vFor((__VLS_ctx.displayedServices))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.psychologist))
                        return;
                    __VLS_ctx.selectService(service);
                    // @ts-ignore
                    [displayedServices, selectService,];
                } },
            ...{ class: "service-card cosmic-card" },
            ...{ class: ({ selected: __VLS_ctx.selectedService?.id === service.id, 'service-disabled': service.disabled }) },
            key: (service.id),
        });
        /** @type {__VLS_StyleScopedClasses['service-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['selected']} */ ;
        /** @type {__VLS_StyleScopedClasses['service-disabled']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "service-info" },
        });
        /** @type {__VLS_StyleScopedClasses['service-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
            ...{ class: "service-name" },
        });
        /** @type {__VLS_StyleScopedClasses['service-name']} */ ;
        (service.displayName);
        if (service.description) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "service-desc" },
            });
            /** @type {__VLS_StyleScopedClasses['service-desc']} */ ;
            (service.description);
        }
        if (service.disabled) {
            let __VLS_138;
            /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
            elTag;
            // @ts-ignore
            const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
                type: "info",
                size: "small",
            }));
            const __VLS_140 = __VLS_139({
                type: "info",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_139));
            const { default: __VLS_143 } = __VLS_141.slots;
            // @ts-ignore
            [selectedService,];
            var __VLS_141;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "service-price" },
        });
        /** @type {__VLS_StyleScopedClasses['service-price']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "price-currency" },
        });
        /** @type {__VLS_StyleScopedClasses['price-currency']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "price-amount" },
        });
        /** @type {__VLS_StyleScopedClasses['price-amount']} */ ;
        (__VLS_ctx.formatPrice(service));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "price-unit" },
        });
        /** @type {__VLS_StyleScopedClasses['price-unit']} */ ;
        if (__VLS_ctx.selectedService?.id === service.id && !service.disabled) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "select-indicator" },
            });
            /** @type {__VLS_StyleScopedClasses['select-indicator']} */ ;
            let __VLS_144;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({}));
            const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
            const { default: __VLS_149 } = __VLS_147.slots;
            let __VLS_150;
            /** @ts-ignore @type {typeof __VLS_components.Check} */
            Check;
            // @ts-ignore
            const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({}));
            const __VLS_152 = __VLS_151({}, ...__VLS_functionalComponentArgsRest(__VLS_151));
            // @ts-ignore
            [selectedService, formatPrice,];
            var __VLS_147;
        }
        // @ts-ignore
        [];
    }
    if (!__VLS_ctx.displayedServices || __VLS_ctx.displayedServices.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "no-services" },
        });
        /** @type {__VLS_StyleScopedClasses['no-services']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    }
    // @ts-ignore
    [displayedServices, displayedServices,];
    var __VLS_135;
    let __VLS_155;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155({
        label: "预约咨询",
        name: "schedule",
    }));
    const __VLS_157 = __VLS_156({
        label: "预约咨询",
        name: "schedule",
    }, ...__VLS_functionalComponentArgsRest(__VLS_156));
    const { default: __VLS_160 } = __VLS_158.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "schedule-content" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.schedulesLoading) }, null, null);
    /** @type {__VLS_StyleScopedClasses['schedule-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "schedule-header" },
    });
    /** @type {__VLS_StyleScopedClasses['schedule-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "current-month" },
    });
    /** @type {__VLS_StyleScopedClasses['current-month']} */ ;
    (__VLS_ctx.currentMonthLabel);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "week-view" },
    });
    /** @type {__VLS_StyleScopedClasses['week-view']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "week-header" },
    });
    /** @type {__VLS_StyleScopedClasses['week-header']} */ ;
    for (const [day] of __VLS_vFor((__VLS_ctx.scheduleDays))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "week-day" },
            key: (day.toISOString()),
        });
        /** @type {__VLS_StyleScopedClasses['week-day']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "day-week" },
        });
        /** @type {__VLS_StyleScopedClasses['day-week']} */ ;
        (__VLS_ctx.getWeekDayName(day));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "day-date" },
        });
        /** @type {__VLS_StyleScopedClasses['day-date']} */ ;
        (day.getDate());
        // @ts-ignore
        [vLoading, schedulesLoading, currentMonthLabel, scheduleDays, getWeekDayName,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "week-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['week-grid']} */ ;
    for (const [day] of __VLS_vFor((__VLS_ctx.scheduleDays))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.psychologist))
                        return;
                    !__VLS_ctx.isPastDay(day) && __VLS_ctx.handleDayClick(day);
                    // @ts-ignore
                    [scheduleDays, isPastDay, handleDayClick,];
                } },
            key: (day.toISOString()),
            ...{ class: "day-cell" },
            ...{ class: ({
                    disabled: __VLS_ctx.isPastDay(day),
                    today: __VLS_ctx.isToday(day),
                    'has-available': __VLS_ctx.hasAvailableSlot(day)
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['day-cell']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled']} */ ;
        /** @type {__VLS_StyleScopedClasses['today']} */ ;
        /** @type {__VLS_StyleScopedClasses['has-available']} */ ;
        if (__VLS_ctx.getDaySlots(day).length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "day-slots" },
            });
            /** @type {__VLS_StyleScopedClasses['day-slots']} */ ;
            for (const [slot] of __VLS_vFor((__VLS_ctx.getDaySlots(day).filter(s => s.status === 0).slice(0, 3)))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (slot.timeSlot),
                    ...{ class: "slot-indicator" },
                });
                /** @type {__VLS_StyleScopedClasses['slot-indicator']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "slot-dot" },
                    ...{ class: (__VLS_ctx.getSlotStatusClass(slot)) },
                });
                /** @type {__VLS_StyleScopedClasses['slot-dot']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "slot-label" },
                });
                /** @type {__VLS_StyleScopedClasses['slot-label']} */ ;
                (__VLS_ctx.getTimeSlotLabel(slot.timeSlot));
                // @ts-ignore
                [isPastDay, isToday, hasAvailableSlot, getDaySlots, getDaySlots, getSlotStatusClass, getTimeSlotLabel,];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "no-slots" },
            });
            /** @type {__VLS_StyleScopedClasses['no-slots']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "schedule-tip" },
    });
    /** @type {__VLS_StyleScopedClasses['schedule-tip']} */ ;
    let __VLS_161;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({}));
    const __VLS_163 = __VLS_162({}, ...__VLS_functionalComponentArgsRest(__VLS_162));
    const { default: __VLS_166 } = __VLS_164.slots;
    let __VLS_167;
    /** @ts-ignore @type {typeof __VLS_components.InfoFilled} */
    InfoFilled;
    // @ts-ignore
    const __VLS_168 = __VLS_asFunctionalComponent1(__VLS_167, new __VLS_167({}));
    const __VLS_169 = __VLS_168({}, ...__VLS_functionalComponentArgsRest(__VLS_168));
    // @ts-ignore
    [];
    var __VLS_164;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    if (__VLS_ctx.selectedSlot) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "booking-confirm" },
        });
        /** @type {__VLS_StyleScopedClasses['booking-confirm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "confirm-info" },
        });
        /** @type {__VLS_StyleScopedClasses['confirm-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (__VLS_ctx.formatSelectedDate);
        (__VLS_ctx.getTimeSlotLabel(__VLS_ctx.selectedSlot.timeSlot));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "confirm-price" },
        });
        /** @type {__VLS_StyleScopedClasses['confirm-price']} */ ;
        (__VLS_ctx.selectedService?.displayName);
        (__VLS_ctx.formatPrice(__VLS_ctx.selectedService));
        let __VLS_172;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_173 = __VLS_asFunctionalComponent1(__VLS_172, new __VLS_172({
            ...{ 'onClick': {} },
            type: "primary",
            size: "large",
            ...{ class: "confirm-btn cosmic-btn-primary cosmic-btn" },
        }));
        const __VLS_174 = __VLS_173({
            ...{ 'onClick': {} },
            type: "primary",
            size: "large",
            ...{ class: "confirm-btn cosmic-btn-primary cosmic-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_173));
        let __VLS_177;
        const __VLS_178 = ({ click: {} },
            { onClick: (__VLS_ctx.showBookingForm) });
        /** @type {__VLS_StyleScopedClasses['confirm-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
        const { default: __VLS_179 } = __VLS_175.slots;
        // @ts-ignore
        [selectedService, selectedService, formatPrice, getTimeSlotLabel, selectedSlot, selectedSlot, formatSelectedDate, showBookingForm,];
        var __VLS_175;
        var __VLS_176;
    }
    // @ts-ignore
    [];
    var __VLS_158;
    let __VLS_180;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({
        label: "用户评价",
        name: "reviews",
    }));
    const __VLS_182 = __VLS_181({
        label: "用户评价",
        name: "reviews",
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    const { default: __VLS_185 } = __VLS_183.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "reviews-content" },
    });
    /** @type {__VLS_StyleScopedClasses['reviews-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "reviews-summary" },
    });
    /** @type {__VLS_StyleScopedClasses['reviews-summary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "summary-score" },
    });
    /** @type {__VLS_StyleScopedClasses['summary-score']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "big-score" },
    });
    /** @type {__VLS_StyleScopedClasses['big-score']} */ ;
    (__VLS_ctx.psychologist.ratingScore);
    let __VLS_186;
    /** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
    elRate;
    // @ts-ignore
    const __VLS_187 = __VLS_asFunctionalComponent1(__VLS_186, new __VLS_186({
        modelValue: (__VLS_ctx.psychologist.ratingScore),
        disabled: true,
        showScore: true,
        size: "large",
    }));
    const __VLS_188 = __VLS_187({
        modelValue: (__VLS_ctx.psychologist.ratingScore),
        disabled: true,
        showScore: true,
        size: "large",
    }, ...__VLS_functionalComponentArgsRest(__VLS_187));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "review-count" },
    });
    /** @type {__VLS_StyleScopedClasses['review-count']} */ ;
    (__VLS_ctx.psychologist.ratingCount);
    if (__VLS_ctx.reviews.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "reviews-list" },
        });
        /** @type {__VLS_StyleScopedClasses['reviews-list']} */ ;
        for (const [review] of __VLS_vFor((__VLS_ctx.reviews))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "review-item cosmic-card" },
                key: (review.id),
            });
            /** @type {__VLS_StyleScopedClasses['review-item']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-card']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "review-header" },
            });
            /** @type {__VLS_StyleScopedClasses['review-header']} */ ;
            let __VLS_191;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191({
                size: (40),
                src: (review.userAvatar),
            }));
            const __VLS_193 = __VLS_192({
                size: (40),
                src: (review.userAvatar),
            }, ...__VLS_functionalComponentArgsRest(__VLS_192));
            const { default: __VLS_196 } = __VLS_194.slots;
            (review.userName?.charAt(0));
            // @ts-ignore
            [psychologist, psychologist, psychologist, reviews, reviews,];
            var __VLS_194;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "review-user" },
            });
            /** @type {__VLS_StyleScopedClasses['review-user']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "user-name" },
            });
            /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
            (review.userName);
            let __VLS_197;
            /** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
            elRate;
            // @ts-ignore
            const __VLS_198 = __VLS_asFunctionalComponent1(__VLS_197, new __VLS_197({
                modelValue: (review.rating),
                disabled: true,
                size: "small",
            }));
            const __VLS_199 = __VLS_198({
                modelValue: (review.rating),
                disabled: true,
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_198));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "review-date" },
            });
            /** @type {__VLS_StyleScopedClasses['review-date']} */ ;
            (__VLS_ctx.formatDate(review.createTime));
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "review-content" },
            });
            /** @type {__VLS_StyleScopedClasses['review-content']} */ ;
            (review.comment);
            // @ts-ignore
            [formatDate,];
        }
    }
    else {
        let __VLS_202;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_203 = __VLS_asFunctionalComponent1(__VLS_202, new __VLS_202({
            description: "暂无评价",
        }));
        const __VLS_204 = __VLS_203({
            description: "暂无评价",
        }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    }
    // @ts-ignore
    [];
    var __VLS_183;
    // @ts-ignore
    [];
    var __VLS_106;
}
let __VLS_207;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_208 = __VLS_asFunctionalComponent1(__VLS_207, new __VLS_207({
    modelValue: (__VLS_ctx.bookingFormVisible),
    title: "填写预约信息",
    width: "600px",
    ...{ class: "cosmic-dialog booking-dialog" },
}));
const __VLS_209 = __VLS_208({
    modelValue: (__VLS_ctx.bookingFormVisible),
    title: "填写预约信息",
    width: "600px",
    ...{ class: "cosmic-dialog booking-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_208));
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['booking-dialog']} */ ;
const { default: __VLS_212 } = __VLS_210.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "booking-modal-content" },
});
/** @type {__VLS_StyleScopedClasses['booking-modal-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "booking-service-info" },
});
/** @type {__VLS_StyleScopedClasses['booking-service-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "service-badge" },
});
/** @type {__VLS_StyleScopedClasses['service-badge']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "service-icon" },
});
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
if (__VLS_ctx.selectedService?.serviceType === 'offline') {
    let __VLS_213;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_214 = __VLS_asFunctionalComponent1(__VLS_213, new __VLS_213({}));
    const __VLS_215 = __VLS_214({}, ...__VLS_functionalComponentArgsRest(__VLS_214));
    const { default: __VLS_218 } = __VLS_216.slots;
    let __VLS_219;
    /** @ts-ignore @type {typeof __VLS_components.OfficeBuilding} */
    OfficeBuilding;
    // @ts-ignore
    const __VLS_220 = __VLS_asFunctionalComponent1(__VLS_219, new __VLS_219({}));
    const __VLS_221 = __VLS_220({}, ...__VLS_functionalComponentArgsRest(__VLS_220));
    // @ts-ignore
    [selectedService, bookingFormVisible,];
    var __VLS_216;
}
else {
    let __VLS_224;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent1(__VLS_224, new __VLS_224({}));
    const __VLS_226 = __VLS_225({}, ...__VLS_functionalComponentArgsRest(__VLS_225));
    const { default: __VLS_229 } = __VLS_227.slots;
    let __VLS_230;
    /** @ts-ignore @type {typeof __VLS_components.VideoCamera} */
    VideoCamera;
    // @ts-ignore
    const __VLS_231 = __VLS_asFunctionalComponent1(__VLS_230, new __VLS_230({}));
    const __VLS_232 = __VLS_231({}, ...__VLS_functionalComponentArgsRest(__VLS_231));
    // @ts-ignore
    [];
    var __VLS_227;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "service-name" },
});
/** @type {__VLS_StyleScopedClasses['service-name']} */ ;
(__VLS_ctx.selectedService?.displayName);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "service-price-display" },
});
/** @type {__VLS_StyleScopedClasses['service-price-display']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "price-symbol" },
});
/** @type {__VLS_StyleScopedClasses['price-symbol']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "price-value" },
});
/** @type {__VLS_StyleScopedClasses['price-value']} */ ;
(__VLS_ctx.formatPrice(__VLS_ctx.selectedService));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "booking-time-info" },
});
/** @type {__VLS_StyleScopedClasses['booking-time-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "time-icon" },
});
/** @type {__VLS_StyleScopedClasses['time-icon']} */ ;
let __VLS_235;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_236 = __VLS_asFunctionalComponent1(__VLS_235, new __VLS_235({}));
const __VLS_237 = __VLS_236({}, ...__VLS_functionalComponentArgsRest(__VLS_236));
const { default: __VLS_240 } = __VLS_238.slots;
let __VLS_241;
/** @ts-ignore @type {typeof __VLS_components.Calendar} */
Calendar;
// @ts-ignore
const __VLS_242 = __VLS_asFunctionalComponent1(__VLS_241, new __VLS_241({}));
const __VLS_243 = __VLS_242({}, ...__VLS_functionalComponentArgsRest(__VLS_242));
// @ts-ignore
[selectedService, selectedService, formatPrice,];
var __VLS_238;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "time-details" },
});
/** @type {__VLS_StyleScopedClasses['time-details']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "date-text" },
});
/** @type {__VLS_StyleScopedClasses['date-text']} */ ;
(__VLS_ctx.formatSelectedDate);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "slot-text" },
});
/** @type {__VLS_StyleScopedClasses['slot-text']} */ ;
(__VLS_ctx.getTimeSlotLabel(__VLS_ctx.selectedSlot?.timeSlot || ''));
if (__VLS_ctx.selectedService?.serviceType === 'offline') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "offline-address-card" },
    });
    /** @type {__VLS_StyleScopedClasses['offline-address-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "address-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['address-icon']} */ ;
    let __VLS_246;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_247 = __VLS_asFunctionalComponent1(__VLS_246, new __VLS_246({}));
    const __VLS_248 = __VLS_247({}, ...__VLS_functionalComponentArgsRest(__VLS_247));
    const { default: __VLS_251 } = __VLS_249.slots;
    let __VLS_252;
    /** @ts-ignore @type {typeof __VLS_components.Location} */
    Location;
    // @ts-ignore
    const __VLS_253 = __VLS_asFunctionalComponent1(__VLS_252, new __VLS_252({}));
    const __VLS_254 = __VLS_253({}, ...__VLS_functionalComponentArgsRest(__VLS_253));
    // @ts-ignore
    [selectedService, getTimeSlotLabel, selectedSlot, formatSelectedDate,];
    var __VLS_249;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "address-text" },
    });
    /** @type {__VLS_StyleScopedClasses['address-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "address-label" },
    });
    /** @type {__VLS_StyleScopedClasses['address-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "address-value" },
    });
    /** @type {__VLS_StyleScopedClasses['address-value']} */ ;
    (__VLS_ctx.psychologist?.offlineRegion);
    (__VLS_ctx.psychologist?.offlineAddress);
}
let __VLS_257;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_258 = __VLS_asFunctionalComponent1(__VLS_257, new __VLS_257({
    labelPosition: "top",
    ...{ class: "booking-form cosmic-form" },
}));
const __VLS_259 = __VLS_258({
    labelPosition: "top",
    ...{ class: "booking-form cosmic-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_258));
/** @type {__VLS_StyleScopedClasses['booking-form']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-form']} */ ;
const { default: __VLS_262 } = __VLS_260.slots;
let __VLS_263;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_264 = __VLS_asFunctionalComponent1(__VLS_263, new __VLS_263({
    label: "主要问题",
    required: true,
}));
const __VLS_265 = __VLS_264({
    label: "主要问题",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_264));
const { default: __VLS_268 } = __VLS_266.slots;
let __VLS_269;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_270 = __VLS_asFunctionalComponent1(__VLS_269, new __VLS_269({
    modelValue: (__VLS_ctx.bookingForm.problems),
    type: "textarea",
    rows: (3),
    placeholder: "请详细描述您想解决的问题，以便心理师更好地帮助您...",
    ...{ class: "cosmic-textarea" },
}));
const __VLS_271 = __VLS_270({
    modelValue: (__VLS_ctx.bookingForm.problems),
    type: "textarea",
    rows: (3),
    placeholder: "请详细描述您想解决的问题，以便心理师更好地帮助您...",
    ...{ class: "cosmic-textarea" },
}, ...__VLS_functionalComponentArgsRest(__VLS_270));
/** @type {__VLS_StyleScopedClasses['cosmic-textarea']} */ ;
// @ts-ignore
[psychologist, psychologist, bookingForm,];
var __VLS_266;
if (__VLS_ctx.selectedService?.serviceType !== 'offline') {
    let __VLS_274;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_275 = __VLS_asFunctionalComponent1(__VLS_274, new __VLS_274({
        label: "个人情况",
    }));
    const __VLS_276 = __VLS_275({
        label: "个人情况",
    }, ...__VLS_functionalComponentArgsRest(__VLS_275));
    const { default: __VLS_279 } = __VLS_277.slots;
    let __VLS_280;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_281 = __VLS_asFunctionalComponent1(__VLS_280, new __VLS_280({
        modelValue: (__VLS_ctx.bookingForm.personalSituation),
        type: "textarea",
        rows: (2),
        placeholder: "简单描述您的个人情况（可选）...",
        ...{ class: "cosmic-textarea" },
    }));
    const __VLS_282 = __VLS_281({
        modelValue: (__VLS_ctx.bookingForm.personalSituation),
        type: "textarea",
        rows: (2),
        placeholder: "简单描述您的个人情况（可选）...",
        ...{ class: "cosmic-textarea" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_281));
    /** @type {__VLS_StyleScopedClasses['cosmic-textarea']} */ ;
    // @ts-ignore
    [selectedService, bookingForm,];
    var __VLS_277;
}
// @ts-ignore
[];
var __VLS_260;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "booking-notice" },
});
/** @type {__VLS_StyleScopedClasses['booking-notice']} */ ;
let __VLS_285;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_286 = __VLS_asFunctionalComponent1(__VLS_285, new __VLS_285({}));
const __VLS_287 = __VLS_286({}, ...__VLS_functionalComponentArgsRest(__VLS_286));
const { default: __VLS_290 } = __VLS_288.slots;
let __VLS_291;
/** @ts-ignore @type {typeof __VLS_components.InfoFilled} */
InfoFilled;
// @ts-ignore
const __VLS_292 = __VLS_asFunctionalComponent1(__VLS_291, new __VLS_291({}));
const __VLS_293 = __VLS_292({}, ...__VLS_functionalComponentArgsRest(__VLS_292));
// @ts-ignore
[];
var __VLS_288;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
{
    const { footer: __VLS_296 } = __VLS_210.slots;
    let __VLS_297;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_298 = __VLS_asFunctionalComponent1(__VLS_297, new __VLS_297({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }));
    const __VLS_299 = __VLS_298({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_298));
    let __VLS_302;
    const __VLS_303 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.bookingFormVisible = false;
                // @ts-ignore
                [bookingFormVisible,];
            } });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_304 } = __VLS_300.slots;
    // @ts-ignore
    [];
    var __VLS_300;
    var __VLS_301;
    let __VLS_305;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_306 = __VLS_asFunctionalComponent1(__VLS_305, new __VLS_305({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_307 = __VLS_306({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_306));
    let __VLS_310;
    const __VLS_311 = ({ click: {} },
        { onClick: (__VLS_ctx.submitBooking) });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_312 } = __VLS_308.slots;
    (__VLS_ctx.formatPrice(__VLS_ctx.selectedService));
    // @ts-ignore
    [selectedService, formatPrice, submitting, submitBooking,];
    var __VLS_308;
    var __VLS_309;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_210;
let __VLS_313;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_314 = __VLS_asFunctionalComponent1(__VLS_313, new __VLS_313({
    modelValue: (__VLS_ctx.timeSlotDialogVisible),
    title: "选择预约时段",
    width: "500px",
    ...{ class: "cosmic-dialog time-slot-dialog" },
    showClose: (false),
}));
const __VLS_315 = __VLS_314({
    modelValue: (__VLS_ctx.timeSlotDialogVisible),
    title: "选择预约时段",
    width: "500px",
    ...{ class: "cosmic-dialog time-slot-dialog" },
    showClose: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_314));
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['time-slot-dialog']} */ ;
const { default: __VLS_318 } = __VLS_316.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "time-slot-modal" },
});
/** @type {__VLS_StyleScopedClasses['time-slot-modal']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "selected-date-display" },
});
/** @type {__VLS_StyleScopedClasses['selected-date-display']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "date-icon" },
});
/** @type {__VLS_StyleScopedClasses['date-icon']} */ ;
let __VLS_319;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_320 = __VLS_asFunctionalComponent1(__VLS_319, new __VLS_319({}));
const __VLS_321 = __VLS_320({}, ...__VLS_functionalComponentArgsRest(__VLS_320));
const { default: __VLS_324 } = __VLS_322.slots;
let __VLS_325;
/** @ts-ignore @type {typeof __VLS_components.Calendar} */
Calendar;
// @ts-ignore
const __VLS_326 = __VLS_asFunctionalComponent1(__VLS_325, new __VLS_325({}));
const __VLS_327 = __VLS_326({}, ...__VLS_functionalComponentArgsRest(__VLS_326));
// @ts-ignore
[timeSlotDialogVisible,];
var __VLS_322;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "date-text" },
});
/** @type {__VLS_StyleScopedClasses['date-text']} */ ;
(__VLS_ctx.formatSelectedDate);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "time-slots-container" },
});
/** @type {__VLS_StyleScopedClasses['time-slots-container']} */ ;
for (const [period] of __VLS_vFor((__VLS_ctx.timeSlotPeriods))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (period.key),
        ...{ class: "time-period-section" },
    });
    /** @type {__VLS_StyleScopedClasses['time-period-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "period-header" },
    });
    /** @type {__VLS_StyleScopedClasses['period-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "period-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['period-icon']} */ ;
    if (period.key === 'morning') {
        let __VLS_330;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_331 = __VLS_asFunctionalComponent1(__VLS_330, new __VLS_330({}));
        const __VLS_332 = __VLS_331({}, ...__VLS_functionalComponentArgsRest(__VLS_331));
        const { default: __VLS_335 } = __VLS_333.slots;
        let __VLS_336;
        /** @ts-ignore @type {typeof __VLS_components.Sunrise} */
        Sunrise;
        // @ts-ignore
        const __VLS_337 = __VLS_asFunctionalComponent1(__VLS_336, new __VLS_336({}));
        const __VLS_338 = __VLS_337({}, ...__VLS_functionalComponentArgsRest(__VLS_337));
        // @ts-ignore
        [formatSelectedDate, timeSlotPeriods,];
        var __VLS_333;
    }
    else if (period.key === 'afternoon') {
        let __VLS_341;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_342 = __VLS_asFunctionalComponent1(__VLS_341, new __VLS_341({}));
        const __VLS_343 = __VLS_342({}, ...__VLS_functionalComponentArgsRest(__VLS_342));
        const { default: __VLS_346 } = __VLS_344.slots;
        let __VLS_347;
        /** @ts-ignore @type {typeof __VLS_components.Sunny} */
        Sunny;
        // @ts-ignore
        const __VLS_348 = __VLS_asFunctionalComponent1(__VLS_347, new __VLS_347({}));
        const __VLS_349 = __VLS_348({}, ...__VLS_functionalComponentArgsRest(__VLS_348));
        // @ts-ignore
        [];
        var __VLS_344;
    }
    else {
        let __VLS_352;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_353 = __VLS_asFunctionalComponent1(__VLS_352, new __VLS_352({}));
        const __VLS_354 = __VLS_353({}, ...__VLS_functionalComponentArgsRest(__VLS_353));
        const { default: __VLS_357 } = __VLS_355.slots;
        let __VLS_358;
        /** @ts-ignore @type {typeof __VLS_components.Moon} */
        Moon;
        // @ts-ignore
        const __VLS_359 = __VLS_asFunctionalComponent1(__VLS_358, new __VLS_358({}));
        const __VLS_360 = __VLS_359({}, ...__VLS_functionalComponentArgsRest(__VLS_359));
        // @ts-ignore
        [];
        var __VLS_355;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "period-name" },
    });
    /** @type {__VLS_StyleScopedClasses['period-name']} */ ;
    (period.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "period-slots" },
    });
    /** @type {__VLS_StyleScopedClasses['period-slots']} */ ;
    for (const [slot] of __VLS_vFor((period.slots))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    slot.status === 0 && __VLS_ctx.selectTimeSlot(slot);
                    // @ts-ignore
                    [selectTimeSlot,];
                } },
            key: (slot.timeSlot),
            ...{ class: "time-slot-item" },
            ...{ class: ({
                    available: slot.status === 0,
                    booked: slot.status === 1,
                    disabled: slot.status === 2,
                    selected: __VLS_ctx.selectedTimeSlot?.timeSlot === slot.timeSlot
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['time-slot-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['available']} */ ;
        /** @type {__VLS_StyleScopedClasses['booked']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled']} */ ;
        /** @type {__VLS_StyleScopedClasses['selected']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "slot-time" },
        });
        /** @type {__VLS_StyleScopedClasses['slot-time']} */ ;
        (__VLS_ctx.getTimeSlotLabel(slot.timeSlot));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "slot-status" },
        });
        /** @type {__VLS_StyleScopedClasses['slot-status']} */ ;
        if (slot.status === 0) {
        }
        else if (slot.status === 1) {
        }
        else {
        }
        // @ts-ignore
        [getTimeSlotLabel, selectedTimeSlot,];
    }
    // @ts-ignore
    [];
}
if (__VLS_ctx.allSlotsEmpty) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "no-slots-tip" },
    });
    /** @type {__VLS_StyleScopedClasses['no-slots-tip']} */ ;
    let __VLS_363;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_364 = __VLS_asFunctionalComponent1(__VLS_363, new __VLS_363({}));
    const __VLS_365 = __VLS_364({}, ...__VLS_functionalComponentArgsRest(__VLS_364));
    const { default: __VLS_368 } = __VLS_366.slots;
    let __VLS_369;
    /** @ts-ignore @type {typeof __VLS_components.Warning} */
    Warning;
    // @ts-ignore
    const __VLS_370 = __VLS_asFunctionalComponent1(__VLS_369, new __VLS_369({}));
    const __VLS_371 = __VLS_370({}, ...__VLS_functionalComponentArgsRest(__VLS_370));
    // @ts-ignore
    [allSlotsEmpty,];
    var __VLS_366;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
{
    const { footer: __VLS_374 } = __VLS_316.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_375;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_376 = __VLS_asFunctionalComponent1(__VLS_375, new __VLS_375({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }));
    const __VLS_377 = __VLS_376({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_376));
    let __VLS_380;
    const __VLS_381 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.timeSlotDialogVisible = false;
                // @ts-ignore
                [timeSlotDialogVisible,];
            } });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_382 } = __VLS_378.slots;
    // @ts-ignore
    [];
    var __VLS_378;
    var __VLS_379;
    let __VLS_383;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_384 = __VLS_asFunctionalComponent1(__VLS_383, new __VLS_383({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
        disabled: (!__VLS_ctx.selectedTimeSlot),
    }));
    const __VLS_385 = __VLS_384({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
        disabled: (!__VLS_ctx.selectedTimeSlot),
    }, ...__VLS_functionalComponentArgsRest(__VLS_384));
    let __VLS_388;
    const __VLS_389 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmTimeSlot) });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_390 } = __VLS_386.slots;
    // @ts-ignore
    [selectedTimeSlot, confirmTimeSlot,];
    var __VLS_386;
    var __VLS_387;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_316;
let __VLS_391;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_392 = __VLS_asFunctionalComponent1(__VLS_391, new __VLS_391({
    modelValue: (__VLS_ctx.paymentDialogVisible),
    title: "确认支付",
    width: "450px",
    ...{ class: "cosmic-dialog payment-dialog" },
    showClose: (false),
}));
const __VLS_393 = __VLS_392({
    modelValue: (__VLS_ctx.paymentDialogVisible),
    title: "确认支付",
    width: "450px",
    ...{ class: "cosmic-dialog payment-dialog" },
    showClose: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_392));
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['payment-dialog']} */ ;
const { default: __VLS_396 } = __VLS_394.slots;
if (__VLS_ctx.pendingAppointment) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "payment-modal-content" },
    });
    /** @type {__VLS_StyleScopedClasses['payment-modal-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "payment-header" },
    });
    /** @type {__VLS_StyleScopedClasses['payment-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "payment-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['payment-icon']} */ ;
    let __VLS_397;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_398 = __VLS_asFunctionalComponent1(__VLS_397, new __VLS_397({}));
    const __VLS_399 = __VLS_398({}, ...__VLS_functionalComponentArgsRest(__VLS_398));
    const { default: __VLS_402 } = __VLS_400.slots;
    let __VLS_403;
    /** @ts-ignore @type {typeof __VLS_components.CircleCheck} */
    CircleCheck;
    // @ts-ignore
    const __VLS_404 = __VLS_asFunctionalComponent1(__VLS_403, new __VLS_403({}));
    const __VLS_405 = __VLS_404({}, ...__VLS_functionalComponentArgsRest(__VLS_404));
    // @ts-ignore
    [paymentDialogVisible, pendingAppointment,];
    var __VLS_400;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "payment-subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['payment-subtitle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "payment-order-info" },
    });
    /** @type {__VLS_StyleScopedClasses['payment-order-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "order-row" },
    });
    /** @type {__VLS_StyleScopedClasses['order-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "order-label" },
    });
    /** @type {__VLS_StyleScopedClasses['order-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "order-value" },
    });
    /** @type {__VLS_StyleScopedClasses['order-value']} */ ;
    (__VLS_ctx.psychologist?.realName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "order-row" },
    });
    /** @type {__VLS_StyleScopedClasses['order-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "order-label" },
    });
    /** @type {__VLS_StyleScopedClasses['order-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "order-value" },
    });
    /** @type {__VLS_StyleScopedClasses['order-value']} */ ;
    (__VLS_ctx.pendingAppointment.serviceName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "order-row" },
    });
    /** @type {__VLS_StyleScopedClasses['order-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "order-label" },
    });
    /** @type {__VLS_StyleScopedClasses['order-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "order-value" },
    });
    /** @type {__VLS_StyleScopedClasses['order-value']} */ ;
    (__VLS_ctx.pendingAppointment.appointmentTime);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "order-row" },
    });
    /** @type {__VLS_StyleScopedClasses['order-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "order-label" },
    });
    /** @type {__VLS_StyleScopedClasses['order-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "order-value price" },
    });
    /** @type {__VLS_StyleScopedClasses['order-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['price']} */ ;
    (__VLS_ctx.pendingAppointment.price);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "payment-tip" },
    });
    /** @type {__VLS_StyleScopedClasses['payment-tip']} */ ;
    let __VLS_408;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_409 = __VLS_asFunctionalComponent1(__VLS_408, new __VLS_408({}));
    const __VLS_410 = __VLS_409({}, ...__VLS_functionalComponentArgsRest(__VLS_409));
    const { default: __VLS_413 } = __VLS_411.slots;
    let __VLS_414;
    /** @ts-ignore @type {typeof __VLS_components.InfoFilled} */
    InfoFilled;
    // @ts-ignore
    const __VLS_415 = __VLS_asFunctionalComponent1(__VLS_414, new __VLS_414({}));
    const __VLS_416 = __VLS_415({}, ...__VLS_functionalComponentArgsRest(__VLS_415));
    // @ts-ignore
    [psychologist, pendingAppointment, pendingAppointment, pendingAppointment,];
    var __VLS_411;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
{
    const { footer: __VLS_419 } = __VLS_394.slots;
    let __VLS_420;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_421 = __VLS_asFunctionalComponent1(__VLS_420, new __VLS_420({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }));
    const __VLS_422 = __VLS_421({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_421));
    let __VLS_425;
    const __VLS_426 = ({ click: {} },
        { onClick: (__VLS_ctx.handlePaymentCancel) });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_427 } = __VLS_423.slots;
    // @ts-ignore
    [handlePaymentCancel,];
    var __VLS_423;
    var __VLS_424;
    let __VLS_428;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_429 = __VLS_asFunctionalComponent1(__VLS_428, new __VLS_428({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
        loading: (__VLS_ctx.paymentLoading),
    }));
    const __VLS_430 = __VLS_429({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
        loading: (__VLS_ctx.paymentLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_429));
    let __VLS_433;
    const __VLS_434 = ({ click: {} },
        { onClick: (__VLS_ctx.handlePaymentConfirm) });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_435 } = __VLS_431.slots;
    (__VLS_ctx.pendingAppointment?.price);
    // @ts-ignore
    [pendingAppointment, paymentLoading, handlePaymentConfirm,];
    var __VLS_431;
    var __VLS_432;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_394;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
