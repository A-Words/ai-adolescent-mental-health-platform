/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { User, InfoFilled, Plus } from '@element-plus/icons-vue';
import request from '@/utils/request';
// 上传图片到 OSS
const uploadImageToOss = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const res = await request.post('/api/common/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.code === 200) {
            return res.data;
        }
        return null;
    }
    catch (e) {
        return null;
    }
};
const activeTab = ref('basic');
const saving = ref(false);
const auditLoading = ref(false);
const token = ref(localStorage.getItem('token') || '');
const psychologistId = ref(null);
const currentPrice = ref('0');
const offlinePrice = ref('0');
const basicForm = reactive({
    headPath: '',
    realName: '',
    sex: 1,
    introduction: '',
    offlineRegion: '',
    offlineAddress: '',
    languages: []
});
const qualificationForm = reactive({
    yearsExperience: 0,
    fieldIds: [],
    qualificationIds: [],
    educationBackground: '',
    trainingExperience: ''
});
const serviceForm = reactive({
    services: [
        { serviceType: 'text', price: 100, description: '文字+图片咨询，方便快捷', status: 1 },
        { serviceType: 'video', price: 300, description: '视频通话咨询，实时沟通', status: 1 },
        { serviceType: 'voice', price: 200, description: '语音通话咨询，保护隐私', status: 1 },
        { serviceType: 'offline', price: 500, description: '线下面询，面对面沟通', status: 0 }
    ]
});
const allFields = ref([]);
const allQualifications = ref([]);
const auditRecords = ref([]);
// 审核弹窗相关
const auditDialogVisible = ref(false);
const submitting = ref(false);
const auditForm = reactive({
    reason: '',
    proofFiles: []
});
// 价格修改弹窗相关
const priceDialogVisible = ref(false);
const priceSubmitting = ref(false);
const priceForm = reactive({
    priceType: 'online', // 'online' 或 'offline'
    newPrice: 0,
    reason: '',
    proofFiles: []
});
const serviceTypeMap = {
    text: '图文咨询',
    video: '视频咨询',
    voice: '语音咨询',
    offline: '线下面询'
};
const getServiceTypeName = (type) => serviceTypeMap[type] || type;
const formatDateTime = (dateStr) => {
    if (!dateStr)
        return '-';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const getAuditStatusType = (status) => {
    const types = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' };
    return types[status] || 'info';
};
const getAuditStatusName = (status) => {
    const names = { 0: '待审核', 1: '审核中', 2: '已通过', 3: '已拒绝' };
    return names[status] || '未知';
};
// 头像上传
const handleAvatarSuccess = (res) => {
    if (res.code === 200) {
        basicForm.headPath = res.data;
        ElMessage.success('头像上传成功');
    }
    else {
        ElMessage.error(res.message || '上传失败');
    }
};
const beforeAvatarUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isImage) {
        ElMessage.error('只能上传图片文件');
        return false;
    }
    if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB');
        return false;
    }
    return true;
};
// 加载所有数据
const loadAllData = async () => {
    try {
        // 获取心理咨询师信息
        const res = await request({
            url: '/api/psychologist/admin/profile',
            method: 'get'
        });
        if (res.code === 200 && res.data) {
            const data = res.data;
            psychologistId.value = data.id;
            // 基本信息
            basicForm.headPath = data.headPath || '';
            basicForm.realName = data.realName || '';
            basicForm.sex = data.sex || 1;
            basicForm.introduction = data.introduction || '';
            basicForm.offlineRegion = data.offlineRegion || '';
            basicForm.offlineAddress = data.offlineAddress || '';
            basicForm.languages = data.languages ? data.languages.split(',') : [];
            currentPrice.value = data.consultationPrice || '0';
            offlinePrice.value = data.offlinePrice || '0';
            // 资质信息
            qualificationForm.yearsExperience = data.yearsExperience || 0;
            qualificationForm.educationBackground = data.educationBackground || '';
            qualificationForm.trainingExperience = data.trainingExperience || '';
            // 加载擅长领域列表
            await loadFields();
            // 加载资质列表
            await loadQualifications();
            // 设置已选中的领域和资质
            if (data.fields && data.fields.length > 0) {
                qualificationForm.fieldIds = data.fields.map((f) => f.fieldId || f.id);
            }
            if (data.qualifications && data.qualifications.length > 0) {
                qualificationForm.qualificationIds = data.qualifications.map((q) => q.qualificationId || q.id);
            }
            // 加载服务信息
            await loadServices();
            // 加载审核记录
            await loadAuditRecords();
        }
    }
    catch (e) {
        console.error('加载数据失败', e);
    }
};
// 加载擅长领域列表
const loadFields = async () => {
    try {
        const res = await request({
            url: '/api/psychologist/admin/fields/options',
            method: 'get'
        });
        if (res.code === 200) {
            allFields.value = res.data || [];
        }
    }
    catch (e) {
        console.error('加载领域列表失败', e);
    }
};
// 加载资质列表
const loadQualifications = async () => {
    try {
        const res = await request({
            url: '/api/psychologist/admin/qualifications/options',
            method: 'get'
        });
        if (res.code === 200) {
            allQualifications.value = res.data || [];
        }
    }
    catch (e) {
        console.error('加载资质列表失败', e);
    }
};
// 加载服务信息
const loadServices = async () => {
    if (!psychologistId.value)
        return;
    try {
        const res = await request({
            url: `/api/psychologist/admin/${psychologistId.value}/services`,
            method: 'get'
        });
        if (res.code === 200 && res.data && res.data.length > 0) {
            res.data.forEach((service) => {
                // 忽略大小写匹配
                const existing = serviceForm.services.find(s => s.serviceType.toUpperCase() === service.serviceType.toUpperCase());
                if (existing) {
                    existing.price = service.price;
                    existing.description = service.description || '';
                    existing.status = service.status;
                }
            });
        }
    }
    catch (e) {
        console.error('加载服务信息失败', e);
    }
};
// 加载审核记录
const loadAuditRecords = async () => {
    if (!psychologistId.value)
        return;
    auditLoading.value = true;
    try {
        const res = await request({
            url: '/api/psychologist/admin/profile/audit/list',
            method: 'get',
            params: { page: 1, size: 50 }
        });
        if (res.code === 200) {
            auditRecords.value = res.data?.records || [];
        }
    }
    catch (e) {
        console.error('加载审核记录失败', e);
    }
    finally {
        auditLoading.value = false;
    }
};
// 保存基本信息
const saveBasic = async () => {
    saving.value = true;
    try {
        const data = {
            headPath: basicForm.headPath,
            realName: basicForm.realName,
            sex: basicForm.sex,
            introduction: basicForm.introduction,
            offlineRegion: basicForm.offlineRegion,
            offlineAddress: basicForm.offlineAddress,
            languages: basicForm.languages.join(',')
        };
        const res = await request({
            url: '/api/psychologist/admin/profile',
            method: 'put',
            data
        });
        if (res.code === 200) {
            ElMessage.success('保存成功');
        }
        else {
            ElMessage.error(res.message || '保存失败');
        }
    }
    catch (e) {
        ElMessage.error(e.message || '保存失败');
    }
    finally {
        saving.value = false;
    }
};
// 打开审核提交弹窗
const openAuditDialog = () => {
    auditForm.reason = '';
    auditForm.proofFiles = [];
    auditDialogVisible.value = true;
};
// 处理证明材料文件变化
const handleProofChange = (file, fileList) => {
    const isImage = file.raw?.type.startsWith('image/');
    const isLt2M = file.raw?.size / 1024 / 1024 < 2;
    if (!isImage) {
        ElMessage.error('只能上传图片文件');
        fileList.pop();
        return;
    }
    if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB');
        fileList.pop();
        return;
    }
    auditForm.proofFiles = fileList;
};
// 移除证明材料
const handleProofRemove = (file, fileList) => {
    auditForm.proofFiles = fileList;
};
// 提交审核
const submitAudit = async () => {
    if (!auditForm.reason.trim()) {
        ElMessage.warning('请填写变更说明');
        return;
    }
    submitting.value = true;
    try {
        // 上传证明材料
        let proofUrls = [];
        if (auditForm.proofFiles.length > 0) {
            ElMessage.info('正在上传证明材料...');
            for (const file of auditForm.proofFiles) {
                const url = await uploadImageToOss(file.raw);
                if (url) {
                    proofUrls.push(url);
                }
            }
            if (proofUrls.length === 0 && auditForm.proofFiles.length > 0) {
                ElMessage.warning('证明材料上传失败，将继续提交审核（无证明材料）');
            }
        }
        // 先保存基本信息（咨询经验年限、教育背景等无需审核的字段）
        const basicRes = await request({
            url: '/api/psychologist/admin/profile',
            method: 'put',
            data: {
                yearsExperience: qualificationForm.yearsExperience,
                educationBackground: qualificationForm.educationBackground,
                trainingExperience: qualificationForm.trainingExperience
            }
        });
        // 提交审核申请
        const auditRes = await request({
            url: '/api/psychologist/admin/profile/audit/apply',
            method: 'post',
            data: {
                fieldIds: qualificationForm.fieldIds,
                qualificationIds: qualificationForm.qualificationIds,
                reason: auditForm.reason,
                proofUrls: JSON.stringify(proofUrls)
            }
        });
        if (auditRes.code === 200) {
            ElMessage.success('已提交审核，请等待管理员处理');
            auditDialogVisible.value = false;
            await loadAuditRecords();
        }
        else {
            ElMessage.error(auditRes.message || '提交失败');
        }
    }
    catch (e) {
        ElMessage.error(e.message || '提交失败');
    }
    finally {
        submitting.value = false;
    }
};
// 保存单个服务（仅启用/禁用，无需审核）
const saveService = async (service) => {
    try {
        const res = await request({
            url: `/api/psychologist/admin/${psychologistId.value}/services/${service.serviceType}`,
            method: 'post',
            data: {
                status: service.status
            }
        });
        if (res.code === 200) {
            ElMessage.success('保存成功');
        }
        else {
            ElMessage.error(res.message || '保存失败');
        }
    }
    catch (e) {
        ElMessage.error(e.message || '保存失败');
    }
};
// 启用/禁用服务
const handleServiceToggle = async (service) => {
    await saveService(service);
};
// 打开价格修改弹窗
const openPriceDialog = (priceType) => {
    priceForm.priceType = priceType;
    if (priceType === 'offline') {
        priceForm.newPrice = parseFloat(offlinePrice.value) || 0;
    }
    else {
        priceForm.newPrice = parseFloat(currentPrice.value) || 0;
    }
    priceForm.reason = '';
    priceForm.proofFiles = [];
    priceDialogVisible.value = true;
};
// 价格证明材料文件变化
const handlePriceProofChange = (file, fileList) => {
    const isImage = file.raw?.type.startsWith('image/');
    const isLt2M = file.raw?.size / 1024 / 1024 < 2;
    if (!isImage) {
        ElMessage.error('只能上传图片文件');
        fileList.pop();
        return;
    }
    if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB');
        fileList.pop();
        return;
    }
    priceForm.proofFiles = fileList;
};
// 移除价格证明材料
const handlePriceProofRemove = (file, fileList) => {
    priceForm.proofFiles = fileList;
};
// 提交价格修改审核
const submitPriceChange = async () => {
    if (!priceForm.reason.trim()) {
        ElMessage.warning('请填写修改理由');
        return;
    }
    if (priceForm.newPrice < 0) {
        ElMessage.warning('价格不能为负数');
        return;
    }
    priceSubmitting.value = true;
    try {
        // 上传证明材料
        let proofUrls = [];
        if (priceForm.proofFiles.length > 0) {
            ElMessage.info('正在上传证明材料...');
            for (const file of priceForm.proofFiles) {
                const url = await uploadImageToOss(file.raw);
                if (url) {
                    proofUrls.push(url);
                }
            }
        }
        // 根据价格类型选择接口
        const apiUrl = priceForm.priceType === 'offline'
            ? '/api/psychologist/admin/profile/offline-price/audit/apply'
            : '/api/psychologist/admin/profile/price/audit/apply';
        // 提交价格修改审核
        const res = await request({
            url: apiUrl,
            method: 'post',
            data: {
                newPrice: priceForm.newPrice,
                reason: priceForm.reason,
                proofUrls: JSON.stringify(proofUrls)
            }
        });
        if (res.code === 200) {
            ElMessage.success('已提交价格修改审核，请等待管理员处理');
            priceDialogVisible.value = false;
            // 刷新审核记录
            await loadAuditRecords();
            // 切换到审核记录tab
            activeTab.value = 'audit';
        }
        else {
            ElMessage.error(res.message || '提交失败');
        }
    }
    catch (e) {
        ElMessage.error(e.message || '提交失败');
    }
    finally {
        priceSubmitting.value = false;
    }
};
// Tab 切换时加载审核记录
const handleTabChange = (tab) => {
    if (tab === 'audit' && psychologistId.value) {
        loadAuditRecords();
    }
};
onMounted(() => {
    loadAllData();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['price-card']} */ ;
/** @type {__VLS_StyleScopedClasses['price-card']} */ ;
/** @type {__VLS_StyleScopedClasses['price-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psychologist-profile-container" },
});
/** @type {__VLS_StyleScopedClasses['psychologist-profile-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeTab),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    label: "基本信息",
    name: "basic",
}));
const __VLS_8 = __VLS_7({
    label: "基本信息",
    name: "basic",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-content" },
});
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    model: (__VLS_ctx.basicForm),
    labelWidth: "120px",
    ...{ class: "profile-form" },
}));
const __VLS_14 = __VLS_13({
    model: (__VLS_ctx.basicForm),
    labelWidth: "120px",
    ...{ class: "profile-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
const { default: __VLS_17 } = __VLS_15.slots;
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    label: "头像",
}));
const __VLS_20 = __VLS_19({
    label: "头像",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const { default: __VLS_23 } = __VLS_21.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "avatar-upload" },
});
/** @type {__VLS_StyleScopedClasses['avatar-upload']} */ ;
let __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
elAvatar;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    size: (100),
    src: (__VLS_ctx.basicForm.headPath),
    ...{ class: "avatar-preview" },
}));
const __VLS_26 = __VLS_25({
    size: (100),
    src: (__VLS_ctx.basicForm.headPath),
    ...{ class: "avatar-preview" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
/** @type {__VLS_StyleScopedClasses['avatar-preview']} */ ;
const { default: __VLS_29 } = __VLS_27.slots;
let __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    size: (50),
}));
const __VLS_32 = __VLS_31({
    size: (50),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
const { default: __VLS_35 } = __VLS_33.slots;
let __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.User} */
User;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
// @ts-ignore
[activeTab, basicForm, basicForm,];
var __VLS_33;
// @ts-ignore
[];
var __VLS_27;
let __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    action: "/api/psychologist-apply/upload",
    headers: ({ token: __VLS_ctx.token }),
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleAvatarSuccess),
    beforeUpload: (__VLS_ctx.beforeAvatarUpload),
    accept: "image/*",
}));
const __VLS_43 = __VLS_42({
    action: "/api/psychologist-apply/upload",
    headers: ({ token: __VLS_ctx.token }),
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleAvatarSuccess),
    beforeUpload: (__VLS_ctx.beforeAvatarUpload),
    accept: "image/*",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
const { default: __VLS_46 } = __VLS_44.slots;
let __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    size: "small",
    ...{ class: "upload-btn" },
}));
const __VLS_49 = __VLS_48({
    size: "small",
    ...{ class: "upload-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
/** @type {__VLS_StyleScopedClasses['upload-btn']} */ ;
const { default: __VLS_52 } = __VLS_50.slots;
// @ts-ignore
[token, handleAvatarSuccess, beforeAvatarUpload,];
var __VLS_50;
// @ts-ignore
[];
var __VLS_44;
// @ts-ignore
[];
var __VLS_21;
let __VLS_53;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
    label: "真实姓名",
}));
const __VLS_55 = __VLS_54({
    label: "真实姓名",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
const { default: __VLS_58 } = __VLS_56.slots;
let __VLS_59;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
    modelValue: (__VLS_ctx.basicForm.realName),
    ...{ class: true },
}));
const __VLS_61 = __VLS_60({
    modelValue: (__VLS_ctx.basicForm.realName),
    ...{ class: true },
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "form-tip" },
});
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
// @ts-ignore
[basicForm,];
var __VLS_56;
let __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    label: "性别",
}));
const __VLS_66 = __VLS_65({
    label: "性别",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const { default: __VLS_69 } = __VLS_67.slots;
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    modelValue: (__VLS_ctx.basicForm.sex),
}));
const __VLS_72 = __VLS_71({
    modelValue: (__VLS_ctx.basicForm.sex),
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const { default: __VLS_75 } = __VLS_73.slots;
let __VLS_76;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
    label: (1),
}));
const __VLS_78 = __VLS_77({
    label: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const { default: __VLS_81 } = __VLS_79.slots;
// @ts-ignore
[basicForm,];
var __VLS_79;
let __VLS_82;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
    label: (2),
}));
const __VLS_84 = __VLS_83({
    label: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
const { default: __VLS_87 } = __VLS_85.slots;
// @ts-ignore
[];
var __VLS_85;
// @ts-ignore
[];
var __VLS_73;
// @ts-ignore
[];
var __VLS_67;
let __VLS_88;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
    label: "个人简介",
}));
const __VLS_90 = __VLS_89({
    label: "个人简介",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
const { default: __VLS_93 } = __VLS_91.slots;
let __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
    modelValue: (__VLS_ctx.basicForm.introduction),
    type: "textarea",
    rows: (4),
    ...{ class: true },
}));
const __VLS_96 = __VLS_95({
    modelValue: (__VLS_ctx.basicForm.introduction),
    type: "textarea",
    rows: (4),
    ...{ class: true },
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
// @ts-ignore
[basicForm,];
var __VLS_91;
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    label: "线下咨询地区",
}));
const __VLS_101 = __VLS_100({
    label: "线下咨询地区",
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
const { default: __VLS_104 } = __VLS_102.slots;
let __VLS_105;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    modelValue: (__VLS_ctx.basicForm.offlineRegion),
    placeholder: "如：北京市朝阳区",
    ...{ class: true },
}));
const __VLS_107 = __VLS_106({
    modelValue: (__VLS_ctx.basicForm.offlineRegion),
    placeholder: "如：北京市朝阳区",
    ...{ class: true },
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
// @ts-ignore
[basicForm,];
var __VLS_102;
let __VLS_110;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
    label: "详细地址",
}));
const __VLS_112 = __VLS_111({
    label: "详细地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
const { default: __VLS_115 } = __VLS_113.slots;
let __VLS_116;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.basicForm.offlineAddress),
    ...{ class: true },
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.basicForm.offlineAddress),
    ...{ class: true },
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
// @ts-ignore
[basicForm,];
var __VLS_113;
let __VLS_121;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
    label: "语言能力",
}));
const __VLS_123 = __VLS_122({
    label: "语言能力",
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
const { default: __VLS_126 } = __VLS_124.slots;
let __VLS_127;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
    modelValue: (__VLS_ctx.basicForm.languages),
    multiple: true,
    ...{ class: true },
}));
const __VLS_129 = __VLS_128({
    modelValue: (__VLS_ctx.basicForm.languages),
    multiple: true,
    ...{ class: true },
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
const { default: __VLS_132 } = __VLS_130.slots;
let __VLS_133;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
    label: "普通话",
    value: "普通话",
}));
const __VLS_135 = __VLS_134({
    label: "普通话",
    value: "普通话",
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
let __VLS_138;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
    label: "英语",
    value: "英语",
}));
const __VLS_140 = __VLS_139({
    label: "英语",
    value: "英语",
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
let __VLS_143;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
    label: "粤语",
    value: "粤语",
}));
const __VLS_145 = __VLS_144({
    label: "粤语",
    value: "粤语",
}, ...__VLS_functionalComponentArgsRest(__VLS_144));
let __VLS_148;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
    label: "上海话",
    value: "上海话",
}));
const __VLS_150 = __VLS_149({
    label: "上海话",
    value: "上海话",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
// @ts-ignore
[basicForm,];
var __VLS_130;
// @ts-ignore
[];
var __VLS_124;
let __VLS_153;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153({}));
const __VLS_155 = __VLS_154({}, ...__VLS_functionalComponentArgsRest(__VLS_154));
const { default: __VLS_158 } = __VLS_156.slots;
let __VLS_159;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_160 = __VLS_asFunctionalComponent1(__VLS_159, new __VLS_159({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}));
const __VLS_161 = __VLS_160({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_160));
let __VLS_164;
const __VLS_165 = ({ click: {} },
    { onClick: (__VLS_ctx.saveBasic) });
const { default: __VLS_166 } = __VLS_162.slots;
// @ts-ignore
[saving, saveBasic,];
var __VLS_162;
var __VLS_163;
// @ts-ignore
[];
var __VLS_156;
// @ts-ignore
[];
var __VLS_15;
// @ts-ignore
[];
var __VLS_9;
let __VLS_167;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_168 = __VLS_asFunctionalComponent1(__VLS_167, new __VLS_167({
    label: "资质与擅长",
    name: "qualification",
}));
const __VLS_169 = __VLS_168({
    label: "资质与擅长",
    name: "qualification",
}, ...__VLS_functionalComponentArgsRest(__VLS_168));
const { default: __VLS_172 } = __VLS_170.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-content" },
});
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
let __VLS_173;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
    labelWidth: "120px",
    ...{ class: "profile-form" },
}));
const __VLS_175 = __VLS_174({
    labelWidth: "120px",
    ...{ class: "profile-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
/** @type {__VLS_StyleScopedClasses['profile-form']} */ ;
const { default: __VLS_178 } = __VLS_176.slots;
let __VLS_179;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_180 = __VLS_asFunctionalComponent1(__VLS_179, new __VLS_179({
    label: "咨询经验年限",
}));
const __VLS_181 = __VLS_180({
    label: "咨询经验年限",
}, ...__VLS_functionalComponentArgsRest(__VLS_180));
const { default: __VLS_184 } = __VLS_182.slots;
let __VLS_185;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
    modelValue: (__VLS_ctx.qualificationForm.yearsExperience),
    min: (0),
    max: (50),
    ...{ class: true },
}));
const __VLS_187 = __VLS_186({
    modelValue: (__VLS_ctx.qualificationForm.yearsExperience),
    min: (0),
    max: (50),
    ...{ class: true },
}, ...__VLS_functionalComponentArgsRest(__VLS_186));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "form-tip" },
});
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
// @ts-ignore
[qualificationForm,];
var __VLS_182;
let __VLS_190;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_191 = __VLS_asFunctionalComponent1(__VLS_190, new __VLS_190({
    label: "擅长领域",
}));
const __VLS_192 = __VLS_191({
    label: "擅长领域",
}, ...__VLS_functionalComponentArgsRest(__VLS_191));
const { default: __VLS_195 } = __VLS_193.slots;
let __VLS_196;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent1(__VLS_196, new __VLS_196({
    modelValue: (__VLS_ctx.qualificationForm.fieldIds),
    multiple: true,
    ...{ class: true },
}));
const __VLS_198 = __VLS_197({
    modelValue: (__VLS_ctx.qualificationForm.fieldIds),
    multiple: true,
    ...{ class: true },
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
const { default: __VLS_201 } = __VLS_199.slots;
for (const [field] of __VLS_vFor((__VLS_ctx.allFields))) {
    let __VLS_202;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent1(__VLS_202, new __VLS_202({
        key: (field.id),
        label: (field.name),
        value: (field.id),
    }));
    const __VLS_204 = __VLS_203({
        key: (field.id),
        label: (field.name),
        value: (field.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    // @ts-ignore
    [qualificationForm, allFields,];
}
// @ts-ignore
[];
var __VLS_199;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "form-tip" },
});
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
// @ts-ignore
[];
var __VLS_193;
let __VLS_207;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_208 = __VLS_asFunctionalComponent1(__VLS_207, new __VLS_207({
    label: "资质证书",
}));
const __VLS_209 = __VLS_208({
    label: "资质证书",
}, ...__VLS_functionalComponentArgsRest(__VLS_208));
const { default: __VLS_212 } = __VLS_210.slots;
let __VLS_213;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent1(__VLS_213, new __VLS_213({
    modelValue: (__VLS_ctx.qualificationForm.qualificationIds),
    multiple: true,
    ...{ class: true },
}));
const __VLS_215 = __VLS_214({
    modelValue: (__VLS_ctx.qualificationForm.qualificationIds),
    multiple: true,
    ...{ class: true },
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
const { default: __VLS_218 } = __VLS_216.slots;
for (const [q] of __VLS_vFor((__VLS_ctx.allQualifications))) {
    let __VLS_219;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_220 = __VLS_asFunctionalComponent1(__VLS_219, new __VLS_219({
        key: (q.id),
        label: (q.name),
        value: (q.id),
    }));
    const __VLS_221 = __VLS_220({
        key: (q.id),
        label: (q.name),
        value: (q.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_220));
    // @ts-ignore
    [qualificationForm, allQualifications,];
}
// @ts-ignore
[];
var __VLS_216;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "form-tip" },
});
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
// @ts-ignore
[];
var __VLS_210;
let __VLS_224;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent1(__VLS_224, new __VLS_224({
    label: "教育背景",
}));
const __VLS_226 = __VLS_225({
    label: "教育背景",
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
const { default: __VLS_229 } = __VLS_227.slots;
let __VLS_230;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_231 = __VLS_asFunctionalComponent1(__VLS_230, new __VLS_230({
    modelValue: (__VLS_ctx.qualificationForm.educationBackground),
    type: "textarea",
    rows: (3),
    ...{ class: true },
}));
const __VLS_232 = __VLS_231({
    modelValue: (__VLS_ctx.qualificationForm.educationBackground),
    type: "textarea",
    rows: (3),
    ...{ class: true },
}, ...__VLS_functionalComponentArgsRest(__VLS_231));
// @ts-ignore
[qualificationForm,];
var __VLS_227;
let __VLS_235;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_236 = __VLS_asFunctionalComponent1(__VLS_235, new __VLS_235({
    label: "受训经历",
}));
const __VLS_237 = __VLS_236({
    label: "受训经历",
}, ...__VLS_functionalComponentArgsRest(__VLS_236));
const { default: __VLS_240 } = __VLS_238.slots;
let __VLS_241;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_242 = __VLS_asFunctionalComponent1(__VLS_241, new __VLS_241({
    modelValue: (__VLS_ctx.qualificationForm.trainingExperience),
    type: "textarea",
    rows: (3),
    ...{ class: true },
}));
const __VLS_243 = __VLS_242({
    modelValue: (__VLS_ctx.qualificationForm.trainingExperience),
    type: "textarea",
    rows: (3),
    ...{ class: true },
}, ...__VLS_functionalComponentArgsRest(__VLS_242));
// @ts-ignore
[qualificationForm,];
var __VLS_238;
let __VLS_246;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_247 = __VLS_asFunctionalComponent1(__VLS_246, new __VLS_246({}));
const __VLS_248 = __VLS_247({}, ...__VLS_functionalComponentArgsRest(__VLS_247));
const { default: __VLS_251 } = __VLS_249.slots;
let __VLS_252;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent1(__VLS_252, new __VLS_252({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}));
const __VLS_254 = __VLS_253({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
let __VLS_257;
const __VLS_258 = ({ click: {} },
    { onClick: (__VLS_ctx.openAuditDialog) });
const { default: __VLS_259 } = __VLS_255.slots;
// @ts-ignore
[saving, openAuditDialog,];
var __VLS_255;
var __VLS_256;
// @ts-ignore
[];
var __VLS_249;
// @ts-ignore
[];
var __VLS_176;
// @ts-ignore
[];
var __VLS_170;
let __VLS_260;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent1(__VLS_260, new __VLS_260({
    label: "服务与价格",
    name: "service",
}));
const __VLS_262 = __VLS_261({
    label: "服务与价格",
    name: "service",
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
const { default: __VLS_265 } = __VLS_263.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-content" },
});
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "price-section" },
});
/** @type {__VLS_StyleScopedClasses['price-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "price-card online" },
});
/** @type {__VLS_StyleScopedClasses['price-card']} */ ;
/** @type {__VLS_StyleScopedClasses['online']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "price-card-header" },
});
/** @type {__VLS_StyleScopedClasses['price-card-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "price-card-title" },
});
/** @type {__VLS_StyleScopedClasses['price-card-title']} */ ;
let __VLS_266;
/** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
elTag;
// @ts-ignore
const __VLS_267 = __VLS_asFunctionalComponent1(__VLS_266, new __VLS_266({
    type: "primary",
    size: "small",
}));
const __VLS_268 = __VLS_267({
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_267));
const { default: __VLS_271 } = __VLS_269.slots;
// @ts-ignore
[];
var __VLS_269;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "price-card-body" },
});
/** @type {__VLS_StyleScopedClasses['price-card-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "price-currency" },
});
/** @type {__VLS_StyleScopedClasses['price-currency']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "price-amount" },
});
/** @type {__VLS_StyleScopedClasses['price-amount']} */ ;
(__VLS_ctx.currentPrice);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "price-unit" },
});
/** @type {__VLS_StyleScopedClasses['price-unit']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "price-card-footer" },
});
/** @type {__VLS_StyleScopedClasses['price-card-footer']} */ ;
let __VLS_272;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent1(__VLS_272, new __VLS_272({
    ...{ 'onClick': {} },
    type: "primary",
    plain: true,
    size: "small",
}));
const __VLS_274 = __VLS_273({
    ...{ 'onClick': {} },
    type: "primary",
    plain: true,
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
let __VLS_277;
const __VLS_278 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.openPriceDialog('online');
            // @ts-ignore
            [currentPrice, openPriceDialog,];
        } });
