/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { login, loginByEmailCode, loginByEmailPassword, sendEmailCode } from '../api/user';
import { ElMessage } from 'element-plus';
import { View, Hide, User, Lock, Message, Key } from '@element-plus/icons-vue';
import LoginCharacters from '../components/LoginCharacters.vue';
const router = useRouter();
const accountFormRef = ref();
const emailFormRef = ref();
const loading = ref(false);
const meteorCanvas = ref();
// 登录方式 tab
const loginTab = ref('account');
const emailLoginMode = ref('code');
// Animation states
const isPeeking = ref(false);
const isBackTurned = ref(false);
const isError = ref(false);
const passwordType = ref('password');
const emailPasswordType = ref('password');
const rememberMe = ref(false);
const brandChars = ref(['心', '愈', '智', '联']);
// 隐私政策相关状态
const privacyDialogVisible = ref(false);
const agreedToPrivacy = ref(false);
const privacyDialogReadOnly = ref(false);
// 邮箱登录相关
const sendingCode = ref(false);
const codeCountdown = ref(0);
let codeCountdownTimer = null;
// 流星雨相关
let context = null;
let animationFrameId = null;
const rainCount = 25;
let rains = [];
// ========== 流星雨类 ==========
class MeteorRain {
    x = -1;
    y = -1;
    length = -1;
    angle = 30;
    width = -1;
    height = -1;
    speed = 1;
    offset_x = -1;
    offset_y = -1;
    alpha = 1;
    color1 = "";
    color2 = "";
    init() {
        this.getPos();
        this.alpha = 1;
        this.getRandomColor();
        const x = Math.random() * 80 + 150;
        this.length = Math.ceil(x);
        const speed = Math.random() + 0.5;
        this.speed = speed;
        const cos = Math.cos((this.angle * 3.14) / 180);
        const sin = Math.sin((this.angle * 3.14) / 180);
        this.width = this.length * cos;
        this.height = this.length * sin;
        this.offset_x = this.speed * cos;
        this.offset_y = this.speed * sin;
    }
    getRandomColor() {
        this.color1 = "rgba(255, 255, 255, 0.9)";
        this.color2 = "rgba(255, 255, 255, 0)";
    }
    countPos() {
        this.x = this.x - this.offset_x;
        this.y = this.y + this.offset_y;
    }
    getPos() {
        this.x = Math.random() * (meteorCanvas.value?.width || window.innerWidth);
        this.y = -Math.random() * 100;
    }
    draw() {
        if (!context)
            return;
        context.save();
        context.beginPath();
        context.lineWidth = 1.5;
        context.globalAlpha = this.alpha;
        const line = context.createLinearGradient(this.x, this.y, this.x + this.width, this.y - this.height);
        line.addColorStop(0, "rgba(255, 255, 255, 1)");
        line.addColorStop(0.2, this.color1);
        line.addColorStop(0.5, "rgba(255, 255, 255, 0.6)");
        line.addColorStop(0.8, "rgba(255, 255, 255, 0.3)");
        line.addColorStop(1, this.color2);
        context.strokeStyle = line;
        context.moveTo(this.x, this.y);
        context.lineTo(this.x + this.width, this.y - this.height);
        context.closePath();
        context.stroke();
        context.restore();
    }
    move() {
        if (!context)
            return;
        const x = this.x + this.width - this.offset_x;
        const y = this.y - this.height;
        context.clearRect(x - 5, y - 5, this.offset_x + 10, this.offset_y + 10);
        this.countPos();
        this.alpha -= 0.002;
        this.draw();
    }
}
const initCanvas = () => {
    if (!meteorCanvas.value)
        return;
    const canvas = meteorCanvas.value;
    const parent = canvas.parentElement;
    if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    }
    context = canvas.getContext('2d');
    rains = [];
    for (let i = 0; i < rainCount; i++) {
        const rain = new MeteorRain();
        rain.init();
        rains.push(rain);
    }
};
const playRains = () => {
    if (!context || !meteorCanvas.value)
        return;
    for (let n = 0; n < rainCount; n++) {
        const rain = rains[n];
        if (!rain)
            continue;
        rain.move();
        if (rain.y > meteorCanvas.value.height) {
            context.clearRect(rain.x, rain.y - rain.height, rain.width, rain.height);
            const newRain = new MeteorRain();
            newRain.init();
            rains[n] = newRain;
        }
    }
    animationFrameId = requestAnimationFrame(playRains);
};
const startMeteorShower = () => {
    if (!meteorCanvas.value)
        return;
    initCanvas();
    if (rains.length === 0) {
        for (let i = 0; i < rainCount; i++) {
            const rain = new MeteorRain();
            rain.init();
            rains.push(rain);
        }
    }
    if (animationFrameId)
        cancelAnimationFrame(animationFrameId);
    playRains();
};
const handleResize = () => {
    if (meteorCanvas.value) {
        const parent = meteorCanvas.value.parentElement;
        if (parent) {
            meteorCanvas.value.width = parent.clientWidth;
            meteorCanvas.value.height = parent.clientHeight;
        }
    }
};
onMounted(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nextTick(() => {
        if (meteorCanvas.value) {
            startMeteorShower();
            window.addEventListener('resize', handleResize);
        }
    });
    window.addEventListener('keydown', handleKeydown);
});
const backHome = () => {
    router.push('/home');
};
const getRedirectPath = (role) => {
    const pathMap = {
        2: '/doctor/dashboard',
        3: '/hospital/dashboard',
        4: '/admin/dashboard'
    };
    return pathMap[role] || '/home';
};
onUnmounted(() => {
    if (animationFrameId)
        cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('keydown', handleKeydown);
    if (codeCountdownTimer)
        clearInterval(codeCountdownTimer);
});
// ========== 表单数据 ==========
const accountForm = reactive({
    username: '',
    password: ''
});
const emailForm = reactive({
    email: '',
    code: '',
    password: ''
});
const accountRules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
});
const emailRules = reactive({
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { min: 6, max: 6, message: '验证码为6位数字', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ]
});
// ========== 方法 ==========
const switchTab = (tab) => {
    loginTab.value = tab;
};
const handlePasswordFocus = () => {
    isPeeking.value = true;
};
const handlePasswordBlur = () => {
    isPeeking.value = false;
};
const togglePasswordVisibility = () => {
    if (passwordType.value === 'password') {
        passwordType.value = 'text';
        isBackTurned.value = true;
    }
    else {
        passwordType.value = 'password';
        isBackTurned.value = false;
    }
};
const toggleEmailPasswordVisibility = () => {
    if (emailPasswordType.value === 'password') {
        emailPasswordType.value = 'text';
    }
    else {
        emailPasswordType.value = 'password';
    }
};
// 发送邮箱验证码
const handleSendCode = async () => {
    if (!emailForm.email) {
        ElMessage.warning('请先输入邮箱地址');
        return;
    }
    const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailReg.test(emailForm.email)) {
        ElMessage.warning('请输入正确的邮箱地址');
        return;
    }
    sendingCode.value = true;
    try {
        const res = await sendEmailCode({ email: emailForm.email, scene: 'login' });
        if (res.code === 200) {
            ElMessage.success('验证码已发送到您的邮箱');
            codeCountdown.value = 60;
            if (codeCountdownTimer)
                clearInterval(codeCountdownTimer);
            codeCountdownTimer = setInterval(() => {
                codeCountdown.value--;
                if (codeCountdown.value <= 0) {
                    if (codeCountdownTimer)
                        clearInterval(codeCountdownTimer);
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
// 回车登录处理
const handleKeydown = (e) => {
    if (e.key === 'Enter') {
        if (privacyDialogVisible.value) {
            if (privacyDialogReadOnly.value) {
                agreedToPrivacy.value = true;
                privacyDialogVisible.value = false;
                privacyDialogReadOnly.value = false;
            }
            return;
        }
        if (!agreedToPrivacy.value) {
            privacyDialogReadOnly.value = true;
            privacyDialogVisible.value = true;
            return;
        }
        handleLogin();
    }
};
const showPrivacyDialog = () => {
    privacyDialogReadOnly.value = false;
    privacyDialogVisible.value = true;
};
const handlePrivacyDialogClose = (done) => {
    if (privacyDialogReadOnly.value) {
        agreedToPrivacy.value = true;
        privacyDialogReadOnly.value = false;
    }
    done();
};
// ==================== 登录 ====================
const handleLogin = async () => {
    if (!agreedToPrivacy.value) {
        ElMessage.warning('请勾选同意隐私政策');
        return;
    }
    if (loginTab.value === 'account') {
        await handleAccountLogin();
    }
    else {
        await handleEmailLogin();
    }
};
const handleAccountLogin = async () => {
    if (!accountFormRef.value)
        return;
    await accountFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true;
            try {
                const res = await login(accountForm, rememberMe.value);
                if (res.code === 200) {
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('user', JSON.stringify(res.data.userInfo));
                    // 设置首次登录标记
                    if (!localStorage.getItem('hasSeenPlatformIntro')) {
                        localStorage.setItem('isFirstLogin', 'true');
                    }
                    ElMessage.success('登录成功');
                    router.push(getRedirectPath(res.data.userInfo.role));
                }
                else {
                    ElMessage.error(res.message);
                    triggerErrorAnimation();
                }
            }
            catch (error) {
                ElMessage.error(error.message || '登录失败');
                triggerErrorAnimation();
            }
            finally {
                loading.value = false;
            }
        }
        else {
            triggerErrorAnimation();
        }
    });
};
const handleEmailLogin = async () => {
    if (!emailFormRef.value)
        return;
    await emailFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true;
            try {
                let res;
                if (emailLoginMode.value === 'code') {
                    // 验证码登录
                    res = await loginByEmailCode({
                        email: emailForm.email,
                        code: emailForm.code
                    });
                }
                else {
                    // 密码登录
                    res = await loginByEmailPassword({
                        email: emailForm.email,
                        password: emailForm.password,
                        remember: rememberMe.value
                    });
                }
                if (res.code === 200) {
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('user', JSON.stringify(res.data.userInfo));
                    // 设置首次登录标记
                    if (!localStorage.getItem('hasSeenPlatformIntro')) {
                        localStorage.setItem('isFirstLogin', 'true');
                    }
                    ElMessage.success('登录成功');
                    if (codeCountdownTimer)
                        clearInterval(codeCountdownTimer);
                    router.push(getRedirectPath(res.data.userInfo.role));
                }
                else {
                    ElMessage.error(res.message);
                    triggerErrorAnimation();
                }
            }
            catch (error) {
                ElMessage.error(error.message || '登录失败');
                triggerErrorAnimation();
            }
            finally {
                loading.value = false;
            }
        }
        else {
            triggerErrorAnimation();
        }
    });
};
const triggerErrorAnimation = () => {
    isError.value = true;
    setTimeout(() => {
        isError.value = false;
    }, 1500);
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['login-card']} */ ;
/** @type {__VLS_StyleScopedClasses['login-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['login-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['remember-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['remember-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['el-checkbox__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-link']} */ ;
/** @type {__VLS_StyleScopedClasses['el-checkbox__label']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['el-checkbox__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['el-checkbox__input']} */ ;
/** @type {__VLS_StyleScopedClasses['is-checked']} */ ;
/** @type {__VLS_StyleScopedClasses['el-checkbox__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-link']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['register-link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__headerbtn']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__headerbtn']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__close']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['close-privacy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-privacy-btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-section']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-section']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-section']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-section']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-section']} */ ;
/** @type {__VLS_StyleScopedClasses['subsection']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__body']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__body']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__body']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "login-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['login-wrapper']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.privacyDialogVisible),
    title: "用户隐私安全须知",
    width: "80%",
    beforeClose: (__VLS_ctx.handlePrivacyDialogClose),
    ...{ class: "login-privacy-dialog" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.privacyDialogVisible),
    title: "用户隐私安全须知",
    width: "80%",
    beforeClose: (__VLS_ctx.handlePrivacyDialogClose),
    ...{ class: "login-privacy-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['login-privacy-dialog']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "privacy-content" },
});
/** @type {__VLS_StyleScopedClasses['privacy-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "privacy-section" },
});
/** @type {__VLS_StyleScopedClasses['privacy-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "privacy-section" },
});
/** @type {__VLS_StyleScopedClasses['privacy-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "privacy-section" },
});
/** @type {__VLS_StyleScopedClasses['privacy-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "subsection" },
});
/** @type {__VLS_StyleScopedClasses['subsection']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "subsection" },
});
/** @type {__VLS_StyleScopedClasses['subsection']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "subsection" },
});
/** @type {__VLS_StyleScopedClasses['subsection']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "privacy-section" },
});
/** @type {__VLS_StyleScopedClasses['privacy-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "subsection" },
});
/** @type {__VLS_StyleScopedClasses['subsection']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "subsection" },
});
/** @type {__VLS_StyleScopedClasses['subsection']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "subsection" },
});
/** @type {__VLS_StyleScopedClasses['subsection']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "privacy-section" },
});
/** @type {__VLS_StyleScopedClasses['privacy-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "subsection" },
});
/** @type {__VLS_StyleScopedClasses['subsection']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "subsection" },
});
/** @type {__VLS_StyleScopedClasses['subsection']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "privacy-section" },
});
/** @type {__VLS_StyleScopedClasses['privacy-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "subsection" },
});
/** @type {__VLS_StyleScopedClasses['subsection']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "subsection" },
});
/** @type {__VLS_StyleScopedClasses['subsection']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
{
    const { footer: __VLS_6 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    if (__VLS_ctx.privacyDialogReadOnly) {
        let __VLS_7;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ class: "close-privacy-btn" },
        }));
        const __VLS_9 = __VLS_8({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ class: "close-privacy-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        let __VLS_12;
        const __VLS_13 = ({ click: {} },
            { onClick: (() => { __VLS_ctx.agreedToPrivacy = true; __VLS_ctx.privacyDialogVisible = false; __VLS_ctx.privacyDialogReadOnly = false; }) });
        /** @type {__VLS_StyleScopedClasses['close-privacy-btn']} */ ;
        const { default: __VLS_14 } = __VLS_10.slots;
        // @ts-ignore
        [privacyDialogVisible, privacyDialogVisible, handlePrivacyDialogClose, privacyDialogReadOnly, privacyDialogReadOnly, agreedToPrivacy,];
        var __VLS_10;
        var __VLS_11;
    }
    else {
        let __VLS_15;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            ...{ 'onClick': {} },
            ...{ class: "close-privacy-btn-secondary" },
        }));
        const __VLS_17 = __VLS_16({
            ...{ 'onClick': {} },
            ...{ class: "close-privacy-btn-secondary" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        let __VLS_20;
        const __VLS_21 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.privacyDialogReadOnly))
                        return;
                    __VLS_ctx.privacyDialogVisible = false;
                    // @ts-ignore
                    [privacyDialogVisible,];
                } });
        /** @type {__VLS_StyleScopedClasses['close-privacy-btn-secondary']} */ ;
        const { default: __VLS_22 } = __VLS_18.slots;
        // @ts-ignore
        [];
        var __VLS_18;
        var __VLS_19;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "canvas-side" },
});
/** @type {__VLS_StyleScopedClasses['canvas-side']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.canvas, __VLS_intrinsics.canvas)({
    ref: "meteorCanvas",
    ...{ class: "meteor-canvas" },
});
/** @type {__VLS_StyleScopedClasses['meteor-canvas']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bg-text-container" },
});
/** @type {__VLS_StyleScopedClasses['bg-text-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bg-text text-line-1" },
});
/** @type {__VLS_StyleScopedClasses['bg-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-line-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bg-text text-line-2" },
});
/** @type {__VLS_StyleScopedClasses['bg-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-line-2']} */ ;
const __VLS_23 = LoginCharacters;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    isPeeking: (__VLS_ctx.isPeeking),
    isBackTurned: (__VLS_ctx.isBackTurned),
    isError: (__VLS_ctx.isError),
    ...{ class: "login-chars" },
}));
const __VLS_25 = __VLS_24({
    isPeeking: (__VLS_ctx.isPeeking),
    isBackTurned: (__VLS_ctx.isBackTurned),
    isError: (__VLS_ctx.isError),
    ...{ class: "login-chars" },
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
/** @type {__VLS_StyleScopedClasses['login-chars']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stars-container" },
});
/** @type {__VLS_StyleScopedClasses['stars-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "star star-1" },
});
/** @type {__VLS_StyleScopedClasses['star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "star star-2" },
});
/** @type {__VLS_StyleScopedClasses['star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "star star-3" },
});
/** @type {__VLS_StyleScopedClasses['star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "star star-4" },
});
/** @type {__VLS_StyleScopedClasses['star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "star star-5" },
});
/** @type {__VLS_StyleScopedClasses['star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-side" },
});
/** @type {__VLS_StyleScopedClasses['form-side']} */ ;
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    ...{ class: "login-card" },
}));
const __VLS_30 = __VLS_29({
    ...{ class: "login-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
/** @type {__VLS_StyleScopedClasses['login-card']} */ ;
const { default: __VLS_33 } = __VLS_31.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "brand-title" },
});
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
for (const [char, index] of __VLS_vFor((__VLS_ctx.brandChars))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ onClick: (__VLS_ctx.backHome) },
        key: (index),
        ...{ style: ({ animationDelay: `${index * 150}ms` }) },
    });
    (char);
    // @ts-ignore
    [isPeeking, isBackTurned, isError, brandChars, backHome,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "subtitle" },
});
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "login-tabs" },
});
/** @type {__VLS_StyleScopedClasses['login-tabs']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.switchTab('account');
            // @ts-ignore
            [switchTab,];
        } },
    ...{ class: "login-tab" },
    ...{ class: ({ active: __VLS_ctx.loginTab === 'account' }) },
});
/** @type {__VLS_StyleScopedClasses['login-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.switchTab('email');
            // @ts-ignore
            [switchTab, loginTab,];
        } },
    ...{ class: "login-tab" },
    ...{ class: ({ active: __VLS_ctx.loginTab === 'email' }) },
});
/** @type {__VLS_StyleScopedClasses['login-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
let __VLS_34;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    model: (__VLS_ctx.accountForm),
    rules: (__VLS_ctx.accountRules),
    ref: "accountFormRef",
    labelPosition: "top",
}));
const __VLS_36 = __VLS_35({
    model: (__VLS_ctx.accountForm),
    rules: (__VLS_ctx.accountRules),
    ref: "accountFormRef",
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loginTab === 'account') }, null, null);
var __VLS_39 = {};
const { default: __VLS_41 } = __VLS_37.slots;
let __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    label: "用户名",
    prop: "username",
}));
const __VLS_44 = __VLS_43({
    label: "用户名",
    prop: "username",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
const { default: __VLS_47 } = __VLS_45.slots;
let __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    ...{ 'onFocus': {} },
    ...{ 'onBlur': {} },
    modelValue: (__VLS_ctx.accountForm.username),
    placeholder: "请输入用户名",
    ...{ class: "custom-input" },
}));
const __VLS_50 = __VLS_49({
    ...{ 'onFocus': {} },
    ...{ 'onBlur': {} },
    modelValue: (__VLS_ctx.accountForm.username),
    placeholder: "请输入用户名",
    ...{ class: "custom-input" },
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_53;
const __VLS_54 = ({ focus: {} },
    { onFocus: (__VLS_ctx.handlePasswordFocus) });
const __VLS_55 = ({ blur: {} },
    { onBlur: (__VLS_ctx.handlePasswordBlur) });
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
const { default: __VLS_56 } = __VLS_51.slots;
{
    const { prefix: __VLS_57 } = __VLS_51.slots;
    let __VLS_58;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({}));
    const __VLS_60 = __VLS_59({}, ...__VLS_functionalComponentArgsRest(__VLS_59));
    const { default: __VLS_63 } = __VLS_61.slots;
    let __VLS_64;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({}));
    const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
    // @ts-ignore
    [loginTab, loginTab, accountForm, accountForm, accountRules, handlePasswordFocus, handlePasswordBlur,];
    var __VLS_61;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_51;
var __VLS_52;
// @ts-ignore
[];
var __VLS_45;
let __VLS_69;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
    label: "密码",
    prop: "password",
}));
const __VLS_71 = __VLS_70({
    label: "密码",
    prop: "password",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
const { default: __VLS_74 } = __VLS_72.slots;
let __VLS_75;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
    ...{ 'onFocus': {} },
    ...{ 'onBlur': {} },
    modelValue: (__VLS_ctx.accountForm.password),
    type: (__VLS_ctx.passwordType),
    placeholder: "请输入密码",
    ...{ class: "custom-input" },
}));
const __VLS_77 = __VLS_76({
    ...{ 'onFocus': {} },
    ...{ 'onBlur': {} },
    modelValue: (__VLS_ctx.accountForm.password),
    type: (__VLS_ctx.passwordType),
    placeholder: "请输入密码",
    ...{ class: "custom-input" },
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
let __VLS_80;
const __VLS_81 = ({ focus: {} },
    { onFocus: (__VLS_ctx.handlePasswordFocus) });
const __VLS_82 = ({ blur: {} },
    { onBlur: (__VLS_ctx.handlePasswordBlur) });
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
const { default: __VLS_83 } = __VLS_78.slots;
{
    const { prefix: __VLS_84 } = __VLS_78.slots;
    let __VLS_85;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({}));
    const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
    const { default: __VLS_90 } = __VLS_88.slots;
    let __VLS_91;
    /** @ts-ignore @type {typeof __VLS_components.Lock} */
    Lock;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({}));
    const __VLS_93 = __VLS_92({}, ...__VLS_functionalComponentArgsRest(__VLS_92));
    // @ts-ignore
    [accountForm, handlePasswordFocus, handlePasswordBlur, passwordType,];
    var __VLS_88;
    // @ts-ignore
    [];
}
{
    const { suffix: __VLS_96 } = __VLS_78.slots;
    let __VLS_97;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
        ...{ 'onClick': {} },
        ...{ class: "cursor-pointer" },
    }));
    const __VLS_99 = __VLS_98({
        ...{ 'onClick': {} },
        ...{ class: "cursor-pointer" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    let __VLS_102;
    const __VLS_103 = ({ click: {} },
        { onClick: (__VLS_ctx.togglePasswordVisibility) });
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    const { default: __VLS_104 } = __VLS_100.slots;
    if (__VLS_ctx.passwordType === 'text') {
        let __VLS_105;
        /** @ts-ignore @type {typeof __VLS_components.View} */
        View;
        // @ts-ignore
        const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({}));
        const __VLS_107 = __VLS_106({}, ...__VLS_functionalComponentArgsRest(__VLS_106));
    }
    else {
        let __VLS_110;
        /** @ts-ignore @type {typeof __VLS_components.Hide} */
        Hide;
        // @ts-ignore
        const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({}));
        const __VLS_112 = __VLS_111({}, ...__VLS_functionalComponentArgsRest(__VLS_111));
    }
    // @ts-ignore
    [passwordType, togglePasswordVisibility,];
    var __VLS_100;
    var __VLS_101;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_78;
var __VLS_79;
// @ts-ignore
[];
var __VLS_72;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-actions" },
});
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
let __VLS_115;
/** @ts-ignore @type {typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox} */
elCheckbox;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
    modelValue: (__VLS_ctx.rememberMe),
    ...{ class: "remember-checkbox" },
}));
const __VLS_117 = __VLS_116({
    modelValue: (__VLS_ctx.rememberMe),
    ...{ class: "remember-checkbox" },
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
/** @type {__VLS_StyleScopedClasses['remember-checkbox']} */ ;
const { default: __VLS_120 } = __VLS_118.slots;
// @ts-ignore
[rememberMe,];
var __VLS_118;
let __VLS_121;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
    ...{ class: "forgot-link" },
}));
const __VLS_123 = __VLS_122({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
    ...{ class: "forgot-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
let __VLS_126;
const __VLS_127 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/forgot-password');
            // @ts-ignore
            [$router,];
        } });
