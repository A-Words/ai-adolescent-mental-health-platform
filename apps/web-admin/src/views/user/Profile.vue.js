/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { getUserInfo, updateUserInfo } from '@/api/user';
import request from '@/api/user'; // For upload
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
const loading = ref(false);
const userForm = ref({
    username: '',
    nickname: '',
    sex: 0,
    birthday: '',
    phone: '',
    email: '',
    signature: '',
    headPath: ''
});
const avatarFile = ref(null);
const avatarPreview = ref('');
const handleAvatarChange = (uploadFile) => {
    if (uploadFile.raw) {
        if (!beforeAvatarUpload(uploadFile.raw))
            return;
        avatarFile.value = uploadFile.raw;
        // Create local preview
        avatarPreview.value = URL.createObjectURL(uploadFile.raw);
    }
};
const beforeAvatarUpload = (rawFile) => {
    if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
        ElMessage.error('Avatar picture must be JPG or PNG format!');
        return false;
    }
    else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('Avatar picture size can not exceed 2MB!');
        return false;
    }
    return true;
};
const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'avatar');
    return request.post('/common/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
const fetchUserInfo = async () => {
    loading.value = true;
    try {
        const res = await getUserInfo();
        if (res.code === 200) {
            userForm.value = res.data;
        }
    }
    catch (error) {
        ElMessage.error('获取用户信息失败');
    }
    finally {
        loading.value = false;
    }
};
const handleUpdate = async () => {
    loading.value = true;
    try {
        if (avatarFile.value) {
            const res = await uploadAvatar(avatarFile.value);
            if (res.code === 200) {
                userForm.value.headPath = res.data;
            }
            else {
                throw new Error(res.message || '头像上传失败');
            }
        }
        const res = await updateUserInfo(userForm.value);
        if (res.code === 200) {
            ElMessage.success('更新成功');
            // 更新本地存储的用户信息（如果需要）
            localStorage.setItem('user', JSON.stringify(res.data));
            avatarFile.value = null; // Reset
            avatarPreview.value = '';
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (error) {
        ElMessage.error(error.message || '更新失败');
    }
    finally {
        loading.value = false;
    }
};
onMounted(() => {
    fetchUserInfo();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
/** @type {__VLS_StyleScopedClasses['el-upload']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "profile-container" },
});
/** @type {__VLS_StyleScopedClasses['profile-container']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "profile-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "profile-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['profile-card']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
{
    const { header: __VLS_6 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
let __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    model: (__VLS_ctx.userForm),
    labelWidth: "100px",
}));
const __VLS_9 = __VLS_8({
    model: (__VLS_ctx.userForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_12 } = __VLS_10.slots;
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    label: "头像",
}));
const __VLS_15 = __VLS_14({
    label: "头像",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
const { default: __VLS_18 } = __VLS_16.slots;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    ...{ class: "avatar-uploader" },
    action: "#",
    showFileList: (false),
    onChange: (__VLS_ctx.handleAvatarChange),
    beforeUpload: (__VLS_ctx.beforeAvatarUpload),
    autoUpload: (false),
}));
const __VLS_21 = __VLS_20({
    ...{ class: "avatar-uploader" },
    action: "#",
    showFileList: (false),
    onChange: (__VLS_ctx.handleAvatarChange),
    beforeUpload: (__VLS_ctx.beforeAvatarUpload),
    autoUpload: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
const { default: __VLS_24 } = __VLS_22.slots;
if (__VLS_ctx.avatarPreview || __VLS_ctx.userForm.headPath) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.avatarPreview || __VLS_ctx.userForm.headPath),
        ...{ class: "avatar" },
    });
    /** @type {__VLS_StyleScopedClasses['avatar']} */ ;
}
else {
    let __VLS_25;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        ...{ class: "avatar-uploader-icon" },
    }));
    const __VLS_27 = __VLS_26({
        ...{ class: "avatar-uploader-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    /** @type {__VLS_StyleScopedClasses['avatar-uploader-icon']} */ ;
    const { default: __VLS_30 } = __VLS_28.slots;
    let __VLS_31;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({}));
    const __VLS_33 = __VLS_32({}, ...__VLS_functionalComponentArgsRest(__VLS_32));
    // @ts-ignore
    [userForm, userForm, userForm, vLoading, loading, handleAvatarChange, beforeAvatarUpload, avatarPreview, avatarPreview,];
    var __VLS_28;
}
// @ts-ignore
[];
var __VLS_22;
// @ts-ignore
[];
var __VLS_16;
let __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
    label: "用户名",
}));
const __VLS_38 = __VLS_37({
    label: "用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const { default: __VLS_41 } = __VLS_39.slots;
let __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    modelValue: (__VLS_ctx.userForm.username),
    disabled: true,
}));
const __VLS_44 = __VLS_43({
    modelValue: (__VLS_ctx.userForm.username),
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
// @ts-ignore
[userForm,];
var __VLS_39;
let __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    label: "昵称",
}));
const __VLS_49 = __VLS_48({
    label: "昵称",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
const { default: __VLS_52 } = __VLS_50.slots;
let __VLS_53;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
    modelValue: (__VLS_ctx.userForm.nickname),
}));
const __VLS_55 = __VLS_54({
    modelValue: (__VLS_ctx.userForm.nickname),
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
// @ts-ignore
[userForm,];
var __VLS_50;
let __VLS_58;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
    label: "性别",
}));
const __VLS_60 = __VLS_59({
    label: "性别",
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
const { default: __VLS_63 } = __VLS_61.slots;
let __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    modelValue: (__VLS_ctx.userForm.sex),
}));
const __VLS_66 = __VLS_65({
    modelValue: (__VLS_ctx.userForm.sex),
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const { default: __VLS_69 } = __VLS_67.slots;
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    label: (1),
}));
const __VLS_72 = __VLS_71({
    label: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const { default: __VLS_75 } = __VLS_73.slots;
// @ts-ignore
[userForm,];
var __VLS_73;
let __VLS_76;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
    label: (2),
}));
const __VLS_78 = __VLS_77({
    label: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const { default: __VLS_81 } = __VLS_79.slots;
// @ts-ignore
[];
var __VLS_79;
let __VLS_82;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
    label: (0),
}));
const __VLS_84 = __VLS_83({
    label: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
const { default: __VLS_87 } = __VLS_85.slots;
// @ts-ignore
[];
var __VLS_85;
// @ts-ignore
[];
var __VLS_67;
// @ts-ignore
[];
var __VLS_61;
let __VLS_88;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
    label: "出生日期",
}));
const __VLS_90 = __VLS_89({
    label: "出生日期",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
const { default: __VLS_93 } = __VLS_91.slots;
let __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker | typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
    modelValue: (__VLS_ctx.userForm.birthday),
    type: "date",
    placeholder: "选择日期",
    valueFormat: "YYYY-MM-DD",
}));
const __VLS_96 = __VLS_95({
    modelValue: (__VLS_ctx.userForm.birthday),
    type: "date",
    placeholder: "选择日期",
    valueFormat: "YYYY-MM-DD",
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
// @ts-ignore
[userForm,];
var __VLS_91;
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    label: "手机号",
}));
const __VLS_101 = __VLS_100({
    label: "手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
const { default: __VLS_104 } = __VLS_102.slots;
let __VLS_105;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    modelValue: (__VLS_ctx.userForm.phone),
}));
const __VLS_107 = __VLS_106({
    modelValue: (__VLS_ctx.userForm.phone),
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
// @ts-ignore
[userForm,];
var __VLS_102;
let __VLS_110;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
    label: "邮箱",
}));
const __VLS_112 = __VLS_111({
    label: "邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
const { default: __VLS_115 } = __VLS_113.slots;
let __VLS_116;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.userForm.email),
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.userForm.email),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
// @ts-ignore
[userForm,];
var __VLS_113;
let __VLS_121;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
    label: "个性签名",
}));
const __VLS_123 = __VLS_122({
    label: "个性签名",
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
const { default: __VLS_126 } = __VLS_124.slots;
let __VLS_127;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
    type: "textarea",
    modelValue: (__VLS_ctx.userForm.signature),
}));
const __VLS_129 = __VLS_128({
    type: "textarea",
    modelValue: (__VLS_ctx.userForm.signature),
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
// @ts-ignore
[userForm,];
var __VLS_124;
let __VLS_132;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({}));
const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
const { default: __VLS_137 } = __VLS_135.slots;
let __VLS_138;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_140 = __VLS_139({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
let __VLS_143;
const __VLS_144 = ({ click: {} },
    { onClick: (__VLS_ctx.handleUpdate) });
const { default: __VLS_145 } = __VLS_141.slots;
// @ts-ignore
[handleUpdate,];
var __VLS_141;
var __VLS_142;
// @ts-ignore
[];
var __VLS_135;
// @ts-ignore
[];
var __VLS_10;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
