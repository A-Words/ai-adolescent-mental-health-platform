/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { sendEmailCode, registerByEmail } from '../api/user';
import { ElMessage } from 'element-plus';
import { User, Lock, Phone, Message, Key } from '@element-plus/icons-vue';
const router = useRouter();
const registerFormRef = ref();
const loading = ref(false);
const agreed = ref(false);
const showPrivacyPolicy = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);
// 品牌标题字符
const brandChars = ref(['心', '愈', '智', '联']);
// 返回首页
const backHome = () => {
    router.push('/home');
};
const registerForm = reactive({
    username: '',
    password: '',
    email: '',
    code: '',
    phone: ''
});
let countdownTimer = null;
// 发送验证码
const handleSendCode = async () => {
    // 先校验邮箱格式
    if (!registerForm.email) {
        ElMessage.warning('请先输入邮箱地址');
        return;
    }
    const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailReg.test(registerForm.email)) {
        ElMessage.warning('请输入正确的邮箱地址');
        return;
    }
    sendingCode.value = true;
    try {
        const res = await sendEmailCode({ email: registerForm.email, scene: 'register' });
        if (res.code === 200) {
            ElMessage.success('验证码已发送到您的邮箱');
            // 开始倒计时
            countdown.value = 60;
            if (countdownTimer)
                clearInterval(countdownTimer);
            countdownTimer = setInterval(() => {
                countdown.value--;
                if (countdown.value <= 0) {
                    if (countdownTimer)
                        clearInterval(countdownTimer);
                }
            }, 1000);
        }
        else {
            ElMessage.error(res.message || '验证码发送失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '验证码发送失败');
    }
    finally {
        sendingCode.value = false;
    }
};
const validateUsername = (_rule, value, callback) => {
    if (!value) {
        callback(new Error('请输入用户名'));
        return;
    }
    const reg = /^[a-zA-Z0-9_-]{4,16}$/;
    if (!reg.test(value)) {
        callback(new Error('用户名需为4-16位字母、数字、下划线或减号'));
    }
    else {
        callback();
    }
};
const validatePassword = (_rule, value, callback) => {
    if (!value) {
        callback(new Error('请输入密码'));
        return;
    }
    const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/;
    if (!reg.test(value)) {
        callback(new Error('密码需为8-16位，且包含大小写字母和数字'));
    }
    else {
        callback();
    }
};
const validateEmail = (_rule, value, callback) => {
    if (!value) {
        callback(new Error('请输入邮箱'));
        return;
    }
    const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!reg.test(value)) {
        callback(new Error('请输入正确的邮箱地址'));
    }
    else {
        callback();
    }
};
const validateCode = (_rule, value, callback) => {
    if (!value) {
        callback(new Error('请输入验证码'));
        return;
    }
    if (value.length !== 6) {
        callback(new Error('验证码为6位数字'));
    }
    else {
        callback();
    }
};
const validatePhone = (_rule, value, callback) => {
    if (!value) {
        callback();
        return;
    }
    const reg = /^1[3-9]\d{9}$/;
    if (!reg.test(value)) {
        callback(new Error('请输入正确的手机号'));
    }
    else {
        callback();
    }
};
const rules = reactive({
    username: [
        { validator: validateUsername, trigger: 'blur' }
    ],
    password: [
        { validator: validatePassword, trigger: 'blur' }
    ],
    email: [
        { validator: validateEmail, trigger: 'blur' }
    ],
    code: [
        { validator: validateCode, trigger: 'blur' }
    ],
    phone: [
        { validator: validatePhone, trigger: 'blur' }
    ]
});
const getPasswordStrength = () => {
    if (!registerForm.password)
        return 'empty';
    const hasLower = /[a-z]/.test(registerForm.password);
    const hasUpper = /[A-Z]/.test(registerForm.password);
    const hasNumber = /\d/.test(registerForm.password);
    const length = registerForm.password.length;
    let score = 0;
    if (hasLower)
        score++;
    if (hasUpper)
        score++;
    if (hasNumber)
        score++;
    if (length >= 8)
        score++;
    if (length >= 12)
        score++;
    if (score < 3)
        return 'weak';
    if (score < 5)
        return 'medium';
    return 'strong';
};
const getPasswordStrengthText = () => {
    const strength = getPasswordStrength();
    switch (strength) {
        case 'weak': return '密码强度：弱';
        case 'medium': return '密码强度：中等';
        case 'strong': return '密码强度：强';
        default: return '密码强度';
    }
};
const handleRegister = async () => {
    if (!agreed.value) {
        ElMessage.warning('请先同意隐私政策');
        return;
    }
    if (!registerFormRef.value)
        return;
    await registerFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true;
            try {
                const res = await registerByEmail({
                    email: registerForm.email,
                    code: registerForm.code,
                    username: registerForm.username,
                    password: registerForm.password,
                    phone: registerForm.phone || undefined
                });
                if (res.code === 200) {
                    ElMessage.success({
                        message: '注册成功，欢迎加入！',
                        customClass: 'success-message'
                    });
                    if (countdownTimer)
                        clearInterval(countdownTimer);
                    setTimeout(() => {
                        router.push('/login');
                    }, 1500);
                }
                else {
                    ElMessage.error({
                        message: res.message || '注册失败',
                        customClass: 'error-message'
                    });
                }
            }
            catch (error) {
                ElMessage.error({
                    message: error.message || '注册失败，请稍后重试',
                    customClass: 'error-message'
                });
            }
            finally {
                loading.value = false;
            }
        }
    });
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['register-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['register-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['register-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['register-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['register-form']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['input-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-strength']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-strength']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['register-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['login-link']} */ ;
/** @type {__VLS_StyleScopedClasses['login-link']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['agreement']} */ ;
/** @type {__VLS_StyleScopedClasses['agreement']} */ ;
/** @type {__VLS_StyleScopedClasses['agreement']} */ ;
/** @type {__VLS_StyleScopedClasses['el-checkbox__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['agreement-link']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__headerbtn']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__close']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-content']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-content']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__footer']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__footer']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['register-card']} */ ;
/** @type {__VLS_StyleScopedClasses['register-title']} */ ;
/** @type {__VLS_StyleScopedClasses['code-input-row']} */ ;
/** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "register-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['register-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (__VLS_ctx.backHome) },
    ...{ class: "brand-title" },
});
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
for (const [char, index] of __VLS_vFor((__VLS_ctx.brandChars))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        key: (index),
        ...{ style: ({ animationDelay: `${index * 150}ms` }) },
    });
    (char);
    // @ts-ignore
    [backHome, brandChars,];
}
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "register-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "register-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['register-card']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-header" },
});
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "register-title" },
});
/** @type {__VLS_StyleScopedClasses['register-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "register-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['register-subtitle']} */ ;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    model: (__VLS_ctx.registerForm),
    rules: (__VLS_ctx.rules),
    ref: "registerFormRef",
    labelWidth: "100px",
    ...{ class: "register-form" },
}));
const __VLS_8 = __VLS_7({
    model: (__VLS_ctx.registerForm),
    rules: (__VLS_ctx.rules),
    ref: "registerFormRef",
    labelWidth: "100px",
    ...{ class: "register-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
var __VLS_11 = {};
/** @type {__VLS_StyleScopedClasses['register-form']} */ ;
const { default: __VLS_13 } = __VLS_9.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    label: "用户名",
    prop: "username",
}));
const __VLS_16 = __VLS_15({
    label: "用户名",
    prop: "username",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
const { default: __VLS_19 } = __VLS_17.slots;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.registerForm.username),
    placeholder: "4-16位字母、数字、_、-",
    ...{ class: "custom-input" },
    prefixIcon: (__VLS_ctx.User),
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.registerForm.username),
    placeholder: "4-16位字母、数字、_、-",
    ...{ class: "custom-input" },
    prefixIcon: (__VLS_ctx.User),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