/** @type {__VLS_StyleScopedClasses['forgot-link']} */ ;
const { default: __VLS_128 } = __VLS_124.slots;
// @ts-ignore
[];
var __VLS_124;
var __VLS_125;
// @ts-ignore
[];
var __VLS_37;
let __VLS_129;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
    model: (__VLS_ctx.emailForm),
    rules: (__VLS_ctx.emailRules),
    ref: "emailFormRef",
    labelPosition: "top",
}));
const __VLS_131 = __VLS_130({
    model: (__VLS_ctx.emailForm),
    rules: (__VLS_ctx.emailRules),
    ref: "emailFormRef",
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loginTab === 'email') }, null, null);
var __VLS_134 = {};
const { default: __VLS_136 } = __VLS_132.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "email-login-mode-switch" },
});
/** @type {__VLS_StyleScopedClasses['email-login-mode-switch']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emailLoginMode = 'code';
            // @ts-ignore
            [loginTab, emailForm, emailRules, emailLoginMode,];
        } },
    ...{ class: "mode-btn" },
    ...{ class: ({ active: __VLS_ctx.emailLoginMode === 'code' }) },
});
/** @type {__VLS_StyleScopedClasses['mode-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "mode-divider" },
});
/** @type {__VLS_StyleScopedClasses['mode-divider']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emailLoginMode = 'password';
            // @ts-ignore
            [emailLoginMode, emailLoginMode,];
        } },
    ...{ class: "mode-btn" },
    ...{ class: ({ active: __VLS_ctx.emailLoginMode === 'password' }) },
});
/** @type {__VLS_StyleScopedClasses['mode-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
let __VLS_137;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
    label: "邮箱",
    prop: "email",
}));
const __VLS_139 = __VLS_138({
    label: "邮箱",
    prop: "email",
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
const { default: __VLS_142 } = __VLS_140.slots;
let __VLS_143;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
    ...{ 'onFocus': {} },
    ...{ 'onBlur': {} },
    modelValue: (__VLS_ctx.emailForm.email),
    placeholder: "请输入邮箱地址",
    ...{ class: "custom-input" },
}));
const __VLS_145 = __VLS_144({
    ...{ 'onFocus': {} },
    ...{ 'onBlur': {} },
    modelValue: (__VLS_ctx.emailForm.email),
    placeholder: "请输入邮箱地址",
    ...{ class: "custom-input" },
}, ...__VLS_functionalComponentArgsRest(__VLS_144));
let __VLS_148;
const __VLS_149 = ({ focus: {} },
    { onFocus: (__VLS_ctx.handlePasswordFocus) });
const __VLS_150 = ({ blur: {} },
    { onBlur: (__VLS_ctx.handlePasswordBlur) });
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
const { default: __VLS_151 } = __VLS_146.slots;
{
    const { prefix: __VLS_152 } = __VLS_146.slots;
    let __VLS_153;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153({}));
    const __VLS_155 = __VLS_154({}, ...__VLS_functionalComponentArgsRest(__VLS_154));
    const { default: __VLS_158 } = __VLS_156.slots;
    let __VLS_159;
    /** @ts-ignore @type {typeof __VLS_components.Message} */
    Message;
    // @ts-ignore
    const __VLS_160 = __VLS_asFunctionalComponent1(__VLS_159, new __VLS_159({}));
    const __VLS_161 = __VLS_160({}, ...__VLS_functionalComponentArgsRest(__VLS_160));
    // @ts-ignore
    [handlePasswordFocus, handlePasswordBlur, emailForm, emailLoginMode,];
    var __VLS_156;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_146;
