/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useRouter } from 'vue-router';
const props = defineProps();
const emit = defineEmits();
const router = useRouter();
const statusMap = {
    0: '待审核', 1: '已确认', 2: '已拒绝', 3: '进行中', 4: '已完成', 5: '已取消', 6: '已爽约', 8: '已评价'
};
const statusTypeMap = {
    0: 'warning', 1: 'success', 2: 'danger', 3: 'primary', 4: 'info', 5: 'info', 6: 'danger', 8: 'success'
};
const serviceTypeMap = {
    text: '图文咨询', video: '视频咨询', voice: '语音咨询', offline: '线下面询'
};
const timeSlotMap = {
    MORNING: '上午', AFTERNOON: '下午', EVENING: '晚上', morning: '上午', afternoon: '下午', evening: '晚上'
};
const formatDateShort = (dateStr) => {
    if (!dateStr)
        return '-';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const handleViewDetail = (row) => {
    emit('view-detail', row);
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "order-table-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['order-table-wrapper']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "loading-state" },
    });
    /** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
}
else if (!__VLS_ctx.orders?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-state" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "empty-text" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!(!__VLS_ctx.orders?.length))
                    return;
                __VLS_ctx.router.push('/consultation/psychologist');
                // @ts-ignore
                [loading, orders, router,];
            } });
    const { default: __VLS_7 } = __VLS_3.slots;
    // @ts-ignore
    [];
    var __VLS_3;
    var __VLS_4;
}
else {
    let __VLS_8;
    /** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
    elTable;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        data: (__VLS_ctx.orders),
        stripe: true,
        ...{ class: "order-table" },
        rowClassName: "order-row",
    }));
    const __VLS_10 = __VLS_9({
        data: (__VLS_ctx.orders),
        stripe: true,
        ...{ class: "order-table" },
        rowClassName: "order-row",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    /** @type {__VLS_StyleScopedClasses['order-table']} */ ;
    const { default: __VLS_13 } = __VLS_11.slots;
    let __VLS_14;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        prop: "orderNo",
        label: "订单号",
        width: "200",
    }));
    const __VLS_16 = __VLS_15({
        prop: "orderNo",
        label: "订单号",
        width: "200",
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const { default: __VLS_19 } = __VLS_17.slots;
    {
        const { default: __VLS_20 } = __VLS_17.slots;
        const [{ row }] = __VLS_vSlot(__VLS_20);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "order-no" },
        });
        /** @type {__VLS_StyleScopedClasses['order-no']} */ ;
        (row.orderNo || '-');
        // @ts-ignore
        [orders,];
    }
    // @ts-ignore
    [];
    var __VLS_17;
    let __VLS_21;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        prop: "psychologistName",
        label: "咨询师",
        minWidth: "120",
    }));
    const __VLS_23 = __VLS_22({
        prop: "psychologistName",
        label: "咨询师",
        minWidth: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    const { default: __VLS_26 } = __VLS_24.slots;
    {
        const { default: __VLS_27 } = __VLS_24.slots;
        const [{ row }] = __VLS_vSlot(__VLS_27);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "psychologist-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "psychologist-name" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-name']} */ ;
        (row.psychologistName || '-');
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "service-type" },
        });
        /** @type {__VLS_StyleScopedClasses['service-type']} */ ;
        (__VLS_ctx.serviceTypeMap[row.serviceType] || row.subtitle || '-');
        // @ts-ignore
        [serviceTypeMap,];
    }
    // @ts-ignore
    [];
    var __VLS_24;
    let __VLS_28;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
        prop: "appointmentTime",
        label: "预约时间",
        width: "160",
    }));
    const __VLS_30 = __VLS_29({
        prop: "appointmentTime",
        label: "预约时间",
        width: "160",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const { default: __VLS_33 } = __VLS_31.slots;
    {
        const { default: __VLS_34 } = __VLS_31.slots;
        const [{ row }] = __VLS_vSlot(__VLS_34);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "time-text" },
        });
        /** @type {__VLS_StyleScopedClasses['time-text']} */ ;
        (row.appointmentTime ? __VLS_ctx.formatDateShort(row.appointmentTime) : '-');
        (row.timeSlot ? __VLS_ctx.timeSlotMap[row.timeSlot] || row.timeSlot : '');
        // @ts-ignore
        [formatDateShort, timeSlotMap,];
    }
    // @ts-ignore
    [];
    var __VLS_31;
    let __VLS_35;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        prop: "fee",
        label: "金额",
        width: "100",
        align: "center",
    }));
    const __VLS_37 = __VLS_36({
        prop: "fee",
        label: "金额",
        width: "100",
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    const { default: __VLS_40 } = __VLS_38.slots;
    {
        const { default: __VLS_41 } = __VLS_38.slots;
        const [{ row }] = __VLS_vSlot(__VLS_41);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "price" },
        });
        /** @type {__VLS_StyleScopedClasses['price']} */ ;
        (row.fee || row.price || 0);
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_38;
    let __VLS_42;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
        prop: "status",
        label: "状态",
        width: "100",
        align: "center",
    }));
    const __VLS_44 = __VLS_43({
        prop: "status",
        label: "状态",
        width: "100",
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    const { default: __VLS_47 } = __VLS_45.slots;
    {
        const { default: __VLS_48 } = __VLS_45.slots;
        const [{ row }] = __VLS_vSlot(__VLS_48);
        let __VLS_49;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
            type: (__VLS_ctx.statusTypeMap[row.status] || 'info'),
            size: "small",
        }));
        const __VLS_51 = __VLS_50({
            type: (__VLS_ctx.statusTypeMap[row.status] || 'info'),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        const { default: __VLS_54 } = __VLS_52.slots;
        (__VLS_ctx.statusMap[row.status] || row.statusText || '-');
        // @ts-ignore
        [statusTypeMap, statusMap,];
        var __VLS_52;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_45;
    let __VLS_55;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        prop: "createTime",
        label: "下单时间",
        width: "120",
    }));
    const __VLS_57 = __VLS_56({
        prop: "createTime",
        label: "下单时间",
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    const { default: __VLS_60 } = __VLS_58.slots;
    {
        const { default: __VLS_61 } = __VLS_58.slots;
        const [{ row }] = __VLS_vSlot(__VLS_61);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "create-time" },
        });
        /** @type {__VLS_StyleScopedClasses['create-time']} */ ;
        (__VLS_ctx.formatDateShort(row.createTime));
        // @ts-ignore
        [formatDateShort,];
    }
    // @ts-ignore
    [];
    var __VLS_58;
    let __VLS_62;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
        prop: "actions",
        label: "操作",
        width: "120",
        align: "center",
        fixed: "right",
    }));
    const __VLS_64 = __VLS_63({
        prop: "actions",
        label: "操作",
        width: "120",
        align: "center",
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    const { default: __VLS_67 } = __VLS_65.slots;
    {
        const { default: __VLS_68 } = __VLS_65.slots;
        const [{ row }] = __VLS_vSlot(__VLS_68);
        let __VLS_69;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            link: true,
        }));
        const __VLS_71 = __VLS_70({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        let __VLS_74;
        const __VLS_75 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(!__VLS_ctx.orders?.length))
                        return;
                    __VLS_ctx.handleViewDetail(row);
                    // @ts-ignore
                    [handleViewDetail,];
                } });
        const { default: __VLS_76 } = __VLS_72.slots;
        // @ts-ignore
        [];
        var __VLS_72;
        var __VLS_73;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_65;
    // @ts-ignore
    [];
    var __VLS_11;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