const { default: __VLS_25 } = __VLS_23.slots;
{
    const { suffix: __VLS_26 } = __VLS_23.slots;
    if (__VLS_ctx.registerForm.username.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "character-count" },
        });
        /** @type {__VLS_StyleScopedClasses['character-count']} */ ;
        (__VLS_ctx.registerForm.username.length);
    }
    // @ts-ignore
    [registerForm, registerForm, registerForm, registerForm, rules, User,];
}
// @ts-ignore
[];
var __VLS_23;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "input-hint" },
});
/** @type {__VLS_StyleScopedClasses['input-hint']} */ ;
// @ts-ignore
[];
var __VLS_17;
let __VLS_27;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
    label: "密码",
    prop: "password",
}));
const __VLS_29 = __VLS_28({
    label: "密码",
    prop: "password",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
const { default: __VLS_32 } = __VLS_30.slots;
let __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    type: "password",
    modelValue: (__VLS_ctx.registerForm.password),
    placeholder: "8-16位，含大小写字母+数字",
    ...{ class: "custom-input" },
    prefixIcon: (__VLS_ctx.Lock),
    showPassword: true,
}));
const __VLS_35 = __VLS_34({
    type: "password",
    modelValue: (__VLS_ctx.registerForm.password),
    placeholder: "8-16位，含大小写字母+数字",
    ...{ class: "custom-input" },
    prefixIcon: (__VLS_ctx.Lock),
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
const { default: __VLS_38 } = __VLS_36.slots;
{
    const { suffix: __VLS_39 } = __VLS_36.slots;
    if (__VLS_ctx.registerForm.password.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "character-count" },
        });
        /** @type {__VLS_StyleScopedClasses['character-count']} */ ;
        (__VLS_ctx.registerForm.password.length);
    }
    // @ts-ignore
    [registerForm, registerForm, registerForm, Lock,];
}
// @ts-ignore
[];
var __VLS_36;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "password-strength" },
    ...{ class: (__VLS_ctx.getPasswordStrength()) },
});
/** @type {__VLS_StyleScopedClasses['password-strength']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "strength-bar" },
});
/** @type {__VLS_StyleScopedClasses['strength-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "strength-text" },
});
/** @type {__VLS_StyleScopedClasses['strength-text']} */ ;
(__VLS_ctx.getPasswordStrengthText());
// @ts-ignore
[getPasswordStrength, getPasswordStrengthText,];
var __VLS_30;
let __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    label: "邮箱",
    prop: "email",
}));
const __VLS_42 = __VLS_41({
    label: "邮箱",
    prop: "email",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const { default: __VLS_45 } = __VLS_43.slots;
let __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
    modelValue: (__VLS_ctx.registerForm.email),
    placeholder: "请输入邮箱地址",
    ...{ class: "custom-input" },
    prefixIcon: (__VLS_ctx.Message),
}));
const __VLS_48 = __VLS_47({
    modelValue: (__VLS_ctx.registerForm.email),
    placeholder: "请输入邮箱地址",
    ...{ class: "custom-input" },
    prefixIcon: (__VLS_ctx.Message),
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
// @ts-ignore
[registerForm, Message,];
var __VLS_43;
let __VLS_51;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
    label: "邮箱验证",
    prop: "code",
}));
const __VLS_53 = __VLS_52({
    label: "邮箱验证",
    prop: "code",
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
const { default: __VLS_56 } = __VLS_54.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "code-input-row" },
});
/** @type {__VLS_StyleScopedClasses['code-input-row']} */ ;
let __VLS_57;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    modelValue: (__VLS_ctx.registerForm.code),
    placeholder: "请输入6位验证码",
    ...{ class: "custom-input code-input" },
    prefixIcon: (__VLS_ctx.Key),
    maxlength: "6",
}));
const __VLS_59 = __VLS_58({
    modelValue: (__VLS_ctx.registerForm.code),
    placeholder: "请输入6位验证码",
    ...{ class: "custom-input code-input" },
    prefixIcon: (__VLS_ctx.Key),
    maxlength: "6",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['code-input']} */ ;
let __VLS_62;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
    ...{ 'onClick': {} },
    ...{ class: "send-code-btn" },
    disabled: (__VLS_ctx.countdown > 0),
    loading: (__VLS_ctx.sendingCode),
}));
const __VLS_64 = __VLS_63({
    ...{ 'onClick': {} },
    ...{ class: "send-code-btn" },
    disabled: (__VLS_ctx.countdown > 0),
    loading: (__VLS_ctx.sendingCode),
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
let __VLS_67;
const __VLS_68 = ({ click: {} },
    { onClick: (__VLS_ctx.handleSendCode) });
/** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
const { default: __VLS_69 } = __VLS_65.slots;
(__VLS_ctx.countdown > 0 ? `${__VLS_ctx.countdown}秒后重发` : '发送验证码');
// @ts-ignore
[registerForm, Key, countdown, countdown, countdown, sendingCode, handleSendCode,];
var __VLS_65;
var __VLS_66;
// @ts-ignore
[];
var __VLS_54;
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    label: "手机号",
    prop: "phone",
}));
const __VLS_72 = __VLS_71({
    label: "手机号",
    prop: "phone",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const { default: __VLS_75 } = __VLS_73.slots;
let __VLS_76;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
    modelValue: (__VLS_ctx.registerForm.phone),
    placeholder: "选填，可用于找回密码",
    ...{ class: "custom-input" },
    prefixIcon: (__VLS_ctx.Phone),
}));
const __VLS_78 = __VLS_77({
    modelValue: (__VLS_ctx.registerForm.phone),
    placeholder: "选填，可用于找回密码",
    ...{ class: "custom-input" },
    prefixIcon: (__VLS_ctx.Phone),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
const { default: __VLS_81 } = __VLS_79.slots;
{
    const { prefix: __VLS_82 } = __VLS_79.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "phone-prefix" },
    });
    /** @type {__VLS_StyleScopedClasses['phone-prefix']} */ ;
    // @ts-ignore
    [registerForm, Phone,];
}
// @ts-ignore
[];
var __VLS_79;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "input-hint optional" },
});
/** @type {__VLS_StyleScopedClasses['input-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['optional']} */ ;
// @ts-ignore
[];
var __VLS_73;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-actions" },
});
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
let __VLS_83;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "register-btn" },
    loading: (__VLS_ctx.loading),
}));
const __VLS_85 = __VLS_84({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "register-btn" },
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
let __VLS_88;
const __VLS_89 = ({ click: {} },
    { onClick: (__VLS_ctx.handleRegister) });
/** @type {__VLS_StyleScopedClasses['register-btn']} */ ;
const { default: __VLS_90 } = __VLS_86.slots;
if (!__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
// @ts-ignore
[loading, loading, handleRegister,];
var __VLS_86;
var __VLS_87;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "login-link" },
});
/** @type {__VLS_StyleScopedClasses['login-link']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
let __VLS_91;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
    ...{ 'onClick': {} },
    type: "primary",
    underline: "never",
    ...{ class: "login-btn" },
}));
const __VLS_93 = __VLS_92({
    ...{ 'onClick': {} },
    type: "primary",
    underline: "never",
    ...{ class: "login-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
let __VLS_96;
const __VLS_97 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/login');
            // @ts-ignore
            [$router,];
        } });
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
const { default: __VLS_98 } = __VLS_94.slots;
// @ts-ignore
[];
var __VLS_94;
var __VLS_95;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "agreement" },
});
/** @type {__VLS_StyleScopedClasses['agreement']} */ ;
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox} */
elCheckbox;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    modelValue: (__VLS_ctx.agreed),
}));
const __VLS_101 = __VLS_100({
    modelValue: (__VLS_ctx.agreed),
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
const { default: __VLS_104 } = __VLS_102.slots;
let __VLS_105;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    ...{ 'onClick': {} },
    type: "text",
    ...{ class: "agreement-link" },
}));
const __VLS_107 = __VLS_106({
    ...{ 'onClick': {} },
    type: "text",
    ...{ class: "agreement-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
let __VLS_110;
const __VLS_111 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.showPrivacyPolicy = true;
            // @ts-ignore
            [agreed, showPrivacyPolicy,];
        } });
