/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useRouter } from 'vue-router';
const router = useRouter();
const services = [
    {
        icon: '📚',
        iconClass: 'icon-course',
        name: '心理课程',
        description: '全球精选针对性课程',
        path: '/courses'
    },
    {
        icon: '👨‍⚕️',
        iconClass: 'icon-consult',
        name: '心理咨询',
        description: '严选咨询师，高质量服务',
        path: '/consultation'
    },
    {
        icon: '🤖',
        iconClass: 'icon-ai',
        name: 'AI咨询助理',
        description: '24小时专业答疑',
        path: '/ai-consultation'
    },
    {
        icon: '💬',
        iconClass: 'icon-listen',
        name: '小爱倾听师',
        description: '随时随地的心理陪伴',
        path: '/xiaoai-listen'
    },
    {
        icon: '📊',
        iconClass: 'icon-test',
        name: '心理测试',
        description: '专业量表认识自我',
        path: '/assessments'
    },
    {
        icon: '📝',
        iconClass: 'icon-article',
        name: '心理文章',
        description: '全球分享互相改变',
        path: '/articles'
    },
    {
        icon: '🏥',
        iconClass: 'icon-doctor',
        name: '医生咨询',
        description: '各地医院挂号服务',
        path: '/consultation/doctor'
    },
    {
        icon: '📖',
        iconClass: 'icon-book',
        name: '心理书籍',
        description: '全球精选心理书籍',
        path: '/books'
    }
];
const goTo = (path) => {
    router.push(path);
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['card-hover-effect']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-name']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['services-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['services-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['service-name']} */ ;
/** @type {__VLS_StyleScopedClasses['service-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['services-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "services-section" },
});
/** @type {__VLS_StyleScopedClasses['services-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-header" },
});
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "section-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "services-grid" },
});
/** @type {__VLS_StyleScopedClasses['services-grid']} */ ;
for (const [service, index] of __VLS_vFor((__VLS_ctx.services))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.goTo(service.path);
                // @ts-ignore
                [services, goTo,];
            } },
        key: (index),
        ...{ class: "service-card" },
        ...{ style: ({ animationDelay: `${index * 0.1}s` }) },
    });
    /** @type {__VLS_StyleScopedClasses['service-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-glow" },
    });
    /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-content" },
    });
    /** @type {__VLS_StyleScopedClasses['card-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "service-icon" },
        ...{ class: (service.iconClass) },
    });
    /** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
    (service.icon);
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "service-name" },
    });
    /** @type {__VLS_StyleScopedClasses['service-name']} */ ;
    (service.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "service-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['service-desc']} */ ;
    (service.description);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-hover-effect" },
    });
    /** @type {__VLS_StyleScopedClasses['card-hover-effect']} */ ;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