var __VLS_147;
// @ts-ignore
[];
var __VLS_140;
if (__VLS_ctx.emailLoginMode === 'code') {
    let __VLS_164;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({
        label: "验证码",
        prop: "code",
    }));
    const __VLS_166 = __VLS_165({
        label: "验证码",
        prop: "code",
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    const { default: __VLS_169 } = __VLS_167.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "code-input-row" },
    });
    /** @type {__VLS_StyleScopedClasses['code-input-row']} */ ;
    let __VLS_170;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent1(__VLS_170, new __VLS_170({
        ...{ 'onFocus': {} },
        ...{ 'onBlur': {} },
        modelValue: (__VLS_ctx.emailForm.code),
        placeholder: "请输入6位验证码",
        ...{ class: "custom-input code-input" },
        maxlength: "6",
    }));
    const __VLS_172 = __VLS_171({
        ...{ 'onFocus': {} },
        ...{ 'onBlur': {} },
        modelValue: (__VLS_ctx.emailForm.code),
        placeholder: "请输入6位验证码",
        ...{ class: "custom-input code-input" },
        maxlength: "6",
    }, ...__VLS_functionalComponentArgsRest(__VLS_171));
    let __VLS_175;
    const __VLS_176 = ({ focus: {} },
        { onFocus: (__VLS_ctx.handlePasswordFocus) });
    const __VLS_177 = ({ blur: {} },
        { onBlur: (__VLS_ctx.handlePasswordBlur) });
    /** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
    /** @type {__VLS_StyleScopedClasses['code-input']} */ ;
    const { default: __VLS_178 } = __VLS_173.slots;
    {
        const { prefix: __VLS_179 } = __VLS_173.slots;
        let __VLS_180;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({}));
        const __VLS_182 = __VLS_181({}, ...__VLS_functionalComponentArgsRest(__VLS_181));
        const { default: __VLS_185 } = __VLS_183.slots;
        let __VLS_186;
        /** @ts-ignore @type {typeof __VLS_components.Key} */
        Key;
        // @ts-ignore
        const __VLS_187 = __VLS_asFunctionalComponent1(__VLS_186, new __VLS_186({}));
        const __VLS_188 = __VLS_187({}, ...__VLS_functionalComponentArgsRest(__VLS_187));
        // @ts-ignore
        [handlePasswordFocus, handlePasswordBlur, emailForm, emailLoginMode,];
        var __VLS_183;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_173;
    var __VLS_174;
    let __VLS_191;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191({
        ...{ 'onClick': {} },
        ...{ class: "send-code-btn" },
        disabled: (__VLS_ctx.codeCountdown > 0),
        loading: (__VLS_ctx.sendingCode),
    }));
    const __VLS_193 = __VLS_192({
        ...{ 'onClick': {} },
        ...{ class: "send-code-btn" },
        disabled: (__VLS_ctx.codeCountdown > 0),
        loading: (__VLS_ctx.sendingCode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_192));
    let __VLS_196;
    const __VLS_197 = ({ click: {} },
        { onClick: (__VLS_ctx.handleSendCode) });
    /** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
    const { default: __VLS_198 } = __VLS_194.slots;
    (__VLS_ctx.codeCountdown > 0 ? `${__VLS_ctx.codeCountdown}秒后重发` : '发送验证码');
    // @ts-ignore
    [codeCountdown, codeCountdown, codeCountdown, sendingCode, handleSendCode,];
    var __VLS_194;
    var __VLS_195;
    // @ts-ignore
    [];
    var __VLS_167;
}
else {
    let __VLS_199;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_200 = __VLS_asFunctionalComponent1(__VLS_199, new __VLS_199({
        label: "密码",
        prop: "password",
    }));
    const __VLS_201 = __VLS_200({
        label: "密码",
        prop: "password",
    }, ...__VLS_functionalComponentArgsRest(__VLS_200));
    const { default: __VLS_204 } = __VLS_202.slots;
    let __VLS_205;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_206 = __VLS_asFunctionalComponent1(__VLS_205, new __VLS_205({
        ...{ 'onFocus': {} },
        ...{ 'onBlur': {} },
        modelValue: (__VLS_ctx.emailForm.password),
        type: (__VLS_ctx.emailPasswordType),
        placeholder: "请输入密码",
        ...{ class: "custom-input" },
    }));
    const __VLS_207 = __VLS_206({
        ...{ 'onFocus': {} },
        ...{ 'onBlur': {} },
        modelValue: (__VLS_ctx.emailForm.password),
        type: (__VLS_ctx.emailPasswordType),
        placeholder: "请输入密码",
        ...{ class: "custom-input" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_206));
    let __VLS_210;
    const __VLS_211 = ({ focus: {} },
        { onFocus: (__VLS_ctx.handlePasswordFocus) });
    const __VLS_212 = ({ blur: {} },
        { onBlur: (__VLS_ctx.handlePasswordBlur) });
    /** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
    const { default: __VLS_213 } = __VLS_208.slots;
    {
        const { prefix: __VLS_214 } = __VLS_208.slots;
        let __VLS_215;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_216 = __VLS_asFunctionalComponent1(__VLS_215, new __VLS_215({}));
        const __VLS_217 = __VLS_216({}, ...__VLS_functionalComponentArgsRest(__VLS_216));
        const { default: __VLS_220 } = __VLS_218.slots;
        let __VLS_221;
        /** @ts-ignore @type {typeof __VLS_components.Lock} */
        Lock;
        // @ts-ignore
        const __VLS_222 = __VLS_asFunctionalComponent1(__VLS_221, new __VLS_221({}));
        const __VLS_223 = __VLS_222({}, ...__VLS_functionalComponentArgsRest(__VLS_222));
        // @ts-ignore
        [handlePasswordFocus, handlePasswordBlur, emailForm, emailPasswordType,];
        var __VLS_218;
        // @ts-ignore
        [];
    }
    {
        const { suffix: __VLS_226 } = __VLS_208.slots;
        let __VLS_227;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({
            ...{ 'onClick': {} },
            ...{ class: "cursor-pointer" },
        }));
        const __VLS_229 = __VLS_228({
            ...{ 'onClick': {} },
            ...{ class: "cursor-pointer" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_228));
        let __VLS_232;
        const __VLS_233 = ({ click: {} },
            { onClick: (__VLS_ctx.toggleEmailPasswordVisibility) });
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        const { default: __VLS_234 } = __VLS_230.slots;
        if (__VLS_ctx.emailPasswordType === 'text') {
            let __VLS_235;
            /** @ts-ignore @type {typeof __VLS_components.View} */
            View;
            // @ts-ignore
            const __VLS_236 = __VLS_asFunctionalComponent1(__VLS_235, new __VLS_235({}));
            const __VLS_237 = __VLS_236({}, ...__VLS_functionalComponentArgsRest(__VLS_236));
        }
        else {
            let __VLS_240;
            /** @ts-ignore @type {typeof __VLS_components.Hide} */
            Hide;
            // @ts-ignore
            const __VLS_241 = __VLS_asFunctionalComponent1(__VLS_240, new __VLS_240({}));
            const __VLS_242 = __VLS_241({}, ...__VLS_functionalComponentArgsRest(__VLS_241));
        }
        // @ts-ignore
        [emailPasswordType, toggleEmailPasswordVisibility,];
        var __VLS_230;
        var __VLS_231;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_208;
    var __VLS_209;
    // @ts-ignore
    [];
    var __VLS_202;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-actions" },
});
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
let __VLS_245;
/** @ts-ignore @type {typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox} */
elCheckbox;
// @ts-ignore
const __VLS_246 = __VLS_asFunctionalComponent1(__VLS_245, new __VLS_245({
    modelValue: (__VLS_ctx.rememberMe),
    ...{ class: "remember-checkbox" },
}));
const __VLS_247 = __VLS_246({
    modelValue: (__VLS_ctx.rememberMe),
    ...{ class: "remember-checkbox" },
}, ...__VLS_functionalComponentArgsRest(__VLS_246));
/** @type {__VLS_StyleScopedClasses['remember-checkbox']} */ ;
const { default: __VLS_250 } = __VLS_248.slots;
// @ts-ignore
[rememberMe,];
var __VLS_248;
let __VLS_251;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_252 = __VLS_asFunctionalComponent1(__VLS_251, new __VLS_251({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
    ...{ class: "forgot-link" },
}));
const __VLS_253 = __VLS_252({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
    ...{ class: "forgot-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_252));
let __VLS_256;
const __VLS_257 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/forgot-password');
            // @ts-ignore
            [$router,];
        } });