/** @type {__VLS_StyleScopedClasses['agreement-link']} */ ;
const { default: __VLS_112 } = __VLS_108.slots;
// @ts-ignore
[];
var __VLS_108;
var __VLS_109;
// @ts-ignore
[];
var __VLS_102;
// @ts-ignore
[];
var __VLS_9;
// @ts-ignore
[];
var __VLS_3;
let __VLS_113;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
    modelValue: (__VLS_ctx.showPrivacyPolicy),
    title: "隐私政策",
    width: "80%",
    ...{ class: "privacy-dialog" },
}));
const __VLS_115 = __VLS_114({
    modelValue: (__VLS_ctx.showPrivacyPolicy),
    title: "隐私政策",
    width: "80%",
    ...{ class: "privacy-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
const { default: __VLS_118 } = __VLS_116.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "privacy-content" },
});
/** @type {__VLS_StyleScopedClasses['privacy-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
{
    const { footer: __VLS_119 } = __VLS_116.slots;
    let __VLS_120;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_122 = __VLS_121({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    let __VLS_125;
    const __VLS_126 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.showPrivacyPolicy = false;
                // @ts-ignore
                [showPrivacyPolicy, showPrivacyPolicy,];
            } });
    const { default: __VLS_127 } = __VLS_123.slots;
    // @ts-ignore
    [];
    var __VLS_123;
    var __VLS_124;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_116;
// @ts-ignore
var __VLS_12 = __VLS_11;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