const { default: __VLS_279 } = __VLS_275.slots;
// @ts-ignore
[];
var __VLS_275;
var __VLS_276;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "price-card offline" },
});
/** @type {__VLS_StyleScopedClasses['price-card']} */ ;
/** @type {__VLS_StyleScopedClasses['offline']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "price-card-header" },
});
/** @type {__VLS_StyleScopedClasses['price-card-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "price-card-title" },
});
/** @type {__VLS_StyleScopedClasses['price-card-title']} */ ;
let __VLS_280;
/** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
elTag;
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent1(__VLS_280, new __VLS_280({
    type: "warning",
    size: "small",
}));
const __VLS_282 = __VLS_281({
    type: "warning",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
const { default: __VLS_285 } = __VLS_283.slots;
// @ts-ignore
[];
var __VLS_283;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "price-card-body" },
});
/** @type {__VLS_StyleScopedClasses['price-card-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "price-currency" },
});
/** @type {__VLS_StyleScopedClasses['price-currency']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "price-amount" },
});
/** @type {__VLS_StyleScopedClasses['price-amount']} */ ;
(__VLS_ctx.offlinePrice);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "price-unit" },
});
/** @type {__VLS_StyleScopedClasses['price-unit']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "price-card-footer" },
});
/** @type {__VLS_StyleScopedClasses['price-card-footer']} */ ;
let __VLS_286;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_287 = __VLS_asFunctionalComponent1(__VLS_286, new __VLS_286({
    ...{ 'onClick': {} },
    type: "primary",
    plain: true,
    size: "small",
}));
const __VLS_288 = __VLS_287({
    ...{ 'onClick': {} },
    type: "primary",
    plain: true,
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_287));
let __VLS_291;
const __VLS_292 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.openPriceDialog('offline');
            // @ts-ignore
            [openPriceDialog, offlinePrice,];
        } });
