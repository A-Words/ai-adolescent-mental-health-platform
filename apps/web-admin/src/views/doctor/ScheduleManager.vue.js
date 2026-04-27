/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import request from '@/api/user';
import dayjs from 'dayjs';
const currentDate = ref(new Date());
const schedules = ref([]);
// Fetch schedules for current month (simplified, fetches all or range)
const fetchSchedules = async () => {
    const start = dayjs(currentDate.value).startOf('month').format('YYYY-MM-DD');
    const end = dayjs(currentDate.value).endOf('month').format('YYYY-MM-DD');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id)
        return;
    try {
        const res = await request.get('/consultation/schedules', {
            params: {
                doctorId: user.id,
                startDate: start,
                endDate: end
            }
        });
        if (res.code === 200) {
            schedules.value = res.data;
        }
    }
    catch (e) { }
};
const getSchedules = (day) => {
    return schedules.value.filter(s => s.workDate === day);
};
const getShiftName = (shift) => {
    return shift === 1 ? '上午' : shift === 2 ? '下午' : '晚班';
};
onMounted(() => {
    fetchSchedules();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "schedule-manager" },
});
/** @type {__VLS_StyleScopedClasses['schedule-manager']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header" },
});
/** @type {__VLS_StyleScopedClasses['header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCalendar | typeof __VLS_components.ElCalendar | typeof __VLS_components.elCalendar | typeof __VLS_components.ElCalendar} */
elCalendar;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.currentDate),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.currentDate),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
{
    const { 'date-cell': __VLS_6 } = __VLS_3.slots;
    const [{ data }] = __VLS_vSlot(__VLS_6);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "date-cell" },
        ...{ class: ({ 'is-selected': data.isSelected }) },
    });
    /** @type {__VLS_StyleScopedClasses['date-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-selected']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (data.day.split('-').slice(1).join('-'));
    for (const [s] of __VLS_vFor((__VLS_ctx.getSchedules(data.day)))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (s.id),
            ...{ class: "schedule-item" },
        });
        /** @type {__VLS_StyleScopedClasses['schedule-item']} */ ;
        let __VLS_7;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            size: "small",
            type: (s.status === 1 ? 'success' : 'info'),
        }));
        const __VLS_9 = __VLS_8({
            size: "small",
            type: (s.status === 1 ? 'success' : 'info'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        const { default: __VLS_12 } = __VLS_10.slots;
        (__VLS_ctx.getShiftName(s.workShift));
        (s.bookedCount);
        (s.maxPatients);
        // @ts-ignore
        [currentDate, getSchedules, getShiftName,];
        var __VLS_10;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
