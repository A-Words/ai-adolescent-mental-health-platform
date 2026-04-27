/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { ArrowRight, Sunny, Moon, Star, Reading } from '@element-plus/icons-vue';
import { getPublicTemplates } from '@/api/assessment';
import { ElMessage } from 'element-plus';
const router = useRouter();
const assessments = ref([]);
const loading = ref(false);
// 默认渐变色方案
const colorSchemes = [
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
    'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)',
    'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)'
];
const icons = [Sunny, Moon, Star, Reading];
const fetchAssessments = async () => {
    loading.value = true;
    try {
        const res = await getPublicTemplates();
        if (res.code === 200) {
            assessments.value = res.data.map((item, index) => ({
                ...item,
                color: colorSchemes[index % colorSchemes.length],
                icon: icons[index % icons.length]
            }));
        }
        else {
            ElMessage.error(res.message || '加载失败');
        }
    }
    catch (error) {
        ElMessage.error('网络错误，请稍后再试');
    }
    finally {
        loading.value = false;
    }
};
const startAssessment = (id) => {
    router.push(`/assessment/${id}`);
};
onMounted(() => {
    fetchAssessments();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-card']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-plain']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "assessment-list" },
});
/** @type {__VLS_StyleScopedClasses['assessment-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "subtitle" },
});
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    plain: true,
    round: true,
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    plain: true,
    round: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.router.push('/assessment-history');
            // @ts-ignore
            [router,];
        } });
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ class: "el-icon--right" },
}));
const __VLS_10 = __VLS_9({
    ...{ class: "el-icon--right" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
/** @type {__VLS_StyleScopedClasses['el-icon--right']} */ ;
const { default: __VLS_13 } = __VLS_11.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.ArrowRight} */
ArrowRight;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
// @ts-ignore
[];
var __VLS_11;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    gutter: (24),
}));
const __VLS_21 = __VLS_20({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const { default: __VLS_24 } = __VLS_22.slots;
for (const [item] of __VLS_vFor((__VLS_ctx.assessments))) {
    let __VLS_25;
    /** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
    elCol;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        key: (item.id),
    }));
    const __VLS_27 = __VLS_26({
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        key: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    const { default: __VLS_30 } = __VLS_28.slots;
    let __VLS_31;
    /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
    elCard;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        ...{ 'onClick': {} },
        ...{ class: "assessment-card" },
        shadow: "hover",
    }));
    const __VLS_33 = __VLS_32({
        ...{ 'onClick': {} },
        ...{ class: "assessment-card" },
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    let __VLS_36;
    const __VLS_37 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.startAssessment(item.id);
                // @ts-ignore
                [assessments, startAssessment,];
            } });
    /** @type {__VLS_StyleScopedClasses['assessment-card']} */ ;
    const { default: __VLS_38 } = __VLS_34.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-image" },
        ...{ style: ({ background: item.color }) },
    });
    /** @type {__VLS_StyleScopedClasses['card-image']} */ ;
    let __VLS_39;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
        size: (48),
        color: "#fff",
    }));
    const __VLS_41 = __VLS_40({
        size: (48),
        color: "#fff",
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    const { default: __VLS_44 } = __VLS_42.slots;
    const __VLS_45 = (item.icon);
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({}));
    const __VLS_47 = __VLS_46({}, ...__VLS_functionalComponentArgsRest(__VLS_46));
    // @ts-ignore
    [];
    var __VLS_42;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-content" },
    });
    /** @type {__VLS_StyleScopedClasses['card-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (item.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (item.description);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
    let __VLS_50;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
        size: "small",
        type: "success",
        round: true,
    }));
    const __VLS_52 = __VLS_51({
        size: "small",
        type: "success",
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    const { default: __VLS_55 } = __VLS_53.slots;
    // @ts-ignore
    [];
    var __VLS_53;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "start-btn" },
    });
    /** @type {__VLS_StyleScopedClasses['start-btn']} */ ;
    let __VLS_56;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({}));
    const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
    const { default: __VLS_61 } = __VLS_59.slots;
    let __VLS_62;
    /** @ts-ignore @type {typeof __VLS_components.ArrowRight} */
    ArrowRight;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({}));
    const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
    // @ts-ignore
    [];
    var __VLS_59;
    // @ts-ignore
    [];
    var __VLS_34;
    var __VLS_35;
    // @ts-ignore
    [];
    var __VLS_28;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_22;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