const { default: __VLS_293 } = __VLS_289.slots;
// @ts-ignore
[];
var __VLS_289;
var __VLS_290;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "service-list" },
});
/** @type {__VLS_StyleScopedClasses['service-list']} */ ;
for (const [service] of __VLS_vFor((__VLS_ctx.serviceForm.services))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (service.serviceType),
        ...{ class: "service-item" },
    });
    /** @type {__VLS_StyleScopedClasses['service-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "service-header" },
    });
    /** @type {__VLS_StyleScopedClasses['service-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "service-info" },
    });
    /** @type {__VLS_StyleScopedClasses['service-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "service-type" },
    });
    /** @type {__VLS_StyleScopedClasses['service-type']} */ ;
    (__VLS_ctx.getServiceTypeName(service.serviceType));
    if (service.serviceType === 'text') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "service-note" },
        });
        /** @type {__VLS_StyleScopedClasses['service-note']} */ ;
    }
    if (service.status === 1) {
        let __VLS_294;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_295 = __VLS_asFunctionalComponent1(__VLS_294, new __VLS_294({
            type: "success",
            size: "small",
        }));
        const __VLS_296 = __VLS_295({
            type: "success",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_295));
        const { default: __VLS_299 } = __VLS_297.slots;
        // @ts-ignore
        [serviceForm, getServiceTypeName,];
        var __VLS_297;
    }
    else {
        let __VLS_300;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_301 = __VLS_asFunctionalComponent1(__VLS_300, new __VLS_300({
            type: "info",
            size: "small",
        }));
        const __VLS_302 = __VLS_301({
            type: "info",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_301));
        const { default: __VLS_305 } = __VLS_303.slots;
        // @ts-ignore
        [];
        var __VLS_303;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "service-action" },
    });
    /** @type {__VLS_StyleScopedClasses['service-action']} */ ;
    let __VLS_306;
    /** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
    elSwitch;
    // @ts-ignore
    const __VLS_307 = __VLS_asFunctionalComponent1(__VLS_306, new __VLS_306({
        ...{ 'onChange': {} },
        modelValue: (service.status),
        activeValue: (1),
        inactiveValue: (0),
        activeText: "启用",
        inactiveText: "禁用",
    }));
    const __VLS_308 = __VLS_307({
        ...{ 'onChange': {} },
        modelValue: (service.status),
        activeValue: (1),
        inactiveValue: (0),
        activeText: "启用",
        inactiveText: "禁用",
    }, ...__VLS_functionalComponentArgsRest(__VLS_307));
    let __VLS_311;
    const __VLS_312 = ({ change: {} },
        { onChange: (...[$event]) => {
                __VLS_ctx.handleServiceToggle(service);
                // @ts-ignore
                [handleServiceToggle,];
            } });
    var __VLS_309;
    var __VLS_310;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "service-tip" },
});
/** @type {__VLS_StyleScopedClasses['service-tip']} */ ;
let __VLS_313;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_314 = __VLS_asFunctionalComponent1(__VLS_313, new __VLS_313({}));
const __VLS_315 = __VLS_314({}, ...__VLS_functionalComponentArgsRest(__VLS_314));
const { default: __VLS_318 } = __VLS_316.slots;
let __VLS_319;
/** @ts-ignore @type {typeof __VLS_components.InfoFilled} */
InfoFilled;
// @ts-ignore
const __VLS_320 = __VLS_asFunctionalComponent1(__VLS_319, new __VLS_319({}));
const __VLS_321 = __VLS_320({}, ...__VLS_functionalComponentArgsRest(__VLS_320));
// @ts-ignore
[];
var __VLS_316;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_263;
let __VLS_324;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent1(__VLS_324, new __VLS_324({
    label: "审核记录",
    name: "audit",
}));
const __VLS_326 = __VLS_325({
    label: "审核记录",
    name: "audit",
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
const { default: __VLS_329 } = __VLS_327.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-content" },
});
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
let __VLS_330;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_331 = __VLS_asFunctionalComponent1(__VLS_330, new __VLS_330({
    data: (__VLS_ctx.auditRecords),
}));
const __VLS_332 = __VLS_331({
    data: (__VLS_ctx.auditRecords),
}, ...__VLS_functionalComponentArgsRest(__VLS_331));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.auditLoading) }, null, null);
const { default: __VLS_335 } = __VLS_333.slots;
let __VLS_336;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_337 = __VLS_asFunctionalComponent1(__VLS_336, new __VLS_336({
    prop: "createTime",
    label: "申请时间",
    width: "180",
}));
const __VLS_338 = __VLS_337({
    prop: "createTime",
    label: "申请时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_337));
const { default: __VLS_341 } = __VLS_339.slots;
{
    const { default: __VLS_342 } = __VLS_339.slots;
    const [{ row }] = __VLS_vSlot(__VLS_342);
    (__VLS_ctx.formatDateTime(row.createTime));
    // @ts-ignore
    [auditRecords, vLoading, auditLoading, formatDateTime,];
}
// @ts-ignore
[];
var __VLS_339;
let __VLS_343;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_344 = __VLS_asFunctionalComponent1(__VLS_343, new __VLS_343({
    prop: "fieldName",
    label: "修改字段",
    width: "150",
}));
const __VLS_345 = __VLS_344({
    prop: "fieldName",
    label: "修改字段",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_344));
let __VLS_348;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_349 = __VLS_asFunctionalComponent1(__VLS_348, new __VLS_348({
    prop: "oldValue",
    label: "原值",
}));
const __VLS_350 = __VLS_349({
    prop: "oldValue",
    label: "原值",
}, ...__VLS_functionalComponentArgsRest(__VLS_349));
let __VLS_353;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_354 = __VLS_asFunctionalComponent1(__VLS_353, new __VLS_353({
    prop: "newValue",
    label: "新值",
}));
const __VLS_355 = __VLS_354({
    prop: "newValue",
    label: "新值",
}, ...__VLS_functionalComponentArgsRest(__VLS_354));
let __VLS_358;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_359 = __VLS_asFunctionalComponent1(__VLS_358, new __VLS_358({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_360 = __VLS_359({
    prop: "status",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_359));
const { default: __VLS_363 } = __VLS_361.slots;
{
    const { default: __VLS_364 } = __VLS_361.slots;
    const [{ row }] = __VLS_vSlot(__VLS_364);
    let __VLS_365;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_366 = __VLS_asFunctionalComponent1(__VLS_365, new __VLS_365({
        type: (__VLS_ctx.getAuditStatusType(row.status)),
        size: "small",
    }));
    const __VLS_367 = __VLS_366({
        type: (__VLS_ctx.getAuditStatusType(row.status)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_366));
    const { default: __VLS_370 } = __VLS_368.slots;
    (__VLS_ctx.getAuditStatusName(row.status));
    // @ts-ignore
    [getAuditStatusType, getAuditStatusName,];
    var __VLS_368;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_361;
let __VLS_371;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_372 = __VLS_asFunctionalComponent1(__VLS_371, new __VLS_371({
    prop: "remark",
    label: "审核备注",
}));
const __VLS_373 = __VLS_372({
    prop: "remark",
    label: "审核备注",
}, ...__VLS_functionalComponentArgsRest(__VLS_372));
// @ts-ignore
[];
var __VLS_333;
if (__VLS_ctx.auditRecords.length === 0 && !__VLS_ctx.auditLoading) {
    let __VLS_376;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_377 = __VLS_asFunctionalComponent1(__VLS_376, new __VLS_376({
        description: "暂无审核记录",
    }));
    const __VLS_378 = __VLS_377({
        description: "暂无审核记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_377));
}
// @ts-ignore
[auditRecords, auditLoading,];
var __VLS_327;
// @ts-ignore
[];
var __VLS_3;
let __VLS_381;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_382 = __VLS_asFunctionalComponent1(__VLS_381, new __VLS_381({
    modelValue: (__VLS_ctx.auditDialogVisible),
    title: "提交资料变更审核",
    width: "600px",
    closeOnClickModal: (false),
}));
const __VLS_383 = __VLS_382({
    modelValue: (__VLS_ctx.auditDialogVisible),
    title: "提交资料变更审核",
    width: "600px",
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_382));
const { default: __VLS_386 } = __VLS_384.slots;
let __VLS_387;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_388 = __VLS_asFunctionalComponent1(__VLS_387, new __VLS_387({
    labelWidth: "100px",
}));
const __VLS_389 = __VLS_388({
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_388));
const { default: __VLS_392 } = __VLS_390.slots;
let __VLS_393;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_394 = __VLS_asFunctionalComponent1(__VLS_393, new __VLS_393({
    label: "变更说明",
}));
const __VLS_395 = __VLS_394({
    label: "变更说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_394));
const { default: __VLS_398 } = __VLS_396.slots;
let __VLS_399;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_400 = __VLS_asFunctionalComponent1(__VLS_399, new __VLS_399({
    modelValue: (__VLS_ctx.auditForm.reason),
    type: "textarea",
    rows: (3),
    placeholder: "请简要说明本次修改的原因（必填）",
}));
const __VLS_401 = __VLS_400({
    modelValue: (__VLS_ctx.auditForm.reason),
    type: "textarea",
    rows: (3),
    placeholder: "请简要说明本次修改的原因（必填）",
}, ...__VLS_functionalComponentArgsRest(__VLS_400));
// @ts-ignore
[auditDialogVisible, auditForm,];
var __VLS_396;
let __VLS_404;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_405 = __VLS_asFunctionalComponent1(__VLS_404, new __VLS_404({
    label: "证明材料",
}));
const __VLS_406 = __VLS_405({
    label: "证明材料",
}, ...__VLS_functionalComponentArgsRest(__VLS_405));
const { default: __VLS_409 } = __VLS_407.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "proof-upload" },
});
/** @type {__VLS_StyleScopedClasses['proof-upload']} */ ;
let __VLS_410;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_411 = __VLS_asFunctionalComponent1(__VLS_410, new __VLS_410({
    action: "#",
    listType: "picture-card",
    autoUpload: (false),
    fileList: (__VLS_ctx.auditForm.proofFiles),
    onChange: (__VLS_ctx.handleProofChange),
    onRemove: (__VLS_ctx.handleProofRemove),
    limit: (5),
    accept: "image/*",
}));
const __VLS_412 = __VLS_411({
    action: "#",
    listType: "picture-card",
    autoUpload: (false),
    fileList: (__VLS_ctx.auditForm.proofFiles),
    onChange: (__VLS_ctx.handleProofChange),
    onRemove: (__VLS_ctx.handleProofRemove),
    limit: (5),
    accept: "image/*",
}, ...__VLS_functionalComponentArgsRest(__VLS_411));
const { default: __VLS_415 } = __VLS_413.slots;
let __VLS_416;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_417 = __VLS_asFunctionalComponent1(__VLS_416, new __VLS_416({}));
const __VLS_418 = __VLS_417({}, ...__VLS_functionalComponentArgsRest(__VLS_417));
const { default: __VLS_421 } = __VLS_419.slots;
let __VLS_422;
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_423 = __VLS_asFunctionalComponent1(__VLS_422, new __VLS_422({}));
const __VLS_424 = __VLS_423({}, ...__VLS_functionalComponentArgsRest(__VLS_423));
// @ts-ignore
[auditForm, handleProofChange, handleProofRemove,];
var __VLS_419;
// @ts-ignore
[];
var __VLS_413;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "upload-tip" },
});
/** @type {__VLS_StyleScopedClasses['upload-tip']} */ ;
// @ts-ignore
[];
var __VLS_407;
// @ts-ignore
[];
var __VLS_390;
{
    const { footer: __VLS_427 } = __VLS_384.slots;
    let __VLS_428;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_429 = __VLS_asFunctionalComponent1(__VLS_428, new __VLS_428({
        ...{ 'onClick': {} },
    }));
    const __VLS_430 = __VLS_429({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_429));
    let __VLS_433;
    const __VLS_434 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.auditDialogVisible = false;
                // @ts-ignore
                [auditDialogVisible,];
            } });
    const { default: __VLS_435 } = __VLS_431.slots;
    // @ts-ignore
    [];
    var __VLS_431;
    var __VLS_432;
    let __VLS_436;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_437 = __VLS_asFunctionalComponent1(__VLS_436, new __VLS_436({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_438 = __VLS_437({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_437));
    let __VLS_441;
    const __VLS_442 = ({ click: {} },
        { onClick: (__VLS_ctx.submitAudit) });
    const { default: __VLS_443 } = __VLS_439.slots;
    // @ts-ignore
    [submitting, submitAudit,];
    var __VLS_439;
    var __VLS_440;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_384;
let __VLS_444;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_445 = __VLS_asFunctionalComponent1(__VLS_444, new __VLS_444({
    modelValue: (__VLS_ctx.priceDialogVisible),
    title: (__VLS_ctx.priceForm.priceType === 'online' ? '修改线上咨询价格' : '修改线下咨询价格'),
    width: "500px",
    closeOnClickModal: (false),
}));
const __VLS_446 = __VLS_445({
    modelValue: (__VLS_ctx.priceDialogVisible),
    title: (__VLS_ctx.priceForm.priceType === 'online' ? '修改线上咨询价格' : '修改线下咨询价格'),
    width: "500px",
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_445));
const { default: __VLS_449 } = __VLS_447.slots;
let __VLS_450;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_451 = __VLS_asFunctionalComponent1(__VLS_450, new __VLS_450({
    labelWidth: "100px",
}));
const __VLS_452 = __VLS_451({
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_451));
const { default: __VLS_455 } = __VLS_453.slots;
let __VLS_456;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_457 = __VLS_asFunctionalComponent1(__VLS_456, new __VLS_456({
    label: "当前价格",
}));
const __VLS_458 = __VLS_457({
    label: "当前价格",
}, ...__VLS_functionalComponentArgsRest(__VLS_457));
const { default: __VLS_461 } = __VLS_459.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "current-price" },
});
/** @type {__VLS_StyleScopedClasses['current-price']} */ ;
(__VLS_ctx.priceForm.priceType === 'online' ? __VLS_ctx.currentPrice : __VLS_ctx.offlinePrice);
// @ts-ignore
[currentPrice, offlinePrice, priceDialogVisible, priceForm, priceForm,];
var __VLS_459;
let __VLS_462;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_463 = __VLS_asFunctionalComponent1(__VLS_462, new __VLS_462({
    label: "新价格",
    required: true,
}));
const __VLS_464 = __VLS_463({
    label: "新价格",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_463));
const { default: __VLS_467 } = __VLS_465.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "price-edit" },
});
/** @type {__VLS_StyleScopedClasses['price-edit']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "currency" },
});
/** @type {__VLS_StyleScopedClasses['currency']} */ ;
let __VLS_468;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_469 = __VLS_asFunctionalComponent1(__VLS_468, new __VLS_468({
    modelValue: (__VLS_ctx.priceForm.newPrice),
    min: (0),
    precision: (2),
    controlsPosition: "right",
    ...{ class: "price-input-inner" },
}));
const __VLS_470 = __VLS_469({
    modelValue: (__VLS_ctx.priceForm.newPrice),
    min: (0),
    precision: (2),
    controlsPosition: "right",
    ...{ class: "price-input-inner" },
}, ...__VLS_functionalComponentArgsRest(__VLS_469));
/** @type {__VLS_StyleScopedClasses['price-input-inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "unit" },
});
/** @type {__VLS_StyleScopedClasses['unit']} */ ;
// @ts-ignore
[priceForm,];
var __VLS_465;
let __VLS_473;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_474 = __VLS_asFunctionalComponent1(__VLS_473, new __VLS_473({
    label: "修改理由",
    required: true,
}));
const __VLS_475 = __VLS_474({
    label: "修改理由",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_474));
