/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onUnmounted } from 'vue';
import { sendForgotCode, verifyForgotCode, resetPassword } from '../api/user';
import { ElMessage } from 'element-plus';
import { User as UserIcon, Lock as LockIcon, Message as EmailIcon, Key as KeyIcon } from '@element-plus/icons-vue';
const formRef = ref();
const pwdFormRef = ref();
const step = ref(1);
const loading = ref(false);
const sending = ref(false);
const countdown = ref(0);
let countdownTimer = null;
const brandChars = ['心', '愈', '智', '联'];
const form = reactive({
    username: '',
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
});
const rules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { min: 6, max: 6, message: '验证码为6位数字', trigger: 'blur' }
    ]
});
const pwdRules = reactive({
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        {
            validator: (_rule, value, callback) => {
                if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/.test(value)) {
                    callback(new Error('密码需为8-16位，且包含大小写字母和数字'));
                }
                else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        {
            validator: (_rule, value, callback) => {
                if (value !== form.newPassword) {
                    callback(new Error('两次输入的密码不一致'));
                }
                else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
});
const handleSendCode = async () => {
    if (!formRef.value)
        return;
    // 先只校验用户名和邮箱格式，不校验验证码
    await formRef.value.validateField(['username', 'email'], async (errors) => {
        if (errors && Object.keys(errors).length > 0)
            return;
        sending.value = true;
        try {
            const res = await sendForgotCode({ username: form.username, email: form.email });
            if (res.code === 200) {
                ElMessage.success('验证码已发送到您的邮箱');
                countdown.value = 60;
                if (countdownTimer)
                    clearInterval(countdownTimer);
                countdownTimer = setInterval(() => {
                    countdown.value--;
                    if (countdown.value <= 0 && countdownTimer)
                        clearInterval(countdownTimer);
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
            sending.value = false;
        }
    });
};
const handleNext = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (!valid)
            return;
        loading.value = true;
        try {
            const res = await verifyForgotCode({
                username: form.username,
                email: form.email,
                code: form.code
            });
            if (res.code === 200) {
                step.value = 2;
            }
            else {
                ElMessage.error(res.message || '验证失败');
            }
        }
        catch (error) {
            ElMessage.error(error.message || '验证失败');
        }
        finally {
            loading.value = false;
        }
    });
};
const handleReset = async () => {
    if (!pwdFormRef.value)
        return;
    await pwdFormRef.value.validate(async (valid) => {
        if (!valid)
            return;
        loading.value = true;
        try {
            const res = await resetPassword({
                username: form.username,
                email: form.email,
                code: form.code,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword
            });
            if (res.code === 200) {
                step.value = 3;
            }
            else {
                ElMessage.error(res.message || '密码重置失败');
            }
        }
        catch (error) {
            ElMessage.error(error.message || '密码重置失败');
        }
        finally {
            loading.value = false;
        }
    });
};
const getPwdStrength = () => {
    const pwd = form.newPassword;
    if (!pwd)
        return 'empty';
    let score = 0;
    if (/[a-z]/.test(pwd))
        score++;
    if (/[A-Z]/.test(pwd))
        score++;
    if (/\d/.test(pwd))
        score++;
    if (pwd.length >= 8)
        score++;
    if (pwd.length >= 12)
        score++;
    if (score < 3)
        return 'weak';
    if (score < 5)
        return 'medium';
    return 'strong';
};
const getPwdStrengthText = () => {
    const s = getPwdStrength();
    if (s === 'weak')
        return '密码强度：弱';
    if (s === 'medium')
        return '密码强度：中等';
    if (s === 'strong')
        return '密码强度：强';
    return '密码强度';
};
onUnmounted(() => {
    if (countdownTimer)
        clearInterval(countdownTimer);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['forgot-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
/** @type {__VLS_StyleScopedClasses['step-line']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-form']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['email-row']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pwd-strength']} */ ;
/** @type {__VLS_StyleScopedClasses['pwd-strength-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['pwd-strength']} */ ;
/** @type {__VLS_StyleScopedClasses['pwd-strength-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['pwd-strength']} */ ;
/** @type {__VLS_StyleScopedClasses['pwd-strength-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['next-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['goto-login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['goto-login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['back-login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-card']} */ ;
/** @type {__VLS_StyleScopedClasses['step-line']} */ ;
/** @type {__VLS_StyleScopedClasses['email-row']} */ ;
/** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "forgot-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['forgot-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/home');
            // @ts-ignore
            [$router,];
        } },
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
    [brandChars,];
}
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "forgot-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "forgot-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['forgot-card']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "step-indicator" },
});
/** @type {__VLS_StyleScopedClasses['step-indicator']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "step-item" },
    ...{ class: ({ active: __VLS_ctx.step >= 1, done: __VLS_ctx.step > 1 }) },
});
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "step-circle" },
});
/** @type {__VLS_StyleScopedClasses['step-circle']} */ ;
(__VLS_ctx.step > 1 ? '✓' : '1');
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "step-line" },
    ...{ class: ({ active: __VLS_ctx.step > 1 }) },
});
/** @type {__VLS_StyleScopedClasses['step-line']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "step-item" },
    ...{ class: ({ active: __VLS_ctx.step >= 2, done: __VLS_ctx.step > 2 }) },
});
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "step-circle" },
});
/** @type {__VLS_StyleScopedClasses['step-circle']} */ ;
(__VLS_ctx.step > 2 ? '✓' : '2');
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "step-line" },
    ...{ class: ({ active: __VLS_ctx.step > 2 }) },
});
/** @type {__VLS_StyleScopedClasses['step-line']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "step-item" },
    ...{ class: ({ active: __VLS_ctx.step >= 3 }) },
});
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "step-circle" },
});
/** @type {__VLS_StyleScopedClasses['step-circle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
if (__VLS_ctx.step === 1) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "page-title" },
    });
    /** @type {__VLS_StyleScopedClasses['page-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "page-subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
    elForm;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        model: (__VLS_ctx.form),
        rules: (__VLS_ctx.rules),
        ref: "formRef",
        labelPosition: "top",
        ...{ class: "forgot-form" },
    }));
    const __VLS_8 = __VLS_7({
        model: (__VLS_ctx.form),
        rules: (__VLS_ctx.rules),
        ref: "formRef",
        labelPosition: "top",
        ...{ class: "forgot-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    var __VLS_11 = {};
    /** @type {__VLS_StyleScopedClasses['forgot-form']} */ ;
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
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        modelValue: (__VLS_ctx.form.username),
        placeholder: "请输入您的用户名",
        ...{ class: "custom-input" },
        prefixIcon: (__VLS_ctx.UserIcon),
    }));
    const __VLS_22 = __VLS_21({
        modelValue: (__VLS_ctx.form.username),
        placeholder: "请输入您的用户名",
        ...{ class: "custom-input" },
        prefixIcon: (__VLS_ctx.UserIcon),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    /** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
    // @ts-ignore
    [step, step, step, step, step, step, step, step, step, step, form, form, rules, UserIcon,];
    var __VLS_17;
    let __VLS_25;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        label: "邮箱",
        prop: "email",
    }));
    const __VLS_27 = __VLS_26({
        label: "邮箱",
        prop: "email",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    const { default: __VLS_30 } = __VLS_28.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-row" },
    });
    /** @type {__VLS_StyleScopedClasses['email-row']} */ ;
    let __VLS_31;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        modelValue: (__VLS_ctx.form.email),
        placeholder: "请输入绑定的邮箱",
        ...{ class: "custom-input" },
        prefixIcon: (__VLS_ctx.EmailIcon),
    }));
    const __VLS_33 = __VLS_32({
        modelValue: (__VLS_ctx.form.email),
        placeholder: "请输入绑定的邮箱",
        ...{ class: "custom-input" },
        prefixIcon: (__VLS_ctx.EmailIcon),
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    /** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
    let __VLS_36;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        ...{ 'onClick': {} },
        ...{ class: "send-code-btn" },
        disabled: (__VLS_ctx.countdown > 0),
        loading: (__VLS_ctx.sending),
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onClick': {} },
        ...{ class: "send-code-btn" },
        disabled: (__VLS_ctx.countdown > 0),
        loading: (__VLS_ctx.sending),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_41;
    const __VLS_42 = ({ click: {} },
        { onClick: (__VLS_ctx.handleSendCode) });
    /** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
    const { default: __VLS_43 } = __VLS_39.slots;
    (__VLS_ctx.countdown > 0 ? `${__VLS_ctx.countdown}s` : '获取验证码');
    // @ts-ignore
    [form, EmailIcon, countdown, countdown, countdown, sending, handleSendCode,];
    var __VLS_39;
    var __VLS_40;
    // @ts-ignore
    [];
    var __VLS_28;
    let __VLS_44;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
        label: "验证码",
        prop: "code",
    }));
    const __VLS_46 = __VLS_45({
        label: "验证码",
        prop: "code",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    const { default: __VLS_49 } = __VLS_47.slots;
    let __VLS_50;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
        modelValue: (__VLS_ctx.form.code),
        placeholder: "请输入6位验证码",
        ...{ class: "custom-input" },
        prefixIcon: (__VLS_ctx.KeyIcon),
        maxlength: "6",
    }));
    const __VLS_52 = __VLS_51({
        modelValue: (__VLS_ctx.form.code),
        placeholder: "请输入6位验证码",
        ...{ class: "custom-input" },
        prefixIcon: (__VLS_ctx.KeyIcon),
        maxlength: "6",
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    /** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
    // @ts-ignore
    [form, KeyIcon,];
    var __VLS_47;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-hint" },
    });
    /** @type {__VLS_StyleScopedClasses['form-hint']} */ ;
    let __VLS_55;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "next-btn" },
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_57 = __VLS_56({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "next-btn" },
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    let __VLS_60;
    const __VLS_61 = ({ click: {} },
        { onClick: (__VLS_ctx.handleNext) });
    /** @type {__VLS_StyleScopedClasses['next-btn']} */ ;
    const { default: __VLS_62 } = __VLS_58.slots;
    // @ts-ignore
    [loading, handleNext,];
    var __VLS_58;
    var __VLS_59;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "back-login" },
    });
    /** @type {__VLS_StyleScopedClasses['back-login']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_63;
    /** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
    elLink;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
        ...{ 'onClick': {} },
        type: "primary",
        underline: "never",
        ...{ class: "back-login-btn" },
    }));
    const __VLS_65 = __VLS_64({
        ...{ 'onClick': {} },
        type: "primary",
        underline: "never",
        ...{ class: "back-login-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    let __VLS_68;
    const __VLS_69 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.step === 1))
                    return;
                __VLS_ctx.$router.push('/login');
                // @ts-ignore
                [$router,];
            } });
    /** @type {__VLS_StyleScopedClasses['back-login-btn']} */ ;
    const { default: __VLS_70 } = __VLS_66.slots;
    // @ts-ignore
    [];
    var __VLS_66;
    var __VLS_67;
    // @ts-ignore
    [];
    var __VLS_9;
}
if (__VLS_ctx.step === 2) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "page-title" },
    });
    /** @type {__VLS_StyleScopedClasses['page-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "page-subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
    (__VLS_ctx.form.username);
    let __VLS_71;
    /** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
    elForm;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
        model: (__VLS_ctx.form),
        rules: (__VLS_ctx.pwdRules),
        ref: "pwdFormRef",
        labelPosition: "top",
        ...{ class: "forgot-form" },
    }));
    const __VLS_73 = __VLS_72({
        model: (__VLS_ctx.form),
        rules: (__VLS_ctx.pwdRules),
        ref: "pwdFormRef",
        labelPosition: "top",
        ...{ class: "forgot-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    var __VLS_76 = {};
    /** @type {__VLS_StyleScopedClasses['forgot-form']} */ ;
    const { default: __VLS_78 } = __VLS_74.slots;
    let __VLS_79;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
        label: "新密码",
        prop: "newPassword",
    }));
    const __VLS_81 = __VLS_80({
        label: "新密码",
        prop: "newPassword",
    }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    const { default: __VLS_84 } = __VLS_82.slots;
    let __VLS_85;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
        modelValue: (__VLS_ctx.form.newPassword),
        type: "password",
        placeholder: "8-16位，含大小写字母+数字",
        ...{ class: "custom-input" },
        prefixIcon: (__VLS_ctx.LockIcon),
        showPassword: true,
    }));
    const __VLS_87 = __VLS_86({
        modelValue: (__VLS_ctx.form.newPassword),
        type: "password",
        placeholder: "8-16位，含大小写字母+数字",
        ...{ class: "custom-input" },
        prefixIcon: (__VLS_ctx.LockIcon),
        showPassword: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    /** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pwd-strength" },
        ...{ class: (__VLS_ctx.getPwdStrength()) },
    });
    /** @type {__VLS_StyleScopedClasses['pwd-strength']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pwd-strength-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['pwd-strength-bar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "pwd-strength-text" },
    });
    /** @type {__VLS_StyleScopedClasses['pwd-strength-text']} */ ;
    (__VLS_ctx.getPwdStrengthText());
    // @ts-ignore
    [step, form, form, form, pwdRules, LockIcon, getPwdStrength, getPwdStrengthText,];
    var __VLS_82;
    let __VLS_90;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        label: "确认新密码",
        prop: "confirmPassword",
    }));
    const __VLS_92 = __VLS_91({
        label: "确认新密码",
        prop: "confirmPassword",
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    const { default: __VLS_95 } = __VLS_93.slots;
    let __VLS_96;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
        modelValue: (__VLS_ctx.form.confirmPassword),
        type: "password",
        placeholder: "请再次输入新密码",
        ...{ class: "custom-input" },
        prefixIcon: (__VLS_ctx.LockIcon),
        showPassword: true,
    }));
    const __VLS_98 = __VLS_97({
        modelValue: (__VLS_ctx.form.confirmPassword),
        type: "password",
        placeholder: "请再次输入新密码",
        ...{ class: "custom-input" },
        prefixIcon: (__VLS_ctx.LockIcon),
        showPassword: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    /** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
    // @ts-ignore
    [form, LockIcon,];
    var __VLS_93;
    let __VLS_101;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "next-btn" },
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_103 = __VLS_102({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "next-btn" },
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    let __VLS_106;
    const __VLS_107 = ({ click: {} },
        { onClick: (__VLS_ctx.handleReset) });
    /** @type {__VLS_StyleScopedClasses['next-btn']} */ ;
    const { default: __VLS_108 } = __VLS_104.slots;
    // @ts-ignore
    [loading, handleReset,];
    var __VLS_104;
    var __VLS_105;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "back-login" },
    });
    /** @type {__VLS_StyleScopedClasses['back-login']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_109;
    /** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
    elLink;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
        ...{ 'onClick': {} },
        type: "primary",
        underline: "never",
        ...{ class: "back-login-btn" },
    }));
    const __VLS_111 = __VLS_110({
        ...{ 'onClick': {} },
        type: "primary",
        underline: "never",
        ...{ class: "back-login-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    let __VLS_114;
    const __VLS_115 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.step === 2))
                    return;
                __VLS_ctx.$router.push('/login');
                // @ts-ignore
                [$router,];
            } });
    /** @type {__VLS_StyleScopedClasses['back-login-btn']} */ ;
    const { default: __VLS_116 } = __VLS_112.slots;
    // @ts-ignore
    [];
    var __VLS_112;
    var __VLS_113;
    // @ts-ignore
    [];
    var __VLS_74;
}
if (__VLS_ctx.step === 3) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "success-step" },
    });
    /** @type {__VLS_StyleScopedClasses['success-step']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "success-icon-wrap" },
    });
    /** @type {__VLS_StyleScopedClasses['success-icon-wrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "success-ring" },
    });
    /** @type {__VLS_StyleScopedClasses['success-ring']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "success-check" },
    });
    /** @type {__VLS_StyleScopedClasses['success-check']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "success-title" },
    });
    /** @type {__VLS_StyleScopedClasses['success-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "success-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['success-desc']} */ ;
    let __VLS_117;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "goto-login-btn" },
    }));
    const __VLS_119 = __VLS_118({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "goto-login-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_118));
    let __VLS_122;
    const __VLS_123 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.step === 3))
                    return;
                __VLS_ctx.$router.push('/login');
                // @ts-ignore
                [$router, step,];
            } });
    /** @type {__VLS_StyleScopedClasses['goto-login-btn']} */ ;
    const { default: __VLS_124 } = __VLS_120.slots;
    // @ts-ignore
    [];
    var __VLS_120;
    var __VLS_121;
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_12 = __VLS_11, __VLS_77 = __VLS_76;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
