/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getQuotes } from '@/api/quote';
import ServicesSection from './home/components/ServicesSection.vue';
import JoinSection from './home/components/JoinSection.vue';
import AboutSection from './home/components/AboutSection.vue';
const router = useRouter();
const quotes = ref([]);
const windowWidth = ref(window.innerWidth);
const currentIndex = ref(0);
let quoteTimer = null;
// 获取当前随机鼓舞语句
const currentQuote = computed(() => {
    if (quotes.value.length === 0)
        return null;
    return quotes.value[currentIndex.value];
});
// 随机切换鼓舞语句
const switchQuote = () => {
    if (quotes.value.length <= 1)
        return;
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * quotes.value.length);
    } while (newIndex === currentIndex.value && quotes.value.length > 1);
    currentIndex.value = newIndex;
};
// 开始定时切换
const startQuoteTimer = () => {
    if (quoteTimer)
        clearInterval(quoteTimer);
    quoteTimer = setInterval(switchQuote, 30000);
};
// 停止定时切换
const stopQuoteTimer = () => {
    if (quoteTimer) {
        clearInterval(quoteTimer);
        quoteTimer = null;
    }
};
// 根据屏幕宽度计算轮播图高度
const carouselHeight = computed(() => {
    if (windowWidth.value < 576) {
        return '220px';
    }
    else if (windowWidth.value < 768) {
        return '280px';
    }
    else if (windowWidth.value < 992) {
        return '320px';
    }
    else {
        return '350px';
    }
});
// 监听窗口大小变化
const handleResize = () => {
    windowWidth.value = window.innerWidth;
};
onMounted(async () => {
    try {
        // 使用 getQuotes 获取所有鼓舞语句
        const res = await getQuotes();
        console.log('鼓舞语句 API 响应:', res);
        if (res.code === 200 && res.data) {
            // 处理不同的数据结构
            if (Array.isArray(res.data)) {
                quotes.value = res.data;
            }
            else if (res.data.records && Array.isArray(res.data.records)) {
                // 如果是分页数据
                quotes.value = res.data.records;
            }
            else if (res.data.list && Array.isArray(res.data.list)) {
                // 如果是 list 格式
                quotes.value = res.data.list;
            }
            else {
                // 单个对象转为数组
                quotes.value = [res.data];
            }
            console.log('处理后的鼓舞语句:', quotes.value);
            // 随机初始化索引
            if (quotes.value.length > 0) {
                currentIndex.value = Math.floor(Math.random() * quotes.value.length);
                // 启动定时切换
                startQuoteTimer();
            }
        }
    }
    catch (e) {
        console.error('Failed to load quotes', e);
        throw e; // 抛出错误，不使用默认数据
    }
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
    // 移除监听
    window.removeEventListener('resize', handleResize);
    // 停止鼓舞语句定时器
    stopQuoteTimer();
});
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
/** @type {__VLS_StyleScopedClasses['mini-star']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-star']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-star']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-star']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-star']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-showcase']} */ ;
/** @type {__VLS_StyleScopedClasses['home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-text']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-showcase']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-text']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-author']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-1']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-2']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-3']} */ ;
/** @type {__VLS_StyleScopedClasses['home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-showcase']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-content']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-text']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-author']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-stars']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-author']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stars-background']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-1']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-2']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-3']} */ ;
/** @type {__VLS_StyleScopedClasses['comet']} */ ;
/** @type {__VLS_StyleScopedClasses['home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-showcase']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-content']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-text']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-author']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-stars']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-features']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stars-background']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-1']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-2']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-3']} */ ;
/** @type {__VLS_StyleScopedClasses['comet']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-text']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-showcase']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-content']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-text']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['quote-stars']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-carousel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "home-container" },
});
/** @type {__VLS_StyleScopedClasses['home-container']} */ ;
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
    ...{ class: "planet planet-3" },
});
/** @type {__VLS_StyleScopedClasses['planet']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "comet" },
});
/** @type {__VLS_StyleScopedClasses['comet']} */ ;
if (__VLS_ctx.quotes.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "quote-showcase" },
    });
    /** @type {__VLS_StyleScopedClasses['quote-showcase']} */ ;
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.transitionGroup | typeof __VLS_components.TransitionGroup | typeof __VLS_components.transitionGroup | typeof __VLS_components.TransitionGroup} */
    transitionGroup;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        name: "quote-fade",
        tag: "div",
        ...{ class: "quote-wrapper" },
    }));
    const __VLS_2 = __VLS_1({
        name: "quote-fade",
        tag: "div",
        ...{ class: "quote-wrapper" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['quote-wrapper']} */ ;
    const { default: __VLS_5 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "quote-card" },
        key: (__VLS_ctx.currentQuote?.id),
    });
    /** @type {__VLS_StyleScopedClasses['quote-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "quote-glow" },
    });
    /** @type {__VLS_StyleScopedClasses['quote-glow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "quote-content" },
    });
    /** @type {__VLS_StyleScopedClasses['quote-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "quote-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['quote-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "quote-text" },
    });
    /** @type {__VLS_StyleScopedClasses['quote-text']} */ ;
    (__VLS_ctx.currentQuote?.content);
    if (__VLS_ctx.currentQuote?.author) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "quote-author" },
        });
        /** @type {__VLS_StyleScopedClasses['quote-author']} */ ;
        (__VLS_ctx.currentQuote?.author);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "quote-stars" },
    });
    /** @type {__VLS_StyleScopedClasses['quote-stars']} */ ;
    for (const [n] of __VLS_vFor((5))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "mini-star" },
            key: (n),
        });
        /** @type {__VLS_StyleScopedClasses['mini-star']} */ ;
        // @ts-ignore
        [quotes, currentQuote, currentQuote, currentQuote, currentQuote,];
    }
    // @ts-ignore
    [];
    var __VLS_3;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-carousel" },
});
/** @type {__VLS_StyleScopedClasses['banner-carousel']} */ ;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elCarousel | typeof __VLS_components.ElCarousel | typeof __VLS_components.elCarousel | typeof __VLS_components.ElCarousel} */
elCarousel;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    interval: (5000),
    arrow: "always",
    height: (__VLS_ctx.carouselHeight),
    trigger: "click",
    autoplay: (true),
}));
const __VLS_8 = __VLS_7({
    interval: (5000),
    arrow: "always",
    height: (__VLS_ctx.carouselHeight),
    trigger: "click",
    autoplay: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.elCarouselItem | typeof __VLS_components.ElCarouselItem | typeof __VLS_components.elCarouselItem | typeof __VLS_components.ElCarouselItem} */
elCarouselItem;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const { default: __VLS_17 } = __VLS_15.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-item banner-ai" },
});
/** @type {__VLS_StyleScopedClasses['banner-item']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-ai']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-overlay" },
});
/** @type {__VLS_StyleScopedClasses['banner-overlay']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "/image/bannner/bg1.png",
    alt: "AI 问诊",
    ...{ class: "banner-bg" },
});
/** @type {__VLS_StyleScopedClasses['banner-bg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-content" },
});
/** @type {__VLS_StyleScopedClasses['banner-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "banner-title" },
});
/** @type {__VLS_StyleScopedClasses['banner-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "banner-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['banner-subtitle']} */ ;
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "banner-btn" },
}));
const __VLS_20 = __VLS_19({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "banner-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
let __VLS_23;
const __VLS_24 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.goTo('/ai-consultation');
            // @ts-ignore
            [carouselHeight, goTo,];
        } });