const { default: __VLS_478 } = __VLS_476.slots;
let __VLS_479;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_480 = __VLS_asFunctionalComponent1(__VLS_479, new __VLS_479({
    modelValue: (__VLS_ctx.priceForm.reason),
    type: "textarea",
    rows: (3),
    placeholder: "请说明修改价格的原因（必填）",
}));
const __VLS_481 = __VLS_480({
    modelValue: (__VLS_ctx.priceForm.reason),
    type: "textarea",
    rows: (3),
    placeholder: "请说明修改价格的原因（必填）",
}, ...__VLS_functionalComponentArgsRest(__VLS_480));
// @ts-ignore
[priceForm,];
var __VLS_476;
let __VLS_484;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_485 = __VLS_asFunctionalComponent1(__VLS_484, new __VLS_484({
    label: "证明材料",
}));
const __VLS_486 = __VLS_485({
    label: "证明材料",
}, ...__VLS_functionalComponentArgsRest(__VLS_485));
const { default: __VLS_489 } = __VLS_487.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "proof-upload" },
});
/** @type {__VLS_StyleScopedClasses['proof-upload']} */ ;
let __VLS_490;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_491 = __VLS_asFunctionalComponent1(__VLS_490, new __VLS_490({
    action: "#",
    listType: "picture-card",
    autoUpload: (false),
    fileList: (__VLS_ctx.priceForm.proofFiles),
    onChange: (__VLS_ctx.handlePriceProofChange),
    onRemove: (__VLS_ctx.handlePriceProofRemove),
    limit: (5),
    accept: "image/*",
}));
const __VLS_492 = __VLS_491({
    action: "#",
    listType: "picture-card",
    autoUpload: (false),
    fileList: (__VLS_ctx.priceForm.proofFiles),
    onChange: (__VLS_ctx.handlePriceProofChange),
    onRemove: (__VLS_ctx.handlePriceProofRemove),
    limit: (5),
    accept: "image/*",
}, ...__VLS_functionalComponentArgsRest(__VLS_491));
const { default: __VLS_495 } = __VLS_493.slots;
let __VLS_496;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_497 = __VLS_asFunctionalComponent1(__VLS_496, new __VLS_496({}));
const __VLS_498 = __VLS_497({}, ...__VLS_functionalComponentArgsRest(__VLS_497));
const { default: __VLS_501 } = __VLS_499.slots;
let __VLS_502;
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_503 = __VLS_asFunctionalComponent1(__VLS_502, new __VLS_502({}));
const __VLS_504 = __VLS_503({}, ...__VLS_functionalComponentArgsRest(__VLS_503));
// @ts-ignore
[priceForm, handlePriceProofChange, handlePriceProofRemove,];
var __VLS_499;
// @ts-ignore
[];
var __VLS_493;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "upload-tip" },
});
/** @type {__VLS_StyleScopedClasses['upload-tip']} */ ;
// @ts-ignore
[];
var __VLS_487;
// @ts-ignore
[];
var __VLS_453;
{
    const { footer: __VLS_507 } = __VLS_447.slots;
    let __VLS_508;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_509 = __VLS_asFunctionalComponent1(__VLS_508, new __VLS_508({
        ...{ 'onClick': {} },
    }));
    const __VLS_510 = __VLS_509({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_509));
    let __VLS_513;
    const __VLS_514 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.priceDialogVisible = false;
                // @ts-ignore
                [priceDialogVisible,];
            } });
    const { default: __VLS_515 } = __VLS_511.slots;
    // @ts-ignore
    [];
    var __VLS_511;
    var __VLS_512;
    let __VLS_516;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_517 = __VLS_asFunctionalComponent1(__VLS_516, new __VLS_516({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.priceSubmitting),
    }));
    const __VLS_518 = __VLS_517({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.priceSubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_517));
    let __VLS_521;
    const __VLS_522 = ({ click: {} },
        { onClick: (__VLS_ctx.submitPriceChange) });
    const { default: __VLS_523 } = __VLS_519.slots;
    // @ts-ignore
    [priceSubmitting, submitPriceChange,];
    var __VLS_519;
    var __VLS_520;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_447;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