/** @type {__VLS_StyleScopedClasses['forgot-link']} */ ;
const { default: __VLS_258 } = __VLS_254.slots;
// @ts-ignore
[];
var __VLS_254;
var __VLS_255;
// @ts-ignore
[];
var __VLS_132;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "privacy-agreement" },
});
/** @type {__VLS_StyleScopedClasses['privacy-agreement']} */ ;
let __VLS_259;
/** @ts-ignore @type {typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox} */
elCheckbox;
// @ts-ignore
const __VLS_260 = __VLS_asFunctionalComponent1(__VLS_259, new __VLS_259({
    modelValue: (__VLS_ctx.agreedToPrivacy),
    ...{ class: "privacy-checkbox" },
}));
const __VLS_261 = __VLS_260({
    modelValue: (__VLS_ctx.agreedToPrivacy),
    ...{ class: "privacy-checkbox" },
}, ...__VLS_functionalComponentArgsRest(__VLS_260));
/** @type {__VLS_StyleScopedClasses['privacy-checkbox']} */ ;
const { default: __VLS_264 } = __VLS_262.slots;
let __VLS_265;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_266 = __VLS_asFunctionalComponent1(__VLS_265, new __VLS_265({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "privacy-link" },
}));
const __VLS_267 = __VLS_266({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "privacy-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_266));
let __VLS_270;
const __VLS_271 = ({ click: {} },
    { onClick: (__VLS_ctx.showPrivacyDialog) });
/** @type {__VLS_StyleScopedClasses['privacy-link']} */ ;
const { default: __VLS_272 } = __VLS_268.slots;
// @ts-ignore
[agreedToPrivacy, showPrivacyDialog,];
var __VLS_268;
var __VLS_269;
// @ts-ignore
[];
var __VLS_262;
let __VLS_273;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent1(__VLS_273, new __VLS_273({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "full-width-btn login-btn" },
    loading: (__VLS_ctx.loading),
}));
const __VLS_275 = __VLS_274({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "full-width-btn login-btn" },
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_274));
let __VLS_278;
const __VLS_279 = ({ click: {} },
    { onClick: (__VLS_ctx.handleLogin) });
/** @type {__VLS_StyleScopedClasses['full-width-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
const { default: __VLS_280 } = __VLS_276.slots;
(__VLS_ctx.loginTab === 'account' ? '登 录' : '登 录');
// @ts-ignore
[loginTab, loading, handleLogin,];
var __VLS_276;
var __VLS_277;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "register-link" },
});
/** @type {__VLS_StyleScopedClasses['register-link']} */ ;
let __VLS_281;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_282 = __VLS_asFunctionalComponent1(__VLS_281, new __VLS_281({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "register-link-btn" },
}));
const __VLS_283 = __VLS_282({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "register-link-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_282));
let __VLS_286;
const __VLS_287 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/register');
            // @ts-ignore
            [$router,];
        } });
/** @type {__VLS_StyleScopedClasses['register-link-btn']} */ ;
const { default: __VLS_288 } = __VLS_284.slots;
// @ts-ignore
[];
var __VLS_284;
var __VLS_285;
// @ts-ignore
[];
var __VLS_31;
// @ts-ignore
var __VLS_40 = __VLS_39, __VLS_135 = __VLS_134;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