/** @type {__VLS_StyleScopedClasses['banner-btn']} */ ;
const { default: __VLS_25 } = __VLS_21.slots;
// @ts-ignore
[];
var __VLS_21;
var __VLS_22;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-decoration" },
});
/** @type {__VLS_StyleScopedClasses['banner-decoration']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "floating-star star-1" },
});
/** @type {__VLS_StyleScopedClasses['floating-star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "floating-star star-2" },
});
/** @type {__VLS_StyleScopedClasses['floating-star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "floating-star star-3" },
});
/** @type {__VLS_StyleScopedClasses['floating-star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-3']} */ ;
// @ts-ignore
[];
var __VLS_15;
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.elCarouselItem | typeof __VLS_components.ElCarouselItem | typeof __VLS_components.elCarouselItem | typeof __VLS_components.ElCarouselItem} */
elCarouselItem;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({}));
const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
const { default: __VLS_31 } = __VLS_29.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-item banner-consult" },
});
/** @type {__VLS_StyleScopedClasses['banner-item']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-consult']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-overlay" },
});
/** @type {__VLS_StyleScopedClasses['banner-overlay']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "/image/bannner/bg2.jpg",
    alt: "心理咨询",
    ...{ class: "banner-bg" },
});
/** @type {__VLS_StyleScopedClasses['banner-bg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-content" },
});
/** @type {__VLS_StyleScopedClasses['banner-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "banner-title" },
});
/** @type {__VLS_StyleScopedClasses['banner-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "banner-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['banner-subtitle']} */ ;
let __VLS_32;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "banner-btn" },
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "banner-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_37;
const __VLS_38 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.goTo('/consultation');
            // @ts-ignore
            [goTo,];
        } });
