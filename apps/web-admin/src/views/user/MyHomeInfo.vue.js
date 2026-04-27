/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getUserInfo, updateUserInfo, getEmailChangeInfo, sendChangeEmailCode } from '@/api/user';
import { Message as MessageIcon, Key as KeyIcon } from '@element-plus/icons-vue';
const formRef = ref();
const emailFormRef = ref();
const loading = ref(false);
const avatarPreview = ref('');
const avatarFile = ref(null);
const isEditing = ref(false);
// 缓存编辑前的数据
let originalForm = {};
// 邮箱修改弹窗相关
const emailDialogVisible = ref(false);
const emailForm = reactive({ email: '', code: '' });
const emailCountdown = ref(0);
const emailSending = ref(false);
const emailConfirming = ref(false);
const emailCodeError = ref('');
const emailChangeRemaining = ref(2);
const emailChangeUsed = ref(0);
let emailCountdownTimer = null;
let emailCodeTimer = null;
const form = reactive({
    id: undefined,
    username: '',
    nickname: '',
    sex: 0,
    birthday: '',
    phone: '',
    email: '',
    signature: '',
    headPath: '',
    emailVerified: 0
});
const rules = {
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 2, max: 20, message: '昵称长度为2-20个字符', trigger: 'blur' }
    ]
};
const emailRules = {
    email: [
        { required: true, message: '请输入新邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 6, message: '验证码为6位', trigger: 'blur' }
    ]
};
const fetchUserInfo = async () => {
    try {
        const res = await getUserInfo();
        if (res.code === 200) {
            Object.assign(form, res.data);
        }
    }
    catch {
        ElMessage.error('获取用户信息失败');
    }
};
const fetchEmailChangeInfo = async () => {
    try {
        const res = await getEmailChangeInfo();
        if (res.code === 200) {
            emailChangeRemaining.value = res.data.remainingCount ?? 2;
            emailChangeUsed.value = (res.data.maxCount ?? 2) - emailChangeRemaining.value;
        }
    }
    catch {
        // 忽略，默认为2次
        emailChangeRemaining.value = 2;
    }
};
const formatSex = (sex) => {
    if (sex === 0)
        return '保密';
    if (sex === 1)
        return '男';
    if (sex === 2)
        return '女';
    return '-';
};
// 进入编辑模式
const enterEdit = async () => {
    originalForm = JSON.parse(JSON.stringify(form));
    isEditing.value = true;
    avatarPreview.value = '';
    avatarFile.value = null;
    await fetchEmailChangeInfo();
};
// 打开更改邮箱弹窗
const showEmailDialog = async () => {
    emailForm.email = '';
    emailForm.code = '';
    emailCodeError.value = '';
    emailCountdown.value = 0;
    emailSending.value = false;
    emailConfirming.value = false;
    if (emailCountdownTimer)
        clearInterval(emailCountdownTimer);
    await fetchEmailChangeInfo();
    emailDialogVisible.value = true;
};
// 确认更换邮箱（弹窗内直接更换）
const handleEmailDialogConfirm = async () => {
    if (!emailFormRef.value)
        return;
    await emailFormRef.value.validate(async (valid) => {
        if (!valid)
            return;
        if (!emailForm.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailForm.email)) {
            ElMessage.error('请输入正确的新邮箱地址');
            return;
        }
        if (emailForm.email.toLowerCase() === (form.email || '').toLowerCase()) {
            ElMessage.error('新邮箱不能与当前邮箱相同');
            return;
        }
        if (!emailForm.code || emailForm.code.length !== 6) {
            emailCodeError.value = '请输入6位验证码';
            return;
        }
        emailCodeError.value = '';
        emailConfirming.value = true;
        try {
            const res = await updateUserInfo({
                newEmail: emailForm.email,
                emailCode: emailForm.code
            });
            if (res.code === 200) {
                ElMessage.success('邮箱更换成功');
                Object.assign(form, res.data);
                localStorage.setItem('user', JSON.stringify({
                    ...JSON.parse(localStorage.getItem('user') || '{}'),
                    email: res.data.email,
                    emailVerified: res.data.emailVerified
                }));
                emailDialogVisible.value = false;
                await fetchEmailChangeInfo();
            }
            else {
                emailCodeError.value = res.message;
            }
        }
        catch (error) {
            emailCodeError.value = error.message || '更换失败';
        }
        finally {
            emailConfirming.value = false;
        }
    });
};
// 取消编辑
const cancelEdit = () => {
    Object.assign(form, originalForm);
    isEditing.value = false;
    avatarPreview.value = '';
    avatarFile.value = null;
    emailDialogVisible.value = false;
};
const beforeUpload = (rawFile) => {
    const isImage = rawFile.type.startsWith('image/');
    const isLt2M = rawFile.size / 1024 / 1024 < 2;
    if (!isImage) {
        ElMessage.error('只能上传图片文件');
        return false;
    }
    if (!isLt2M) {
        ElMessage.error('图片大小不能超过2MB');
        return false;
    }
    return true;
};
const handleAvatarChange = (uploadFile) => {
    if (uploadFile.raw) {
        if (!beforeUpload(uploadFile.raw))
            return;
        avatarFile.value = uploadFile.raw;
        avatarPreview.value = URL.createObjectURL(uploadFile.raw);
    }
};
const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'avatar');
    const { default: request } = await import('@/api/user');
    return request.post('/common/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
// 发送邮箱验证码
const handleSendEmailCode = async () => {
    if (!emailForm.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailForm.email)) {
        ElMessage.error('请输入正确的新邮箱地址');
        return;
    }
    if (emailForm.email.toLowerCase() === (form.email || '').toLowerCase()) {
        ElMessage.error('新邮箱不能与当前邮箱相同');
        return;
    }
    emailSending.value = true;
    try {
        const res = await sendChangeEmailCode({ email: emailForm.email });
        if (res.code === 200) {
            ElMessage.success(res.message || '验证码已发送到您的邮箱');
            emailCountdown.value = 60;
            if (emailCodeTimer)
                clearInterval(emailCodeTimer);
            emailCodeTimer = setInterval(() => {
                emailCountdown.value--;
                if (emailCountdown.value <= 0 && emailCodeTimer)
                    clearInterval(emailCodeTimer);
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
        emailSending.value = false;
    }
};
// 提交表单
const submitForm = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (!valid)
            return;
        // 校验：换了新邮箱但没填验证码
        const emailChanged = emailForm.email && emailForm.email !== form.email;
        if (emailChanged && (!emailForm.code || emailForm.code.length !== 6)) {
            emailCodeError.value = '修改邮箱必须填写验证码';
            return;
        }
        emailCodeError.value = '';
        loading.value = true;
        try {
            // 上传新头像
            if (avatarFile.value) {
                const res = await uploadAvatar(avatarFile.value);
                if (res.code === 200) {
                    form.headPath = res.data;
                }
                else {
                    throw new Error(res.message || '头像上传失败');
                }
            }
            const payload = { ...form };
            if (emailChanged) {
                payload.emailCode = emailForm.code;
                payload.newEmail = emailForm.email;
            }
            const res = await updateUserInfo(payload);
            if (res.code === 200) {
                ElMessage.success('保存成功');
                Object.assign(form, res.data);
                localStorage.setItem('user', JSON.stringify({
                    ...JSON.parse(localStorage.getItem('user') || '{}'),
                    nickname: res.data.nickname,
                    headPath: res.data.headPath
                }));
                isEditing.value = false;
                emailForm.email = '';
                emailForm.code = '';
                avatarFile.value = null;
                avatarPreview.value = '';
                await fetchEmailChangeInfo();
            }
            else {
                ElMessage.error(res.message || '保存失败');
                // 如果是邮箱验证码错误，提示
                if (res.message?.includes('验证码')) {
                    emailCodeError.value = res.message;
                }
            }
        }
        catch (error) {
            ElMessage.error(error.message || '保存失败');
            if (error.message?.includes('验证码')) {
                emailCodeError.value = error.message;
            }
        }
        finally {
            loading.value = false;
        }
    });
};
onMounted(() => {
    fetchUserInfo();
});
onUnmounted(() => {
    if (emailCodeTimer)
        clearInterval(emailCodeTimer);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['mode-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input']} */ ;
/** @type {__VLS_StyleScopedClasses['is-disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
/** @type {__VLS_StyleScopedClasses['el-textarea__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
/** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--primary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "profile-edit" },
});
/** @type {__VLS_StyleScopedClasses['profile-edit']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
if (!__VLS_ctx.isEditing) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mode-toggle" },
    });
    /** @type {__VLS_StyleScopedClasses['mode-toggle']} */ ;
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
        { onClick: (__VLS_ctx.enterEdit) });
    const { default: __VLS_7 } = __VLS_3.slots;
    // @ts-ignore
    [isEditing, enterEdit,];
    var __VLS_3;
    var __VLS_4;
}
if (!__VLS_ctx.isEditing) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "view-mode" },
    });
    /** @type {__VLS_StyleScopedClasses['view-mode']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-card" },
    });
    /** @type {__VLS_StyleScopedClasses['info-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-row avatar-row" },
    });
    /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['avatar-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    let __VLS_8;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        size: (80),
        src: (__VLS_ctx.form.headPath),
    }));
    const __VLS_10 = __VLS_9({
        size: (80),
        src: (__VLS_ctx.form.headPath),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const { default: __VLS_13 } = __VLS_11.slots;
    {
        const { default: __VLS_14 } = __VLS_11.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [isEditing, form,];
    }
    // @ts-ignore
    [];
    var __VLS_11;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-row" },
    });
    /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.form.username || '-');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-row" },
    });
    /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.form.nickname || '-');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-row" },
    });
    /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.formatSex(__VLS_ctx.form.sex));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-row" },
    });
    /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.form.birthday || '-');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-row" },
    });
    /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.form.phone || '-');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-row" },
    });
    /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-value email-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['email-value']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.form.email || '-');
    if (__VLS_ctx.form.email) {
        let __VLS_15;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            type: (__VLS_ctx.form.emailVerified === 1 ? 'success' : 'warning'),
            size: "small",
        }));
        const __VLS_17 = __VLS_16({
            type: (__VLS_ctx.form.emailVerified === 1 ? 'success' : 'warning'),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        const { default: __VLS_20 } = __VLS_18.slots;
        (__VLS_ctx.form.emailVerified === 1 ? '已验证' : '未验证');
        // @ts-ignore
        [form, form, form, form, form, form, form, form, form, formatSex,];
        var __VLS_18;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-row" },
    });
    /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-value signature-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['signature-value']} */ ;
    (__VLS_ctx.form.signature || '-');
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "edit-mode" },
    });
    /** @type {__VLS_StyleScopedClasses['edit-mode']} */ ;
    let __VLS_21;
    /** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
    elForm;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        ref: "formRef",
        model: (__VLS_ctx.form),
        rules: (__VLS_ctx.rules),
        labelPosition: "top",
        ...{ class: "profile-form" },
    }));
    const __VLS_23 = __VLS_22({
        ref: "formRef",
        model: (__VLS_ctx.form),
        rules: (__VLS_ctx.rules),
        labelPosition: "top",
        ...{ class: "profile-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    var __VLS_26 = {};
    /** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
    const { default: __VLS_28 } = __VLS_24.slots;
    let __VLS_29;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        label: "头像",
    }));
    const __VLS_31 = __VLS_30({
        label: "头像",
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    const { default: __VLS_34 } = __VLS_32.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "avatar-upload" },
    });
    /** @type {__VLS_StyleScopedClasses['avatar-upload']} */ ;
    let __VLS_35;
    /** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
    elUpload;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        ...{ class: "avatar-uploader" },
        showFileList: (false),
        onChange: (__VLS_ctx.handleAvatarChange),
        beforeUpload: (__VLS_ctx.beforeUpload),
        autoUpload: (false),
    }));
    const __VLS_37 = __VLS_36({
        ...{ class: "avatar-uploader" },
        showFileList: (false),
        onChange: (__VLS_ctx.handleAvatarChange),
        beforeUpload: (__VLS_ctx.beforeUpload),
        autoUpload: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    /** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
    const { default: __VLS_40 } = __VLS_38.slots;
    let __VLS_41;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        size: (80),
        src: (__VLS_ctx.avatarPreview || __VLS_ctx.form.headPath),
    }));
    const __VLS_43 = __VLS_42({
        size: (80),
        src: (__VLS_ctx.avatarPreview || __VLS_ctx.form.headPath),
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    const { default: __VLS_46 } = __VLS_44.slots;
    {
        const { default: __VLS_47 } = __VLS_44.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [form, form, form, rules, handleAvatarChange, beforeUpload, avatarPreview,];
    }
    // @ts-ignore
    [];
    var __VLS_44;
    let __VLS_48;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
        type: "primary",
        size: "small",
        ...{ style: {} },
    }));
    const __VLS_50 = __VLS_49({
        type: "primary",
        size: "small",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const { default: __VLS_53 } = __VLS_51.slots;
    // @ts-ignore
    [];
    var __VLS_51;
    // @ts-ignore
    [];
    var __VLS_38;
    // @ts-ignore
    [];
    var __VLS_32;
    let __VLS_54;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
        label: "用户名",
    }));
    const __VLS_56 = __VLS_55({
        label: "用户名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    const { default: __VLS_59 } = __VLS_57.slots;
    let __VLS_60;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
        modelValue: (__VLS_ctx.form.username),
        disabled: true,
        placeholder: "用户名不可修改",
    }));
    const __VLS_62 = __VLS_61({
        modelValue: (__VLS_ctx.form.username),
        disabled: true,
        placeholder: "用户名不可修改",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    // @ts-ignore
    [form,];
    var __VLS_57;
    let __VLS_65;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
        label: "昵称",
        prop: "nickname",
    }));
    const __VLS_67 = __VLS_66({
        label: "昵称",
        prop: "nickname",
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    const { default: __VLS_70 } = __VLS_68.slots;
    let __VLS_71;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
        modelValue: (__VLS_ctx.form.nickname),
        placeholder: "请输入昵称",
    }));
    const __VLS_73 = __VLS_72({
        modelValue: (__VLS_ctx.form.nickname),
        placeholder: "请输入昵称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    // @ts-ignore
    [form,];
    var __VLS_68;
    let __VLS_76;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
        label: "性别",
    }));
    const __VLS_78 = __VLS_77({
        label: "性别",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    const { default: __VLS_81 } = __VLS_79.slots;
    let __VLS_82;
    /** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
    elRadioGroup;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
        modelValue: (__VLS_ctx.form.sex),
    }));
    const __VLS_84 = __VLS_83({
        modelValue: (__VLS_ctx.form.sex),
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    const { default: __VLS_87 } = __VLS_85.slots;
    let __VLS_88;
    /** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
    elRadio;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
        label: (0),
    }));
    const __VLS_90 = __VLS_89({
        label: (0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    const { default: __VLS_93 } = __VLS_91.slots;
    // @ts-ignore
    [form,];
    var __VLS_91;
    let __VLS_94;
    /** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
    elRadio;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
        label: (1),
    }));
    const __VLS_96 = __VLS_95({
        label: (1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    const { default: __VLS_99 } = __VLS_97.slots;
    // @ts-ignore
    [];
    var __VLS_97;
    let __VLS_100;
    /** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
    elRadio;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
        label: (2),
    }));
    const __VLS_102 = __VLS_101({
        label: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    const { default: __VLS_105 } = __VLS_103.slots;
    // @ts-ignore
    [];
    var __VLS_103;
    // @ts-ignore
    [];
    var __VLS_85;
    // @ts-ignore
    [];
    var __VLS_79;
    let __VLS_106;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
        label: "生日",
    }));
    const __VLS_108 = __VLS_107({
        label: "生日",
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    const { default: __VLS_111 } = __VLS_109.slots;
    let __VLS_112;
    /** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker | typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
    elDatePicker;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
        modelValue: (__VLS_ctx.form.birthday),
        type: "date",
        placeholder: "选择生日",
        valueFormat: "YYYY-MM-DD",
        ...{ style: {} },
    }));
    const __VLS_114 = __VLS_113({
        modelValue: (__VLS_ctx.form.birthday),
        type: "date",
        placeholder: "选择生日",
        valueFormat: "YYYY-MM-DD",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    // @ts-ignore
    [form,];
    var __VLS_109;
    let __VLS_117;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
        label: "手机号",
    }));
    const __VLS_119 = __VLS_118({
        label: "手机号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_118));
    const { default: __VLS_122 } = __VLS_120.slots;
    let __VLS_123;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
        modelValue: (__VLS_ctx.form.phone),
        placeholder: "请输入手机号",
    }));
    const __VLS_125 = __VLS_124({
        modelValue: (__VLS_ctx.form.phone),
        placeholder: "请输入手机号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_124));
    // @ts-ignore
    [form,];
    var __VLS_120;
    let __VLS_128;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
        label: "邮箱",
    }));
    const __VLS_130 = __VLS_129({
        label: "邮箱",
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    const { default: __VLS_133 } = __VLS_131.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-display-row" },
    });
    /** @type {__VLS_StyleScopedClasses['email-display-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "email-current-display" },
    });
    /** @type {__VLS_StyleScopedClasses['email-current-display']} */ ;
    (__VLS_ctx.form.email || '未设置');
    if (__VLS_ctx.form.email) {
        let __VLS_134;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
            type: (__VLS_ctx.form.emailVerified === 1 ? 'success' : 'warning'),
            size: "small",
        }));
        const __VLS_136 = __VLS_135({
            type: (__VLS_ctx.form.emailVerified === 1 ? 'success' : 'warning'),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_135));
        const { default: __VLS_139 } = __VLS_137.slots;
        (__VLS_ctx.form.emailVerified === 1 ? '已验证' : '未验证');
        // @ts-ignore
        [form, form, form, form,];
        var __VLS_137;
    }
    let __VLS_140;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140({
        ...{ 'onClick': {} },
        type: "primary",
        plain: true,
        size: "small",
    }));
    const __VLS_142 = __VLS_141({
        ...{ 'onClick': {} },
        type: "primary",
        plain: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    let __VLS_145;
    const __VLS_146 = ({ click: {} },
        { onClick: (__VLS_ctx.showEmailDialog) });
    const { default: __VLS_147 } = __VLS_143.slots;
    // @ts-ignore
    [showEmailDialog,];
    var __VLS_143;
    var __VLS_144;
    // @ts-ignore
    [];
    var __VLS_131;
    let __VLS_148;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
        label: "个性签名",
        prop: "signature",
    }));
    const __VLS_150 = __VLS_149({
        label: "个性签名",
        prop: "signature",
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    const { default: __VLS_153 } = __VLS_151.slots;
    let __VLS_154;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_155 = __VLS_asFunctionalComponent1(__VLS_154, new __VLS_154({
        modelValue: (__VLS_ctx.form.signature),
        type: "textarea",
        rows: (3),
        placeholder: "请输入个性签名",
        maxlength: "100",
        showWordLimit: true,
    }));
    const __VLS_156 = __VLS_155({
        modelValue: (__VLS_ctx.form.signature),
        type: "textarea",
        rows: (3),
        placeholder: "请输入个性签名",
        maxlength: "100",
        showWordLimit: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_155));
    // @ts-ignore
    [form,];
    var __VLS_151;
    let __VLS_159;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_160 = __VLS_asFunctionalComponent1(__VLS_159, new __VLS_159({
        ...{ class: "form-actions" },
    }));
    const __VLS_161 = __VLS_160({
        ...{ class: "form-actions" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_160));
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    const { default: __VLS_164 } = __VLS_162.slots;
    let __VLS_165;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent1(__VLS_165, new __VLS_165({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_167 = __VLS_166({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_166));
    let __VLS_170;
    const __VLS_171 = ({ click: {} },
        { onClick: (__VLS_ctx.submitForm) });
    const { default: __VLS_172 } = __VLS_168.slots;
    // @ts-ignore
    [loading, submitForm,];
    var __VLS_168;
    var __VLS_169;
    let __VLS_173;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
        ...{ 'onClick': {} },
        type: "danger",
    }));
    const __VLS_175 = __VLS_174({
        ...{ 'onClick': {} },
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_174));
    let __VLS_178;
    const __VLS_179 = ({ click: {} },
        { onClick: (__VLS_ctx.cancelEdit) });
    const { default: __VLS_180 } = __VLS_176.slots;
    // @ts-ignore
    [cancelEdit,];
    var __VLS_176;
    var __VLS_177;
    // @ts-ignore
    [];
    var __VLS_162;
    // @ts-ignore
    [];
    var __VLS_24;
}
let __VLS_181;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181({
    modelValue: (__VLS_ctx.emailDialogVisible),
    title: "更改邮箱",
    width: "440px",
    closeOnClickModal: (false),
    ...{ class: "email-change-dialog" },
}));
const __VLS_183 = __VLS_182({
    modelValue: (__VLS_ctx.emailDialogVisible),
    title: "更改邮箱",
    width: "440px",
    closeOnClickModal: (false),
    ...{ class: "email-change-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
/** @type {__VLS_StyleScopedClasses['email-change-dialog']} */ ;
const { default: __VLS_186 } = __VLS_184.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "email-dialog-content" },
});
/** @type {__VLS_StyleScopedClasses['email-dialog-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "email-dialog-tip" },
});
/** @type {__VLS_StyleScopedClasses['email-dialog-tip']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.form.email || '未设置');
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "email-quota-hint" },
});
/** @type {__VLS_StyleScopedClasses['email-quota-hint']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "quota-icon" },
});
/** @type {__VLS_StyleScopedClasses['quota-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.emailChangeUsed);
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.emailChangeRemaining);
if (__VLS_ctx.emailChangeRemaining <= 0) {
    let __VLS_187;
    /** @ts-ignore @type {typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert} */
    elAlert;
    // @ts-ignore
    const __VLS_188 = __VLS_asFunctionalComponent1(__VLS_187, new __VLS_187({
        title: "本月修改次数已用完",
        type: "warning",
        description: ('每月最多修改2次，请于下月再试'),
        closable: (false),
        showIcon: true,
        ...{ style: {} },
    }));
    const __VLS_189 = __VLS_188({
        title: "本月修改次数已用完",
        type: "warning",
        description: ('每月最多修改2次，请于下月再试'),
        closable: (false),
        showIcon: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_188));
}
if (__VLS_ctx.emailChangeRemaining > 0) {
    let __VLS_192;
    /** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
    elForm;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent1(__VLS_192, new __VLS_192({
        model: (__VLS_ctx.emailForm),
        rules: (__VLS_ctx.emailRules),
        ref: "emailFormRef",
        labelPosition: "top",
    }));
    const __VLS_194 = __VLS_193({
        model: (__VLS_ctx.emailForm),
        rules: (__VLS_ctx.emailRules),
        ref: "emailFormRef",
        labelPosition: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    var __VLS_197 = {};
    const { default: __VLS_199 } = __VLS_195.slots;
    let __VLS_200;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent1(__VLS_200, new __VLS_200({
        label: "新邮箱地址",
        prop: "email",
    }));
    const __VLS_202 = __VLS_201({
        label: "新邮箱地址",
        prop: "email",
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    const { default: __VLS_205 } = __VLS_203.slots;
    let __VLS_206;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent1(__VLS_206, new __VLS_206({
        modelValue: (__VLS_ctx.emailForm.email),
        placeholder: "请输入新的邮箱地址",
        prefixIcon: (__VLS_ctx.MessageIcon),
    }));
    const __VLS_208 = __VLS_207({
        modelValue: (__VLS_ctx.emailForm.email),
        placeholder: "请输入新的邮箱地址",
        prefixIcon: (__VLS_ctx.MessageIcon),
    }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    // @ts-ignore
    [form, emailDialogVisible, emailChangeUsed, emailChangeRemaining, emailChangeRemaining, emailChangeRemaining, emailForm, emailForm, emailRules, MessageIcon,];
    var __VLS_203;
    let __VLS_211;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_212 = __VLS_asFunctionalComponent1(__VLS_211, new __VLS_211({
        label: "邮箱验证码",
        prop: "code",
    }));
    const __VLS_213 = __VLS_212({
        label: "邮箱验证码",
        prop: "code",
    }, ...__VLS_functionalComponentArgsRest(__VLS_212));
    const { default: __VLS_216 } = __VLS_214.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "code-row" },
    });
    /** @type {__VLS_StyleScopedClasses['code-row']} */ ;
    let __VLS_217;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent1(__VLS_217, new __VLS_217({
        modelValue: (__VLS_ctx.emailForm.code),
        placeholder: "请输入6位验证码",
        prefixIcon: (__VLS_ctx.KeyIcon),
        maxlength: "6",
        ...{ class: "code-input" },
    }));
    const __VLS_219 = __VLS_218({
        modelValue: (__VLS_ctx.emailForm.code),
        placeholder: "请输入6位验证码",
        prefixIcon: (__VLS_ctx.KeyIcon),
        maxlength: "6",
        ...{ class: "code-input" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    /** @type {__VLS_StyleScopedClasses['code-input']} */ ;
    let __VLS_222;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_223 = __VLS_asFunctionalComponent1(__VLS_222, new __VLS_222({
        ...{ 'onClick': {} },
        ...{ class: "send-code-btn" },
        disabled: (__VLS_ctx.emailCountdown > 0 || __VLS_ctx.emailSending),
        loading: (__VLS_ctx.emailSending),
    }));
    const __VLS_224 = __VLS_223({
        ...{ 'onClick': {} },
        ...{ class: "send-code-btn" },
        disabled: (__VLS_ctx.emailCountdown > 0 || __VLS_ctx.emailSending),
        loading: (__VLS_ctx.emailSending),
    }, ...__VLS_functionalComponentArgsRest(__VLS_223));
    let __VLS_227;
    const __VLS_228 = ({ click: {} },
        { onClick: (__VLS_ctx.handleSendEmailCode) });
    /** @type {__VLS_StyleScopedClasses['send-code-btn']} */ ;
    const { default: __VLS_229 } = __VLS_225.slots;
    (__VLS_ctx.emailCountdown > 0 ? `${__VLS_ctx.emailCountdown}s` : '获取验证码');
    // @ts-ignore
    [emailForm, KeyIcon, emailCountdown, emailCountdown, emailCountdown, emailSending, emailSending, handleSendEmailCode,];
    var __VLS_225;
    var __VLS_226;
    // @ts-ignore
    [];
    var __VLS_214;
    if (__VLS_ctx.emailCodeError) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "dialog-error" },
        });
        /** @type {__VLS_StyleScopedClasses['dialog-error']} */ ;
        (__VLS_ctx.emailCodeError);
    }
    // @ts-ignore
    [emailCodeError, emailCodeError,];
    var __VLS_195;
}
{
    const { footer: __VLS_230 } = __VLS_184.slots;
    let __VLS_231;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_232 = __VLS_asFunctionalComponent1(__VLS_231, new __VLS_231({
        ...{ 'onClick': {} },
        type: "default",
    }));
    const __VLS_233 = __VLS_232({
        ...{ 'onClick': {} },
        type: "default",
    }, ...__VLS_functionalComponentArgsRest(__VLS_232));
    let __VLS_236;
    const __VLS_237 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.emailDialogVisible = false;
                // @ts-ignore
                [emailDialogVisible,];
            } });
    const { default: __VLS_238 } = __VLS_234.slots;
    // @ts-ignore
    [];
    var __VLS_234;
    var __VLS_235;
    if (__VLS_ctx.emailChangeRemaining > 0) {
        let __VLS_239;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_240 = __VLS_asFunctionalComponent1(__VLS_239, new __VLS_239({
            ...{ 'onClick': {} },
            type: "primary",
            loading: (__VLS_ctx.emailConfirming),
        }));
        const __VLS_241 = __VLS_240({
            ...{ 'onClick': {} },
            type: "primary",
            loading: (__VLS_ctx.emailConfirming),
        }, ...__VLS_functionalComponentArgsRest(__VLS_240));
        let __VLS_244;
        const __VLS_245 = ({ click: {} },
            { onClick: (__VLS_ctx.handleEmailDialogConfirm) });
        const { default: __VLS_246 } = __VLS_242.slots;
        // @ts-ignore
        [emailChangeRemaining, emailConfirming, handleEmailDialogConfirm,];
        var __VLS_242;
        var __VLS_243;
    }
    else {
        let __VLS_247;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_248 = __VLS_asFunctionalComponent1(__VLS_247, new __VLS_247({
            type: "info",
            disabled: true,
        }));
        const __VLS_249 = __VLS_248({
            type: "info",
            disabled: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_248));
        const { default: __VLS_252 } = __VLS_250.slots;
        // @ts-ignore
        [];
        var __VLS_250;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_184;
// @ts-ignore
var __VLS_27 = __VLS_26, __VLS_198 = __VLS_197;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
