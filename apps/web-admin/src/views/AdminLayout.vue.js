/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useRouter, useRoute } from 'vue-router';
import { HomeFilled, User, OfficeBuilding, DataBoard, Files, School, UserFilled, Reading, Calendar, ChatDotSquare, ChatDotRound, ChatLineSquare, Warning, Setting, Money, Service, Collection, Medal } from '@element-plus/icons-vue';
const router = useRouter();
const route = useRoute();
const user = JSON.parse(localStorage.getItem('user') || '{}');
const username = user.nickname || '管理员';
const role = user.role || 0;
const isPsychologist = user.isPsychologist === 1;
// 根据路径判断菜单类型
const isPsychologistRoute = route.path.startsWith('/psychologist-admin');
const isAdminRoute = route.path.startsWith('/admin');
const isHospitalRoute = route.path.startsWith('/hospital');
const isDoctorRoute = route.path.startsWith('/doctor');
const handleCommand = (command) => {
    if (command === 'logout') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    }
    else if (command === 'home') {
        router.push('/home');
    }
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['light-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['light-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['light-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['light-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['light-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['light-theme']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer | typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer} */
elContainer;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "admin-layout" },
    ...{ class: ({ 'light-theme': __VLS_ctx.isPsychologistRoute }) },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "admin-layout" },
    ...{ class: ({ 'light-theme': __VLS_ctx.isPsychologistRoute }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['admin-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['light-theme']} */ ;
const { default: __VLS_6 } = __VLS_3.slots;
let __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.elAside | typeof __VLS_components.ElAside | typeof __VLS_components.elAside | typeof __VLS_components.ElAside} */
elAside;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    width: "200px",
    ...{ class: "aside" },
}));
const __VLS_9 = __VLS_8({
    width: "200px",
    ...{ class: "aside" },
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
/** @type {__VLS_StyleScopedClasses['aside']} */ ;
const { default: __VLS_12 } = __VLS_10.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "logo" },
});
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elMenu | typeof __VLS_components.ElMenu | typeof __VLS_components.elMenu | typeof __VLS_components.ElMenu} */
elMenu;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    defaultActive: (__VLS_ctx.$route.path),
    ...{ class: "el-menu-vertical" },
    router: true,
    backgroundColor: "#304156",
    textColor: "#bfcbd9",
    activeTextColor: "#409EFF",
}));
const __VLS_15 = __VLS_14({
    defaultActive: (__VLS_ctx.$route.path),
    ...{ class: "el-menu-vertical" },
    router: true,
    backgroundColor: "#304156",
    textColor: "#bfcbd9",
    activeTextColor: "#409EFF",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
/** @type {__VLS_StyleScopedClasses['el-menu-vertical']} */ ;
const { default: __VLS_18 } = __VLS_16.slots;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
elMenuItem;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    index: "/home",
}));
const __VLS_21 = __VLS_20({
    index: "/home",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const { default: __VLS_24 } = __VLS_22.slots;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const { default: __VLS_30 } = __VLS_28.slots;
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.HomeFilled} */
HomeFilled;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({}));
const __VLS_33 = __VLS_32({}, ...__VLS_functionalComponentArgsRest(__VLS_32));
// @ts-ignore
[isPsychologistRoute, $route,];
var __VLS_28;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_22;
if (__VLS_ctx.role === 4 && __VLS_ctx.isAdminRoute) {
    let __VLS_36;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        index: "/admin/dashboard",
    }));
    const __VLS_38 = __VLS_37({
        index: "/admin/dashboard",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    const { default: __VLS_41 } = __VLS_39.slots;
    let __VLS_42;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({}));
    const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
    const { default: __VLS_47 } = __VLS_45.slots;
    let __VLS_48;
    /** @ts-ignore @type {typeof __VLS_components.DataBoard} */
    DataBoard;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({}));
    const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
    // @ts-ignore
    [role, isAdminRoute,];
    var __VLS_45;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_39;
    let __VLS_53;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
        index: "/admin/hospitals",
    }));
    const __VLS_55 = __VLS_54({
        index: "/admin/hospitals",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    const { default: __VLS_58 } = __VLS_56.slots;
    let __VLS_59;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({}));
    const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
    const { default: __VLS_64 } = __VLS_62.slots;
    let __VLS_65;
    /** @ts-ignore @type {typeof __VLS_components.School} */
    School;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({}));
    const __VLS_67 = __VLS_66({}, ...__VLS_functionalComponentArgsRest(__VLS_66));
    // @ts-ignore
    [];
    var __VLS_62;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_56;
    let __VLS_70;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
        index: "/admin/users",
    }));
    const __VLS_72 = __VLS_71({
        index: "/admin/users",
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    const { default: __VLS_75 } = __VLS_73.slots;
    let __VLS_76;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({}));
    const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
    const { default: __VLS_81 } = __VLS_79.slots;
    let __VLS_82;
    /** @ts-ignore @type {typeof __VLS_components.UserFilled} */
    UserFilled;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({}));
    const __VLS_84 = __VLS_83({}, ...__VLS_functionalComponentArgsRest(__VLS_83));
    // @ts-ignore
    [];
    var __VLS_79;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_73;
    let __VLS_87;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
        index: "/admin/psychologist",
    }));
    const __VLS_89 = __VLS_88({
        index: "/admin/psychologist",
    }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    const { default: __VLS_92 } = __VLS_90.slots;
    let __VLS_93;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({}));
    const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
    const { default: __VLS_98 } = __VLS_96.slots;
    let __VLS_99;
    /** @ts-ignore @type {typeof __VLS_components.Service} */
    Service;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({}));
    const __VLS_101 = __VLS_100({}, ...__VLS_functionalComponentArgsRest(__VLS_100));
    // @ts-ignore
    [];
    var __VLS_96;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_90;
    let __VLS_104;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
        index: "/admin/psychologist-fields",
    }));
    const __VLS_106 = __VLS_105({
        index: "/admin/psychologist-fields",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    const { default: __VLS_109 } = __VLS_107.slots;
    let __VLS_110;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({}));
    const __VLS_112 = __VLS_111({}, ...__VLS_functionalComponentArgsRest(__VLS_111));
    const { default: __VLS_115 } = __VLS_113.slots;
    let __VLS_116;
    /** @ts-ignore @type {typeof __VLS_components.Collection} */
    Collection;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({}));
    const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
    // @ts-ignore
    [];
    var __VLS_113;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_107;
    let __VLS_121;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
        index: "/admin/psychologist-qualifications",
    }));
    const __VLS_123 = __VLS_122({
        index: "/admin/psychologist-qualifications",
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    const { default: __VLS_126 } = __VLS_124.slots;
    let __VLS_127;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({}));
    const __VLS_129 = __VLS_128({}, ...__VLS_functionalComponentArgsRest(__VLS_128));
    const { default: __VLS_132 } = __VLS_130.slots;
    let __VLS_133;
    /** @ts-ignore @type {typeof __VLS_components.Medal} */
    Medal;
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({}));
    const __VLS_135 = __VLS_134({}, ...__VLS_functionalComponentArgsRest(__VLS_134));
    // @ts-ignore
    [];
    var __VLS_130;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_124;
    let __VLS_138;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
        index: "/admin/psychologist/audit",
    }));
    const __VLS_140 = __VLS_139({
        index: "/admin/psychologist/audit",
    }, ...__VLS_functionalComponentArgsRest(__VLS_139));
    const { default: __VLS_143 } = __VLS_141.slots;
    let __VLS_144;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({}));
    const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
    const { default: __VLS_149 } = __VLS_147.slots;
    let __VLS_150;
    /** @ts-ignore @type {typeof __VLS_components.DocumentChecked} */
    DocumentChecked;
    // @ts-ignore
    const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({}));
    const __VLS_152 = __VLS_151({}, ...__VLS_functionalComponentArgsRest(__VLS_151));
    // @ts-ignore
    [];
    var __VLS_147;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_141;
    let __VLS_155;
    /** @ts-ignore @type {typeof __VLS_components.elSubMenu | typeof __VLS_components.ElSubMenu | typeof __VLS_components.elSubMenu | typeof __VLS_components.ElSubMenu} */
    elSubMenu;
    // @ts-ignore
    const __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155({
        index: "/admin/content",
    }));
    const __VLS_157 = __VLS_156({
        index: "/admin/content",
    }, ...__VLS_functionalComponentArgsRest(__VLS_156));
    const { default: __VLS_160 } = __VLS_158.slots;
    {
        const { title: __VLS_161 } = __VLS_158.slots;
        let __VLS_162;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_163 = __VLS_asFunctionalComponent1(__VLS_162, new __VLS_162({}));
        const __VLS_164 = __VLS_163({}, ...__VLS_functionalComponentArgsRest(__VLS_163));
        const { default: __VLS_167 } = __VLS_165.slots;
        let __VLS_168;
        /** @ts-ignore @type {typeof __VLS_components.Reading} */
        Reading;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({}));
        const __VLS_170 = __VLS_169({}, ...__VLS_functionalComponentArgsRest(__VLS_169));
        // @ts-ignore
        [];
        var __VLS_165;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        // @ts-ignore
        [];
    }
    let __VLS_173;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
        index: "/admin/content/articles",
    }));
    const __VLS_175 = __VLS_174({
        index: "/admin/content/articles",
    }, ...__VLS_functionalComponentArgsRest(__VLS_174));
    const { default: __VLS_178 } = __VLS_176.slots;
    // @ts-ignore
    [];
    var __VLS_176;
    let __VLS_179;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_180 = __VLS_asFunctionalComponent1(__VLS_179, new __VLS_179({
        index: "/admin/content/courses",
    }));
    const __VLS_181 = __VLS_180({
        index: "/admin/content/courses",
    }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    const { default: __VLS_184 } = __VLS_182.slots;
    // @ts-ignore
    [];
    var __VLS_182;
    let __VLS_185;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
        index: "/admin/content/assessments",
    }));
    const __VLS_187 = __VLS_186({
        index: "/admin/content/assessments",
    }, ...__VLS_functionalComponentArgsRest(__VLS_186));
    const { default: __VLS_190 } = __VLS_188.slots;
    // @ts-ignore
    [];
    var __VLS_188;
    let __VLS_191;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191({
        index: "/admin/content/books",
    }));
    const __VLS_193 = __VLS_192({
        index: "/admin/content/books",
    }, ...__VLS_functionalComponentArgsRest(__VLS_192));
    const { default: __VLS_196 } = __VLS_194.slots;
    // @ts-ignore
    [];
    var __VLS_194;
    let __VLS_197;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_198 = __VLS_asFunctionalComponent1(__VLS_197, new __VLS_197({
        index: "/admin/system/quotes",
    }));
    const __VLS_199 = __VLS_198({
        index: "/admin/system/quotes",
    }, ...__VLS_functionalComponentArgsRest(__VLS_198));
    const { default: __VLS_202 } = __VLS_200.slots;
    // @ts-ignore
    [];
    var __VLS_200;
    let __VLS_203;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_204 = __VLS_asFunctionalComponent1(__VLS_203, new __VLS_203({
        index: "/admin/content/tag",
    }));
    const __VLS_205 = __VLS_204({
        index: "/admin/content/tag",
    }, ...__VLS_functionalComponentArgsRest(__VLS_204));
    const { default: __VLS_208 } = __VLS_206.slots;
    // @ts-ignore
    [];
    var __VLS_206;
    let __VLS_209;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_210 = __VLS_asFunctionalComponent1(__VLS_209, new __VLS_209({
        index: "/admin/content/audit",
    }));
    const __VLS_211 = __VLS_210({
        index: "/admin/content/audit",
    }, ...__VLS_functionalComponentArgsRest(__VLS_210));
    const { default: __VLS_214 } = __VLS_212.slots;
    // @ts-ignore
    [];
    var __VLS_212;
    // @ts-ignore
    [];
    var __VLS_158;
    let __VLS_215;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_216 = __VLS_asFunctionalComponent1(__VLS_215, new __VLS_215({
        index: "/admin/system/platform-income",
    }));
    const __VLS_217 = __VLS_216({
        index: "/admin/system/platform-income",
    }, ...__VLS_functionalComponentArgsRest(__VLS_216));
    const { default: __VLS_220 } = __VLS_218.slots;
    let __VLS_221;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_222 = __VLS_asFunctionalComponent1(__VLS_221, new __VLS_221({}));
    const __VLS_223 = __VLS_222({}, ...__VLS_functionalComponentArgsRest(__VLS_222));
    const { default: __VLS_226 } = __VLS_224.slots;
    let __VLS_227;
    /** @ts-ignore @type {typeof __VLS_components.ChatLineSquare} */
    ChatLineSquare;
    // @ts-ignore
    const __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({}));
    const __VLS_229 = __VLS_228({}, ...__VLS_functionalComponentArgsRest(__VLS_228));
    // @ts-ignore
    [];
    var __VLS_224;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_218;
    let __VLS_232;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent1(__VLS_232, new __VLS_232({
        index: "/admin/complaints",
    }));
    const __VLS_234 = __VLS_233({
        index: "/admin/complaints",
    }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    const { default: __VLS_237 } = __VLS_235.slots;
    let __VLS_238;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_239 = __VLS_asFunctionalComponent1(__VLS_238, new __VLS_238({}));
    const __VLS_240 = __VLS_239({}, ...__VLS_functionalComponentArgsRest(__VLS_239));
    const { default: __VLS_243 } = __VLS_241.slots;
    let __VLS_244;
    /** @ts-ignore @type {typeof __VLS_components.Warning} */
    Warning;
    // @ts-ignore
    const __VLS_245 = __VLS_asFunctionalComponent1(__VLS_244, new __VLS_244({}));
    const __VLS_246 = __VLS_245({}, ...__VLS_functionalComponentArgsRest(__VLS_245));
    // @ts-ignore
    [];
    var __VLS_241;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_235;
    let __VLS_249;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_250 = __VLS_asFunctionalComponent1(__VLS_249, new __VLS_249({
        index: "/admin/meme",
    }));
    const __VLS_251 = __VLS_250({
        index: "/admin/meme",
    }, ...__VLS_functionalComponentArgsRest(__VLS_250));
    const { default: __VLS_254 } = __VLS_252.slots;
    let __VLS_255;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_256 = __VLS_asFunctionalComponent1(__VLS_255, new __VLS_255({}));
    const __VLS_257 = __VLS_256({}, ...__VLS_functionalComponentArgsRest(__VLS_256));
    const { default: __VLS_260 } = __VLS_258.slots;
    let __VLS_261;
    /** @ts-ignore @type {typeof __VLS_components.Warning} */
    Warning;
    // @ts-ignore
    const __VLS_262 = __VLS_asFunctionalComponent1(__VLS_261, new __VLS_261({}));
    const __VLS_263 = __VLS_262({}, ...__VLS_functionalComponentArgsRest(__VLS_262));
    // @ts-ignore
    [];
    var __VLS_258;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_252;
}
if (__VLS_ctx.role === 3 && __VLS_ctx.isHospitalRoute) {
    let __VLS_266;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_267 = __VLS_asFunctionalComponent1(__VLS_266, new __VLS_266({
        index: "/hospital/dashboard",
    }));
    const __VLS_268 = __VLS_267({
        index: "/hospital/dashboard",
    }, ...__VLS_functionalComponentArgsRest(__VLS_267));
    const { default: __VLS_271 } = __VLS_269.slots;
    let __VLS_272;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent1(__VLS_272, new __VLS_272({}));
    const __VLS_274 = __VLS_273({}, ...__VLS_functionalComponentArgsRest(__VLS_273));
    const { default: __VLS_277 } = __VLS_275.slots;
    let __VLS_278;
    /** @ts-ignore @type {typeof __VLS_components.DataBoard} */
    DataBoard;
    // @ts-ignore
    const __VLS_279 = __VLS_asFunctionalComponent1(__VLS_278, new __VLS_278({}));
    const __VLS_280 = __VLS_279({}, ...__VLS_functionalComponentArgsRest(__VLS_279));
    // @ts-ignore
    [role, isHospitalRoute,];
    var __VLS_275;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_269;
    let __VLS_283;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_284 = __VLS_asFunctionalComponent1(__VLS_283, new __VLS_283({
        index: "/hospital/doctors",
    }));
    const __VLS_285 = __VLS_284({
        index: "/hospital/doctors",
    }, ...__VLS_functionalComponentArgsRest(__VLS_284));
    const { default: __VLS_288 } = __VLS_286.slots;
    let __VLS_289;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_290 = __VLS_asFunctionalComponent1(__VLS_289, new __VLS_289({}));
    const __VLS_291 = __VLS_290({}, ...__VLS_functionalComponentArgsRest(__VLS_290));
    const { default: __VLS_294 } = __VLS_292.slots;
    let __VLS_295;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_296 = __VLS_asFunctionalComponent1(__VLS_295, new __VLS_295({}));
    const __VLS_297 = __VLS_296({}, ...__VLS_functionalComponentArgsRest(__VLS_296));
    // @ts-ignore
    [];
    var __VLS_292;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_286;
    let __VLS_300;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_301 = __VLS_asFunctionalComponent1(__VLS_300, new __VLS_300({
        index: "/hospital/departments",
    }));
    const __VLS_302 = __VLS_301({
        index: "/hospital/departments",
    }, ...__VLS_functionalComponentArgsRest(__VLS_301));
    const { default: __VLS_305 } = __VLS_303.slots;
    let __VLS_306;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_307 = __VLS_asFunctionalComponent1(__VLS_306, new __VLS_306({}));
    const __VLS_308 = __VLS_307({}, ...__VLS_functionalComponentArgsRest(__VLS_307));
    const { default: __VLS_311 } = __VLS_309.slots;
    let __VLS_312;
    /** @ts-ignore @type {typeof __VLS_components.OfficeBuilding} */
    OfficeBuilding;
    // @ts-ignore
    const __VLS_313 = __VLS_asFunctionalComponent1(__VLS_312, new __VLS_312({}));
    const __VLS_314 = __VLS_313({}, ...__VLS_functionalComponentArgsRest(__VLS_313));
    // @ts-ignore
    [];
    var __VLS_309;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_303;
    let __VLS_317;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_318 = __VLS_asFunctionalComponent1(__VLS_317, new __VLS_317({
        index: "/hospital/feedbacks",
    }));
    const __VLS_319 = __VLS_318({
        index: "/hospital/feedbacks",
    }, ...__VLS_functionalComponentArgsRest(__VLS_318));
    const { default: __VLS_322 } = __VLS_320.slots;
    let __VLS_323;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_324 = __VLS_asFunctionalComponent1(__VLS_323, new __VLS_323({}));
    const __VLS_325 = __VLS_324({}, ...__VLS_functionalComponentArgsRest(__VLS_324));
    const { default: __VLS_328 } = __VLS_326.slots;
    let __VLS_329;
    /** @ts-ignore @type {typeof __VLS_components.ChatDotSquare} */
    ChatDotSquare;
    // @ts-ignore
    const __VLS_330 = __VLS_asFunctionalComponent1(__VLS_329, new __VLS_329({}));
    const __VLS_331 = __VLS_330({}, ...__VLS_functionalComponentArgsRest(__VLS_330));
    // @ts-ignore
    [];
    var __VLS_326;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_320;
    let __VLS_334;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_335 = __VLS_asFunctionalComponent1(__VLS_334, new __VLS_334({
        index: "/hospital/complaints",
    }));
    const __VLS_336 = __VLS_335({
        index: "/hospital/complaints",
    }, ...__VLS_functionalComponentArgsRest(__VLS_335));
    const { default: __VLS_339 } = __VLS_337.slots;
    let __VLS_340;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_341 = __VLS_asFunctionalComponent1(__VLS_340, new __VLS_340({}));
    const __VLS_342 = __VLS_341({}, ...__VLS_functionalComponentArgsRest(__VLS_341));
    const { default: __VLS_345 } = __VLS_343.slots;
    let __VLS_346;
    /** @ts-ignore @type {typeof __VLS_components.Warning} */
    Warning;
    // @ts-ignore
    const __VLS_347 = __VLS_asFunctionalComponent1(__VLS_346, new __VLS_346({}));
    const __VLS_348 = __VLS_347({}, ...__VLS_functionalComponentArgsRest(__VLS_347));
    // @ts-ignore
    [];
    var __VLS_343;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_337;
    let __VLS_351;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_352 = __VLS_asFunctionalComponent1(__VLS_351, new __VLS_351({
        index: "/admin/content/articles",
    }));
    const __VLS_353 = __VLS_352({
        index: "/admin/content/articles",
    }, ...__VLS_functionalComponentArgsRest(__VLS_352));
    const { default: __VLS_356 } = __VLS_354.slots;
    let __VLS_357;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_358 = __VLS_asFunctionalComponent1(__VLS_357, new __VLS_357({}));
    const __VLS_359 = __VLS_358({}, ...__VLS_functionalComponentArgsRest(__VLS_358));
    const { default: __VLS_362 } = __VLS_360.slots;
    let __VLS_363;
    /** @ts-ignore @type {typeof __VLS_components.Reading} */
    Reading;
    // @ts-ignore
    const __VLS_364 = __VLS_asFunctionalComponent1(__VLS_363, new __VLS_363({}));
    const __VLS_365 = __VLS_364({}, ...__VLS_functionalComponentArgsRest(__VLS_364));
    // @ts-ignore
    [];
    var __VLS_360;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_354;
}
if (__VLS_ctx.role === 2 && __VLS_ctx.isDoctorRoute) {
    let __VLS_368;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_369 = __VLS_asFunctionalComponent1(__VLS_368, new __VLS_368({
        index: "/doctor/dashboard",
    }));
    const __VLS_370 = __VLS_369({
        index: "/doctor/dashboard",
    }, ...__VLS_functionalComponentArgsRest(__VLS_369));
    const { default: __VLS_373 } = __VLS_371.slots;
    let __VLS_374;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_375 = __VLS_asFunctionalComponent1(__VLS_374, new __VLS_374({}));
    const __VLS_376 = __VLS_375({}, ...__VLS_functionalComponentArgsRest(__VLS_375));
    const { default: __VLS_379 } = __VLS_377.slots;
    let __VLS_380;
    /** @ts-ignore @type {typeof __VLS_components.DataBoard} */
    DataBoard;
    // @ts-ignore
    const __VLS_381 = __VLS_asFunctionalComponent1(__VLS_380, new __VLS_380({}));
    const __VLS_382 = __VLS_381({}, ...__VLS_functionalComponentArgsRest(__VLS_381));
    // @ts-ignore
    [role, isDoctorRoute,];
    var __VLS_377;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_371;
    let __VLS_385;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_386 = __VLS_asFunctionalComponent1(__VLS_385, new __VLS_385({
        index: "/doctor/workbench",
    }));
    const __VLS_387 = __VLS_386({
        index: "/doctor/workbench",
    }, ...__VLS_functionalComponentArgsRest(__VLS_386));
    const { default: __VLS_390 } = __VLS_388.slots;
    let __VLS_391;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_392 = __VLS_asFunctionalComponent1(__VLS_391, new __VLS_391({}));
    const __VLS_393 = __VLS_392({}, ...__VLS_functionalComponentArgsRest(__VLS_392));
    const { default: __VLS_396 } = __VLS_394.slots;
    let __VLS_397;
    /** @ts-ignore @type {typeof __VLS_components.Setting} */
    Setting;
    // @ts-ignore
    const __VLS_398 = __VLS_asFunctionalComponent1(__VLS_397, new __VLS_397({}));
    const __VLS_399 = __VLS_398({}, ...__VLS_functionalComponentArgsRest(__VLS_398));
    // @ts-ignore
    [];
    var __VLS_394;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_388;
    let __VLS_402;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_403 = __VLS_asFunctionalComponent1(__VLS_402, new __VLS_402({
        index: "/doctor/schedule",
    }));
    const __VLS_404 = __VLS_403({
        index: "/doctor/schedule",
    }, ...__VLS_functionalComponentArgsRest(__VLS_403));
    const { default: __VLS_407 } = __VLS_405.slots;
    let __VLS_408;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_409 = __VLS_asFunctionalComponent1(__VLS_408, new __VLS_408({}));
    const __VLS_410 = __VLS_409({}, ...__VLS_functionalComponentArgsRest(__VLS_409));
    const { default: __VLS_413 } = __VLS_411.slots;
    let __VLS_414;
    /** @ts-ignore @type {typeof __VLS_components.Calendar} */
    Calendar;
    // @ts-ignore
    const __VLS_415 = __VLS_asFunctionalComponent1(__VLS_414, new __VLS_414({}));
    const __VLS_416 = __VLS_415({}, ...__VLS_functionalComponentArgsRest(__VLS_415));
    // @ts-ignore
    [];
    var __VLS_411;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_405;
    let __VLS_419;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_420 = __VLS_asFunctionalComponent1(__VLS_419, new __VLS_419({
        index: "/doctor/patients",
    }));
    const __VLS_421 = __VLS_420({
        index: "/doctor/patients",
    }, ...__VLS_functionalComponentArgsRest(__VLS_420));
    const { default: __VLS_424 } = __VLS_422.slots;
    let __VLS_425;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_426 = __VLS_asFunctionalComponent1(__VLS_425, new __VLS_425({}));
    const __VLS_427 = __VLS_426({}, ...__VLS_functionalComponentArgsRest(__VLS_426));
    const { default: __VLS_430 } = __VLS_428.slots;
    let __VLS_431;
    /** @ts-ignore @type {typeof __VLS_components.Files} */
    Files;
    // @ts-ignore
    const __VLS_432 = __VLS_asFunctionalComponent1(__VLS_431, new __VLS_431({}));
    const __VLS_433 = __VLS_432({}, ...__VLS_functionalComponentArgsRest(__VLS_432));
    // @ts-ignore
    [];
    var __VLS_428;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_422;
}
if (__VLS_ctx.isPsychologist && __VLS_ctx.isPsychologistRoute) {
    let __VLS_436;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_437 = __VLS_asFunctionalComponent1(__VLS_436, new __VLS_436({
        index: "/psychologist-admin/workbench",
    }));
    const __VLS_438 = __VLS_437({
        index: "/psychologist-admin/workbench",
    }, ...__VLS_functionalComponentArgsRest(__VLS_437));
    const { default: __VLS_441 } = __VLS_439.slots;
    let __VLS_442;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_443 = __VLS_asFunctionalComponent1(__VLS_442, new __VLS_442({}));
    const __VLS_444 = __VLS_443({}, ...__VLS_functionalComponentArgsRest(__VLS_443));
    const { default: __VLS_447 } = __VLS_445.slots;
    let __VLS_448;
    /** @ts-ignore @type {typeof __VLS_components.DataBoard} */
    DataBoard;
    // @ts-ignore
    const __VLS_449 = __VLS_asFunctionalComponent1(__VLS_448, new __VLS_448({}));
    const __VLS_450 = __VLS_449({}, ...__VLS_functionalComponentArgsRest(__VLS_449));
    // @ts-ignore
    [isPsychologistRoute, isPsychologist,];
    var __VLS_445;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_439;
    let __VLS_453;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_454 = __VLS_asFunctionalComponent1(__VLS_453, new __VLS_453({
        index: "/psychologist-admin/schedule",
    }));
    const __VLS_455 = __VLS_454({
        index: "/psychologist-admin/schedule",
    }, ...__VLS_functionalComponentArgsRest(__VLS_454));
    const { default: __VLS_458 } = __VLS_456.slots;
    let __VLS_459;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_460 = __VLS_asFunctionalComponent1(__VLS_459, new __VLS_459({}));
    const __VLS_461 = __VLS_460({}, ...__VLS_functionalComponentArgsRest(__VLS_460));
    const { default: __VLS_464 } = __VLS_462.slots;
    let __VLS_465;
    /** @ts-ignore @type {typeof __VLS_components.Calendar} */
    Calendar;
    // @ts-ignore
    const __VLS_466 = __VLS_asFunctionalComponent1(__VLS_465, new __VLS_465({}));
    const __VLS_467 = __VLS_466({}, ...__VLS_functionalComponentArgsRest(__VLS_466));
    // @ts-ignore
    [];
    var __VLS_462;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_456;
    let __VLS_470;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_471 = __VLS_asFunctionalComponent1(__VLS_470, new __VLS_470({
        index: "/psychologist-admin/appointments",
    }));
    const __VLS_472 = __VLS_471({
        index: "/psychologist-admin/appointments",
    }, ...__VLS_functionalComponentArgsRest(__VLS_471));
    const { default: __VLS_475 } = __VLS_473.slots;
    let __VLS_476;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_477 = __VLS_asFunctionalComponent1(__VLS_476, new __VLS_476({}));
    const __VLS_478 = __VLS_477({}, ...__VLS_functionalComponentArgsRest(__VLS_477));
    const { default: __VLS_481 } = __VLS_479.slots;
    let __VLS_482;
    /** @ts-ignore @type {typeof __VLS_components.Files} */
    Files;
    // @ts-ignore
    const __VLS_483 = __VLS_asFunctionalComponent1(__VLS_482, new __VLS_482({}));
    const __VLS_484 = __VLS_483({}, ...__VLS_functionalComponentArgsRest(__VLS_483));
    // @ts-ignore
    [];
    var __VLS_479;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_473;
    let __VLS_487;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_488 = __VLS_asFunctionalComponent1(__VLS_487, new __VLS_487({
        index: "/psychologist-admin/income",
    }));
    const __VLS_489 = __VLS_488({
        index: "/psychologist-admin/income",
    }, ...__VLS_functionalComponentArgsRest(__VLS_488));
    const { default: __VLS_492 } = __VLS_490.slots;
    let __VLS_493;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_494 = __VLS_asFunctionalComponent1(__VLS_493, new __VLS_493({}));
    const __VLS_495 = __VLS_494({}, ...__VLS_functionalComponentArgsRest(__VLS_494));
    const { default: __VLS_498 } = __VLS_496.slots;
    let __VLS_499;
    /** @ts-ignore @type {typeof __VLS_components.Money} */
    Money;
    // @ts-ignore
    const __VLS_500 = __VLS_asFunctionalComponent1(__VLS_499, new __VLS_499({}));
    const __VLS_501 = __VLS_500({}, ...__VLS_functionalComponentArgsRest(__VLS_500));
    // @ts-ignore
    [];
    var __VLS_496;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_490;
    let __VLS_504;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_505 = __VLS_asFunctionalComponent1(__VLS_504, new __VLS_504({
        index: "/psychologist-admin/chat",
    }));
    const __VLS_506 = __VLS_505({
        index: "/psychologist-admin/chat",
    }, ...__VLS_functionalComponentArgsRest(__VLS_505));
    const { default: __VLS_509 } = __VLS_507.slots;
    let __VLS_510;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_511 = __VLS_asFunctionalComponent1(__VLS_510, new __VLS_510({}));
    const __VLS_512 = __VLS_511({}, ...__VLS_functionalComponentArgsRest(__VLS_511));
    const { default: __VLS_515 } = __VLS_513.slots;
    let __VLS_516;
    /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
    ChatDotRound;
    // @ts-ignore
    const __VLS_517 = __VLS_asFunctionalComponent1(__VLS_516, new __VLS_516({}));
    const __VLS_518 = __VLS_517({}, ...__VLS_functionalComponentArgsRest(__VLS_517));
    // @ts-ignore
    [];
    var __VLS_513;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_507;
    let __VLS_521;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_522 = __VLS_asFunctionalComponent1(__VLS_521, new __VLS_521({
        index: "/psychologist-admin/profile",
    }));
    const __VLS_523 = __VLS_522({
        index: "/psychologist-admin/profile",
    }, ...__VLS_functionalComponentArgsRest(__VLS_522));
    const { default: __VLS_526 } = __VLS_524.slots;
    let __VLS_527;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_528 = __VLS_asFunctionalComponent1(__VLS_527, new __VLS_527({}));
    const __VLS_529 = __VLS_528({}, ...__VLS_functionalComponentArgsRest(__VLS_528));
    const { default: __VLS_532 } = __VLS_530.slots;
    let __VLS_533;
    /** @ts-ignore @type {typeof __VLS_components.UserFilled} */
    UserFilled;
    // @ts-ignore
    const __VLS_534 = __VLS_asFunctionalComponent1(__VLS_533, new __VLS_533({}));
    const __VLS_535 = __VLS_534({}, ...__VLS_functionalComponentArgsRest(__VLS_534));
    // @ts-ignore
    [];
    var __VLS_530;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_524;
}
// @ts-ignore
[];
var __VLS_16;
// @ts-ignore
[];
var __VLS_10;
let __VLS_538;
/** @ts-ignore @type {typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer | typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer} */
elContainer;
// @ts-ignore
const __VLS_539 = __VLS_asFunctionalComponent1(__VLS_538, new __VLS_538({}));
const __VLS_540 = __VLS_539({}, ...__VLS_functionalComponentArgsRest(__VLS_539));
const { default: __VLS_543 } = __VLS_541.slots;
let __VLS_544;
/** @ts-ignore @type {typeof __VLS_components.elHeader | typeof __VLS_components.ElHeader | typeof __VLS_components.elHeader | typeof __VLS_components.ElHeader} */
elHeader;
// @ts-ignore
const __VLS_545 = __VLS_asFunctionalComponent1(__VLS_544, new __VLS_544({
    ...{ class: "header" },
}));
const __VLS_546 = __VLS_545({
    ...{ class: "header" },
}, ...__VLS_functionalComponentArgsRest(__VLS_545));
/** @type {__VLS_StyleScopedClasses['header']} */ ;
const { default: __VLS_549 } = __VLS_547.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "breadcrumb" },
});
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-info" },
});
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
let __VLS_550;
/** @ts-ignore @type {typeof __VLS_components.elDropdown | typeof __VLS_components.ElDropdown | typeof __VLS_components.elDropdown | typeof __VLS_components.ElDropdown} */
elDropdown;
// @ts-ignore
const __VLS_551 = __VLS_asFunctionalComponent1(__VLS_550, new __VLS_550({
    ...{ 'onCommand': {} },
}));
const __VLS_552 = __VLS_551({
    ...{ 'onCommand': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_551));
let __VLS_555;
const __VLS_556 = ({ command: {} },
    { onCommand: (__VLS_ctx.handleCommand) });
const { default: __VLS_557 } = __VLS_553.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "el-dropdown-link" },
});
/** @type {__VLS_StyleScopedClasses['el-dropdown-link']} */ ;
let __VLS_558;
/** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
elAvatar;
// @ts-ignore
const __VLS_559 = __VLS_asFunctionalComponent1(__VLS_558, new __VLS_558({
    size: (32),
    src: (__VLS_ctx.user.headPath),
    ...{ style: {} },
}));
const __VLS_560 = __VLS_559({
    size: (32),
    src: (__VLS_ctx.user.headPath),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_559));
const { default: __VLS_563 } = __VLS_561.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
});
// @ts-ignore
[handleCommand, user,];
var __VLS_561;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.username);
let __VLS_564;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_565 = __VLS_asFunctionalComponent1(__VLS_564, new __VLS_564({
    ...{ class: "el-icon--right" },
}));
const __VLS_566 = __VLS_565({
    ...{ class: "el-icon--right" },
}, ...__VLS_functionalComponentArgsRest(__VLS_565));
/** @type {__VLS_StyleScopedClasses['el-icon--right']} */ ;
const { default: __VLS_569 } = __VLS_567.slots;
let __VLS_570;
/** @ts-ignore @type {typeof __VLS_components.arrowDown | typeof __VLS_components.ArrowDown} */
arrowDown;
// @ts-ignore
const __VLS_571 = __VLS_asFunctionalComponent1(__VLS_570, new __VLS_570({}));
const __VLS_572 = __VLS_571({}, ...__VLS_functionalComponentArgsRest(__VLS_571));
// @ts-ignore
[username,];
var __VLS_567;
{
    const { dropdown: __VLS_575 } = __VLS_553.slots;
    let __VLS_576;
    /** @ts-ignore @type {typeof __VLS_components.elDropdownMenu | typeof __VLS_components.ElDropdownMenu | typeof __VLS_components.elDropdownMenu | typeof __VLS_components.ElDropdownMenu} */
    elDropdownMenu;
    // @ts-ignore
    const __VLS_577 = __VLS_asFunctionalComponent1(__VLS_576, new __VLS_576({}));
    const __VLS_578 = __VLS_577({}, ...__VLS_functionalComponentArgsRest(__VLS_577));
    const { default: __VLS_581 } = __VLS_579.slots;
    let __VLS_582;
    /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
    elDropdownItem;
    // @ts-ignore
    const __VLS_583 = __VLS_asFunctionalComponent1(__VLS_582, new __VLS_582({
        command: "home",
    }));
    const __VLS_584 = __VLS_583({
        command: "home",
    }, ...__VLS_functionalComponentArgsRest(__VLS_583));
    const { default: __VLS_587 } = __VLS_585.slots;
    // @ts-ignore
    [];
    var __VLS_585;
    let __VLS_588;
    /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
    elDropdownItem;
    // @ts-ignore
    const __VLS_589 = __VLS_asFunctionalComponent1(__VLS_588, new __VLS_588({
        command: "logout",
    }));
    const __VLS_590 = __VLS_589({
        command: "logout",
    }, ...__VLS_functionalComponentArgsRest(__VLS_589));
    const { default: __VLS_593 } = __VLS_591.slots;
    // @ts-ignore
    [];
    var __VLS_591;
    // @ts-ignore
    [];
    var __VLS_579;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_553;
var __VLS_554;
// @ts-ignore
[];
var __VLS_547;
let __VLS_594;
/** @ts-ignore @type {typeof __VLS_components.elMain | typeof __VLS_components.ElMain | typeof __VLS_components.elMain | typeof __VLS_components.ElMain} */
elMain;
// @ts-ignore
const __VLS_595 = __VLS_asFunctionalComponent1(__VLS_594, new __VLS_594({}));
const __VLS_596 = __VLS_595({}, ...__VLS_functionalComponentArgsRest(__VLS_595));
const { default: __VLS_599 } = __VLS_597.slots;
let __VLS_600;
/** @ts-ignore @type {typeof __VLS_components.routerView | typeof __VLS_components.RouterView} */
routerView;
// @ts-ignore
const __VLS_601 = __VLS_asFunctionalComponent1(__VLS_600, new __VLS_600({}));
const __VLS_602 = __VLS_601({}, ...__VLS_functionalComponentArgsRest(__VLS_601));
// @ts-ignore
[];
var __VLS_597;
// @ts-ignore
[];
var __VLS_541;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