/** @type {__VLS_StyleScopedClasses['banner-btn']} */ ;
const { default: __VLS_39 } = __VLS_35.slots;
// @ts-ignore
[];
var __VLS_35;
var __VLS_36;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-decoration" },
});
/** @type {__VLS_StyleScopedClasses['banner-decoration']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "floating-star star-4" },
});
/** @type {__VLS_StyleScopedClasses['floating-star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "floating-star star-5" },
});
/** @type {__VLS_StyleScopedClasses['floating-star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-5']} */ ;
// @ts-ignore
[];
var __VLS_29;
let __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.elCarouselItem | typeof __VLS_components.ElCarouselItem | typeof __VLS_components.elCarouselItem | typeof __VLS_components.ElCarouselItem} */
elCarouselItem;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({}));
const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const { default: __VLS_45 } = __VLS_43.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-item banner-assess" },
});
/** @type {__VLS_StyleScopedClasses['banner-item']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-assess']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-overlay" },
});
/** @type {__VLS_StyleScopedClasses['banner-overlay']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "/image/bannner/bg3.jpg",
    alt: "心理测评",
    ...{ class: "banner-bg" },
});
/** @type {__VLS_StyleScopedClasses['banner-bg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-content" },
});
/** @type {__VLS_StyleScopedClasses['banner-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "banner-title" },
});
/** @type {__VLS_StyleScopedClasses['banner-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "banner-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['banner-subtitle']} */ ;
let __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "banner-btn" },
}));
const __VLS_48 = __VLS_47({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "banner-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
let __VLS_51;
const __VLS_52 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.goTo('/assessments');
            // @ts-ignore
            [goTo,];
        } });
/** @type {__VLS_StyleScopedClasses['banner-btn']} */ ;
const { default: __VLS_53 } = __VLS_49.slots;
// @ts-ignore
[];
var __VLS_49;
var __VLS_50;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-decoration" },
});
/** @type {__VLS_StyleScopedClasses['banner-decoration']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "floating-star star-6" },
});
/** @type {__VLS_StyleScopedClasses['floating-star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "floating-star star-7" },
});
/** @type {__VLS_StyleScopedClasses['floating-star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-7']} */ ;
// @ts-ignore
[];
var __VLS_43;
let __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.elCarouselItem | typeof __VLS_components.ElCarouselItem | typeof __VLS_components.elCarouselItem | typeof __VLS_components.ElCarouselItem} */
elCarouselItem;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({}));
const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
const { default: __VLS_59 } = __VLS_57.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-item banner-wiki" },
});
/** @type {__VLS_StyleScopedClasses['banner-item']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-wiki']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-overlay" },
});
/** @type {__VLS_StyleScopedClasses['banner-overlay']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "/image/bannner/bg4.jpg",
    alt: "心理百科",
    ...{ class: "banner-bg" },
});
/** @type {__VLS_StyleScopedClasses['banner-bg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-content" },
});
/** @type {__VLS_StyleScopedClasses['banner-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "banner-title" },
});
/** @type {__VLS_StyleScopedClasses['banner-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "banner-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['banner-subtitle']} */ ;
let __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "banner-btn" },
}));
const __VLS_62 = __VLS_61({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "banner-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_65;
const __VLS_66 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.goTo('/articles');
            // @ts-ignore
            [goTo,];
        } });
/** @type {__VLS_StyleScopedClasses['banner-btn']} */ ;
const { default: __VLS_67 } = __VLS_63.slots;
// @ts-ignore
[];
var __VLS_63;
var __VLS_64;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "banner-decoration" },
});
/** @type {__VLS_StyleScopedClasses['banner-decoration']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "floating-star star-8" },
});
/** @type {__VLS_StyleScopedClasses['floating-star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "floating-star star-9" },
});
/** @type {__VLS_StyleScopedClasses['floating-star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-9']} */ ;
// @ts-ignore
[];
var __VLS_57;
// @ts-ignore
[];
var __VLS_9;
const __VLS_68 = ServicesSection;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({}));
const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
const __VLS_73 = JoinSection;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({}));
const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
const __VLS_78 = AboutSection;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({}));
const __VLS_80 = __VLS_79({}, ...__VLS_functionalComponentArgsRest(__VLS_79));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mobile-features mobile-visible" },
});
/** @type {__VLS_StyleScopedClasses['mobile-features']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-visible']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature-grid" },
});
/** @type {__VLS_StyleScopedClasses['feature-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.goTo('/ai-consultation');
            // @ts-ignore
            [goTo,];
        } },
    ...{ class: "feature-card" },
});
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature-icon" },
});
/** @type {__VLS_StyleScopedClasses['feature-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.goTo('/consultation');
            // @ts-ignore
            [goTo,];
        } },
    ...{ class: "feature-card" },
});
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature-icon" },
});
/** @type {__VLS_StyleScopedClasses['feature-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.goTo('/assessments');
            // @ts-ignore
            [goTo,];
        } },
    ...{ class: "feature-card" },
});
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature-icon" },
});
/** @type {__VLS_StyleScopedClasses['feature-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.goTo('/articles');
            // @ts-ignore
            [goTo,];
        } },
    ...{ class: "feature-card" },
});
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature-icon" },
});
/** @type {__VLS_StyleScopedClasses['feature-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
