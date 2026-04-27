/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, User, UserFilled, CircleCheck, CloseBold, StarFilled, Plus } from '@element-plus/icons-vue';
import { getAdminPsychologistList, updatePsychologistStatus, getAdminPsychologistDetail, getPsychologistFields, addPsychologistField, updatePsychologistField, deletePsychologistField, getFieldOptions, getPsychologistQualifications, addPsychologistQualification, updatePsychologistQualification, deletePsychologistQualification, getQualificationOptions, addPsychologist, updatePsychologist, deletePsychologist } from '@/api/psychologistAdmin';
import request from '@/utils/request';
const loading = ref(false);
const keyword = ref('');
const statusFilter = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const psychologistList = ref([]);
const statsData = reactive({
    totalCount: 0,
    enabledCount: 0,
    disabledCount: 0,
    avgRating: 0
});
// 新增/编辑表单相关
const formDialogVisible = ref(false);
const formDialogType = ref('add');
const formLoading = ref(false);
const formRef = ref();
const formData = reactive({
    id: null,
    userId: null,
    realName: '',
    sex: 0,
    headPath: '',
    yearsExperience: 0,
    consultationPrice: 0,
    qualificationIds: [],
    fieldIds: [],
    status: 1
});
const formRules = {
    userId: [{ required: true, message: '请选择关联用户', trigger: 'change' }],
    realName: [{ required: true, message: '请输入咨询师姓名', trigger: 'blur' }],
    consultationPrice: [{ required: true, message: '请输入咨询定价', trigger: 'blur' }]
};
const userOptions = ref([]);
const token = ref(localStorage.getItem('token') || '');
const selectedQualificationId = ref(null);
const qualificationOptions = ref([]);
const selectedFieldId = ref(null);
const fieldOptions = ref([]);
const detailDialogVisible = ref(false);
const currentPsychologist = ref(null);
// 擅长领域相关
const psychologistFields = ref([]);
const fieldDialogVisible = ref(false);
const fieldDialogType = ref('add');
const fieldForm = reactive({
    id: null,
    fieldId: null,
    subTags: ''
});
const fieldLoading = ref(false);
// 资质相关
const psychologistQualifications = ref([]);
const qualificationDialogVisible = ref(false);
const qualificationDialogType = ref('add');
const qualificationForm = reactive({
    id: null,
    qualificationId: null,
    certificateUrl: '',
    isVerified: 0
});
const qualificationLoading = ref(false);
// 获取列表数据
const fetchList = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            size: pageSize.value
        };
        if (keyword.value) {
            params.keyword = keyword.value;
        }
        if (statusFilter.value !== null) {
            params.status = statusFilter.value;
        }
        const res = await getAdminPsychologistList(params);
        if (res.code === 200) {
            // 兼容 records 和 list 两种返回格式
            psychologistList.value = res.data?.records || res.data?.list || [];
            total.value = res.data?.total || 0;
            // 统计计算
            statsData.totalCount = res.data?.total || 0;
            statsData.enabledCount = psychologistList.value.filter(p => p.status === 1).length;
            statsData.disabledCount = psychologistList.value.filter(p => p.status === 0).length;
            const totalRating = psychologistList.value.reduce((sum, p) => sum + (p.rating || 0), 0);
            statsData.avgRating = psychologistList.value.length > 0 ? totalRating / psychologistList.value.length : 0;
        }
        else {
            ElMessage.error(res.message || '获取列表失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '获取列表失败');
    }
    finally {
        loading.value = false;
    }
};
// 搜索
const handleSearch = () => {
    currentPage.value = 1;
    fetchList();
};
// 重置
const handleReset = () => {
    keyword.value = '';
    statusFilter.value = null;
    currentPage.value = 1;
    fetchList();
};
// 分页
const handleSizeChange = () => {
    currentPage.value = 1;
    fetchList();
};
const handleCurrentChange = () => {
    fetchList();
};
// 查看详情
const handleViewDetail = async (row) => {
    try {
        const res = await getAdminPsychologistDetail(row.id);
        if (res.code === 200) {
            currentPsychologist.value = res.data;
            detailDialogVisible.value = true;
            // 加载擅长领域和资质列表
            loadPsychologistRelations(row.id);
        }
        else {
            ElMessage.error(res.message || '获取详情失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '获取详情失败');
    }
};
// 加载擅长领域和资质列表
const loadPsychologistRelations = async (psychologistId) => {
    try {
        // 加载擅长领域
        const fieldsRes = await getPsychologistFields(psychologistId);
        if (fieldsRes.code === 200) {
            psychologistFields.value = fieldsRes.data || [];
        }
        // 加载资质
        const qualRes = await getPsychologistQualifications(psychologistId);
        if (qualRes.code === 200) {
            psychologistQualifications.value = qualRes.data || [];
        }
        // 加载选项
        const optionsRes = await Promise.all([getFieldOptions(), getQualificationOptions()]);
        if (optionsRes[0].code === 200) {
            fieldOptions.value = optionsRes[0].data || [];
        }
        if (optionsRes[1].code === 200) {
            qualificationOptions.value = optionsRes[1].data || [];
        }
    }
    catch (error) {
        ElMessage.error('加载关联数据失败');
    }
};
// 擅长领域对话框
const openFieldDialog = (type, row) => {
    fieldDialogType.value = type;
    if (type === 'add') {
        fieldForm.id = null;
        fieldForm.fieldId = null;
        fieldForm.subTags = '';
    }
    else {
        fieldForm.id = row.id;
        fieldForm.fieldId = row.fieldId;
        fieldForm.subTags = row.subTags || '';
    }
    fieldDialogVisible.value = true;
};
// 保存擅长领域
const saveField = async () => {
    if (!fieldForm.fieldId) {
        ElMessage.warning('请选择咨询领域');
        return;
    }
    fieldLoading.value = true;
    try {
        let res;
        if (fieldDialogType.value === 'add') {
            res = await addPsychologistField(currentPsychologist.value.id, {
                fieldId: fieldForm.fieldId,
                subTags: fieldForm.subTags
            });
        }
        else {
            res = await updatePsychologistField(fieldForm.id, {
                fieldId: fieldForm.fieldId,
                subTags: fieldForm.subTags
            });
        }
        if (res.code === 200) {
            ElMessage.success(fieldDialogType.value === 'add' ? '添加成功' : '更新成功');
            fieldDialogVisible.value = false;
            // 重新加载列表
            const fieldsRes = await getPsychologistFields(currentPsychologist.value.id);
            if (fieldsRes.code === 200) {
                psychologistFields.value = fieldsRes.data || [];
            }
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
    finally {
        fieldLoading.value = false;
    }
};
// 删除擅长领域
const deleteField = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除该擅长领域吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const res = await deletePsychologistField(id);
        if (res.code === 200) {
            ElMessage.success('删除成功');
            // 重新加载列表
            const fieldsRes = await getPsychologistFields(currentPsychologist.value.id);
            if (fieldsRes.code === 200) {
                psychologistFields.value = fieldsRes.data || [];
            }
        }
        else {
            ElMessage.error(res.message || '删除失败');
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '删除失败');
        }
    }
};
// 资质对话框
const openQualificationDialog = (type, row) => {
    qualificationDialogType.value = type;
    if (type === 'add') {
        qualificationForm.id = null;
        qualificationForm.qualificationId = null;
        qualificationForm.certificateUrl = '';
        qualificationForm.isVerified = 0;
    }
    else {
        qualificationForm.id = row.id;
        qualificationForm.qualificationId = row.qualificationId;
        qualificationForm.certificateUrl = row.certificateUrl || '';
        qualificationForm.isVerified = row.isVerified || 0;
    }
    qualificationDialogVisible.value = true;
};
// 保存资质
const saveQualification = async () => {
    if (!qualificationForm.qualificationId) {
        ElMessage.warning('请选择资质类型');
        return;
    }
    qualificationLoading.value = true;
    try {
        let res;
        if (qualificationDialogType.value === 'add') {
            res = await addPsychologistQualification(currentPsychologist.value.id, {
                qualificationId: qualificationForm.qualificationId,
                certificateUrl: qualificationForm.certificateUrl,
                isVerified: qualificationForm.isVerified
            });
        }
        else {
            res = await updatePsychologistQualification(qualificationForm.id, {
                qualificationId: qualificationForm.qualificationId,
                certificateUrl: qualificationForm.certificateUrl,
                isVerified: qualificationForm.isVerified
            });
        }
        if (res.code === 200) {
            ElMessage.success(qualificationDialogType.value === 'add' ? '添加成功' : '更新成功');
            qualificationDialogVisible.value = false;
            // 重新加载列表
            const qualRes = await getPsychologistQualifications(currentPsychologist.value.id);
            if (qualRes.code === 200) {
                psychologistQualifications.value = qualRes.data || [];
            }
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
    finally {
        qualificationLoading.value = false;
    }
};
// 删除资质
const deleteQualification = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除该资质吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const res = await deletePsychologistQualification(id);
        if (res.code === 200) {
            ElMessage.success('删除成功');
            // 重新加载列表
            const qualRes = await getPsychologistQualifications(currentPsychologist.value.id);
            if (qualRes.code === 200) {
                psychologistQualifications.value = qualRes.data || [];
            }
        }
        else {
            ElMessage.error(res.message || '删除失败');
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '删除失败');
        }
    }
};
// 状态切换
const handleStatusChange = async (row) => {
    try {
        const res = await updatePsychologistStatus(row.id, row.status === 1);
        if (res.code === 200) {
            ElMessage.success(row.status === 1 ? '已启用' : '已禁用');
        }
        else {
            ElMessage.error(res.message || '操作失败');
            // 恢复原状态
            row.status = row.status === 1 ? 0 : 1;
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
        row.status = row.status === 1 ? 0 : 1;
    }
};
// 加载用户选项
const loadUserOptions = async () => {
    if (userOptions.value.length > 0)
        return;
    try {
        const res = await request({
            url: '/api/admin/users',
            method: 'get',
            params: { page: 1, size: 100 }
        });
        if (res.code === 200) {
            const users = res.data?.records || res.data?.list || [];
            // 过滤掉已经是心理咨询师的用户
            userOptions.value = users;
        }
    }
    catch (e) {
        console.error('加载用户列表失败', e);
    }
};
// 打开新增对话框
const openAddDialog = () => {
    formDialogType.value = 'add';
    formData.id = null;
    formData.userId = null;
    formData.realName = '';
    formData.sex = 0;
    formData.headPath = '';
    formData.yearsExperience = 0;
    formData.consultationPrice = 0;
    formData.qualificationIds = [];
    formData.fieldIds = [];
    formData.status = 1;
    userOptions.value = [];
    selectedQualificationId.value = null;
    qualificationOptions.value = [];
    selectedFieldId.value = null;
    fieldOptions.value = [];
    formDialogVisible.value = true;
};
// 打开编辑对话框
const handleEdit = async (row) => {
    formDialogType.value = 'edit';
    formData.id = row.id;
    formData.userId = row.userId;
    formData.realName = row.realName;
    formData.sex = row.sex || 0;
    formData.headPath = row.headPath || '';
    formData.yearsExperience = row.yearsExperience || 0;
    formData.consultationPrice = row.consultationPrice || 0;
    formData.qualificationIds = row.qualificationIds || [];
    formData.fieldIds = row.fieldIds || [];
    formData.status = row.status || 0;
    selectedQualificationId.value = null;
    selectedFieldId.value = null;
    // 加载资质选项和擅长领域选项
    await loadQualificationOptions();
    await loadFieldOptions();
    formDialogVisible.value = true;
};
// 提交表单
const submitForm = async () => {
    try {
        await formRef.value.validate();
    }
    catch {
        return;
    }
    formLoading.value = true;
    try {
        const data = {
            realName: formData.realName,
            sex: formData.sex,
            headPath: formData.headPath,
            yearsExperience: formData.yearsExperience,
            consultationPrice: formData.consultationPrice,
            qualificationIds: formData.qualificationIds,
            fieldIds: formData.fieldIds,
            status: formData.status
        };
        let res;
        if (formDialogType.value === 'add') {
            if (formData.userId === null) {
                ElMessage.warning('请选择关联用户');
                return;
            }
            res = await addPsychologist({ ...data, userId: formData.userId });
        }
        else {
            res = await updatePsychologist(formData.id, data);
        }
        if (res.code === 200) {
            ElMessage.success(formDialogType.value === 'add' ? '添加成功' : '更新成功');
            formDialogVisible.value = false;
            fetchList();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
    finally {
        formLoading.value = false;
    }
};
// 删除咨询师
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm(`确定要删除咨询师"${row.realName}"吗？删除后不可恢复！`, '删除确认', {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const res = await deletePsychologist(row.id);
        if (res.code === 200) {
            ElMessage.success('删除成功');
            fetchList();
        }
        else {
            ElMessage.error(res.message || '删除失败');
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '删除失败');
        }
    }
};
// 资质相关方法
const loadQualificationOptions = async () => {
    if (qualificationOptions.value.length > 0)
        return;
    try {
        const res = await request({
            url: '/api/admin/psychologist/qualifications/options',
            method: 'get'
        });
        if (res.code === 200) {
            qualificationOptions.value = res.data || [];
        }
    }
    catch (e) {
        console.error('加载资质列表失败', e);
    }
};
const addQualificationTag = () => {
    if (selectedQualificationId.value && !formData.qualificationIds.includes(selectedQualificationId.value)) {
        formData.qualificationIds.push(selectedQualificationId.value);
    }
    selectedQualificationId.value = null;
};
const removeQualificationTag = (qid) => {
    const index = formData.qualificationIds.indexOf(qid);
    if (index > -1) {
        formData.qualificationIds.splice(index, 1);
    }
};
const getQualificationName = (qid) => {
    const q = qualificationOptions.value.find(item => item.id === qid);
    return q ? q.name : '';
};
// 擅长领域相关方法
const loadFieldOptions = async () => {
    if (fieldOptions.value.length > 0)
        return;
    try {
        const res = await request({
            url: '/api/admin/psychologist/fields/options',
            method: 'get'
        });
        if (res.code === 200) {
            fieldOptions.value = res.data || [];
        }
    }
    catch (e) {
        console.error('加载擅长领域列表失败', e);
    }
};
const addFieldTag = () => {
    if (selectedFieldId.value && !formData.fieldIds.includes(selectedFieldId.value)) {
        formData.fieldIds.push(selectedFieldId.value);
    }
    selectedFieldId.value = null;
};
const removeFieldTag = (fid) => {
    const index = formData.fieldIds.indexOf(fid);
    if (index > -1) {
        formData.fieldIds.splice(index, 1);
    }
};
const getFieldName = (fid) => {
    const f = fieldOptions.value.find(item => item.id === fid);
    return f ? f.name : '';
};
// 头像上传相关
const handleAvatarSuccess = (res) => {
    if (res.code === 200) {
        formData.headPath = res.data;
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
// 证书上传相关
const handleCertificateSuccess = (res) => {
    if (res.code === 200) {
        qualificationForm.certificateUrl = res.data;
        ElMessage.success('证书上传成功');
    }
    else {
        ElMessage.error(res.message || '上传失败');
    }
};
const beforeCertificateUpload = (file) => {
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
onMounted(() => {
    fetchList();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['info-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['certificate-uploader']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psychologist-admin-page" },
});
/** @type {__VLS_StyleScopedClasses['psychologist-admin-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stats-cards" },
});
/** @type {__VLS_StyleScopedClasses['stats-cards']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon blue" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['blue']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.UserFilled} */
UserFilled;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.statsData.totalCount || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon green" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['green']} */ ;
let __VLS_11;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({}));
const __VLS_13 = __VLS_12({}, ...__VLS_functionalComponentArgsRest(__VLS_12));
const { default: __VLS_16 } = __VLS_14.slots;
let __VLS_17;
/** @ts-ignore @type {typeof __VLS_components.CircleCheck} */
CircleCheck;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({}));
const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
// @ts-ignore
[statsData,];
var __VLS_14;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.statsData.enabledCount || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon orange" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['orange']} */ ;
let __VLS_22;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({}));
const __VLS_24 = __VLS_23({}, ...__VLS_functionalComponentArgsRest(__VLS_23));
const { default: __VLS_27 } = __VLS_25.slots;
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.CloseBold} */
CloseBold;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
// @ts-ignore
[statsData,];
var __VLS_25;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.statsData.disabledCount || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon purple" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['purple']} */ ;
let __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({}));
const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const { default: __VLS_38 } = __VLS_36.slots;
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.StarFilled} */
StarFilled;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({}));
const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
// @ts-ignore
[statsData,];
var __VLS_36;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
((__VLS_ctx.statsData.avgRating || 0).toFixed(1));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-toolbar" },
});
/** @type {__VLS_StyleScopedClasses['filter-toolbar']} */ ;
let __VLS_44;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    ...{ 'onClear': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索咨询师姓名/用户名",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClear': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索咨询师姓名/用户名",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_49;
const __VLS_50 = ({ clear: {} },
    { onClear: (__VLS_ctx.handleSearch) });
const { default: __VLS_51 } = __VLS_47.slots;
{
    const { prefix: __VLS_52 } = __VLS_47.slots;
    let __VLS_53;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({}));
    const __VLS_55 = __VLS_54({}, ...__VLS_functionalComponentArgsRest(__VLS_54));
    const { default: __VLS_58 } = __VLS_56.slots;
    let __VLS_59;
    /** @ts-ignore @type {typeof __VLS_components.Search} */
    Search;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({}));
    const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
    // @ts-ignore
    [statsData, keyword, handleSearch,];
    var __VLS_56;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_47;
var __VLS_48;
let __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "状态筛选",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_66 = __VLS_65({
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "状态筛选",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const { default: __VLS_69 } = __VLS_67.slots;
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    label: "全部",
    value: (null),
}));
const __VLS_72 = __VLS_71({
    label: "全部",
    value: (null),
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
let __VLS_75;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
    label: "已启用",
    value: (1),
}));
const __VLS_77 = __VLS_76({
    label: "已启用",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
let __VLS_80;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
    label: "已禁用",
    value: (0),
}));
const __VLS_82 = __VLS_81({
    label: "已禁用",
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
// @ts-ignore
[statusFilter,];
var __VLS_67;
let __VLS_85;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_87 = __VLS_86({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
let __VLS_90;
const __VLS_91 = ({ click: {} },
    { onClick: (__VLS_ctx.handleSearch) });
const { default: __VLS_92 } = __VLS_88.slots;
let __VLS_93;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({}));
const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
const { default: __VLS_98 } = __VLS_96.slots;
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.Search} */
Search;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({}));
const __VLS_101 = __VLS_100({}, ...__VLS_functionalComponentArgsRest(__VLS_100));
// @ts-ignore
[handleSearch,];
var __VLS_96;
// @ts-ignore
[];
var __VLS_88;
var __VLS_89;
let __VLS_104;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
    ...{ 'onClick': {} },
}));
const __VLS_106 = __VLS_105({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
let __VLS_109;
const __VLS_110 = ({ click: {} },
    { onClick: (__VLS_ctx.handleReset) });
const { default: __VLS_111 } = __VLS_107.slots;
let __VLS_112;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({}));
const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
const { default: __VLS_117 } = __VLS_115.slots;
let __VLS_118;
/** @ts-ignore @type {typeof __VLS_components.Refresh} */
Refresh;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({}));
const __VLS_120 = __VLS_119({}, ...__VLS_functionalComponentArgsRest(__VLS_119));
// @ts-ignore
[handleReset,];
var __VLS_115;
// @ts-ignore
[];
var __VLS_107;
var __VLS_108;
let __VLS_123;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
    ...{ 'onClick': {} },
    type: "success",
}));
const __VLS_125 = __VLS_124({
    ...{ 'onClick': {} },
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
let __VLS_128;
const __VLS_129 = ({ click: {} },
    { onClick: (__VLS_ctx.openAddDialog) });
const { default: __VLS_130 } = __VLS_126.slots;
let __VLS_131;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({}));
const __VLS_133 = __VLS_132({}, ...__VLS_functionalComponentArgsRest(__VLS_132));
const { default: __VLS_136 } = __VLS_134.slots;
let __VLS_137;
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({}));
const __VLS_139 = __VLS_138({}, ...__VLS_functionalComponentArgsRest(__VLS_138));
// @ts-ignore
[openAddDialog,];
var __VLS_134;
// @ts-ignore
[];
var __VLS_126;
var __VLS_127;
let __VLS_142;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent1(__VLS_142, new __VLS_142({
    data: (__VLS_ctx.psychologistList),
    stripe: true,
}));
const __VLS_144 = __VLS_143({
    data: (__VLS_ctx.psychologistList),
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_147 } = __VLS_145.slots;
let __VLS_148;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_150 = __VLS_149({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
let __VLS_153;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153({
    label: "咨询师信息",
    minWidth: "150",
}));
const __VLS_155 = __VLS_154({
    label: "咨询师信息",
    minWidth: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
const { default: __VLS_158 } = __VLS_156.slots;
{
    const { default: __VLS_159 } = __VLS_156.slots;
    const [scope] = __VLS_vSlot(__VLS_159);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "psychologist-info" },
    });
    /** @type {__VLS_StyleScopedClasses['psychologist-info']} */ ;
    let __VLS_160;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent1(__VLS_160, new __VLS_160({
        size: (40),
        src: (scope.row.headPath),
    }));
    const __VLS_162 = __VLS_161({
        size: (40),
        src: (scope.row.headPath),
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    const { default: __VLS_165 } = __VLS_163.slots;
    let __VLS_166;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent1(__VLS_166, new __VLS_166({}));
    const __VLS_168 = __VLS_167({}, ...__VLS_functionalComponentArgsRest(__VLS_167));
    const { default: __VLS_171 } = __VLS_169.slots;
    let __VLS_172;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent1(__VLS_172, new __VLS_172({}));
    const __VLS_174 = __VLS_173({}, ...__VLS_functionalComponentArgsRest(__VLS_173));
    // @ts-ignore
    [psychologistList, vLoading, loading,];
    var __VLS_169;
    // @ts-ignore
    [];
    var __VLS_163;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-detail" },
    });
    /** @type {__VLS_StyleScopedClasses['info-detail']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "name" },
    });
    /** @type {__VLS_StyleScopedClasses['name']} */ ;
    (scope.row.realName || '未设置');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "username" },
    });
    /** @type {__VLS_StyleScopedClasses['username']} */ ;
    (scope.row.userNickname || '-');
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_156;
let __VLS_177;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent1(__VLS_177, new __VLS_177({
    label: "联系方式",
    width: "150",
}));
const __VLS_179 = __VLS_178({
    label: "联系方式",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
const { default: __VLS_182 } = __VLS_180.slots;
{
    const { default: __VLS_183 } = __VLS_180.slots;
    const [scope] = __VLS_vSlot(__VLS_183);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    (scope.row.phone || '-');
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_180;
let __VLS_184;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent1(__VLS_184, new __VLS_184({
    label: "咨询定价",
    width: "120",
}));
const __VLS_186 = __VLS_185({
    label: "咨询定价",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
const { default: __VLS_189 } = __VLS_187.slots;
{
    const { default: __VLS_190 } = __VLS_187.slots;
    const [scope] = __VLS_vSlot(__VLS_190);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "price" },
    });
    /** @type {__VLS_StyleScopedClasses['price']} */ ;
    (scope.row.consultationPrice || '未设置');
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_187;
let __VLS_191;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191({
    label: "评分",
    width: "150",
}));
const __VLS_193 = __VLS_192({
    label: "评分",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_192));
const { default: __VLS_196 } = __VLS_194.slots;
{
    const { default: __VLS_197 } = __VLS_194.slots;
    const [scope] = __VLS_vSlot(__VLS_197);
    let __VLS_198;
    /** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
    elRate;
    // @ts-ignore
    const __VLS_199 = __VLS_asFunctionalComponent1(__VLS_198, new __VLS_198({
        modelValue: (scope.row.rating),
        disabled: true,
        size: "small",
        max: (5),
        allowHalf: (true),
    }));
    const __VLS_200 = __VLS_199({
        modelValue: (scope.row.rating),
        disabled: true,
        size: "small",
        max: (5),
        allowHalf: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_199));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "rating-text" },
    });
    /** @type {__VLS_StyleScopedClasses['rating-text']} */ ;
    (scope.row.rating ? scope.row.rating.toFixed(1) : '-');
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_194;
let __VLS_203;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_204 = __VLS_asFunctionalComponent1(__VLS_203, new __VLS_203({
    label: "咨询次数",
    width: "100",
}));
const __VLS_205 = __VLS_204({
    label: "咨询次数",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_204));
const { default: __VLS_208 } = __VLS_206.slots;
{
    const { default: __VLS_209 } = __VLS_206.slots;
    const [scope] = __VLS_vSlot(__VLS_209);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (scope.row.consultationCount || 0);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_206;
let __VLS_210;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
    label: "在线状态",
    width: "100",
}));
const __VLS_212 = __VLS_211({
    label: "在线状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_211));
const { default: __VLS_215 } = __VLS_213.slots;
{
    const { default: __VLS_216 } = __VLS_213.slots;
    const [scope] = __VLS_vSlot(__VLS_216);
    let __VLS_217;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent1(__VLS_217, new __VLS_217({
        type: (scope.row.onlineStatus === 1 ? 'success' : 'info'),
        size: "small",
    }));
    const __VLS_219 = __VLS_218({
        type: (scope.row.onlineStatus === 1 ? 'success' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    const { default: __VLS_222 } = __VLS_220.slots;
    (scope.row.onlineStatus === 1 ? '在线' : '离线');
    // @ts-ignore
    [];
    var __VLS_220;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_213;
let __VLS_223;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_224 = __VLS_asFunctionalComponent1(__VLS_223, new __VLS_223({
    label: "状态",
    width: "100",
}));
const __VLS_225 = __VLS_224({
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_224));
const { default: __VLS_228 } = __VLS_226.slots;
{
    const { default: __VLS_229 } = __VLS_226.slots;
    const [scope] = __VLS_vSlot(__VLS_229);
    let __VLS_230;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_231 = __VLS_asFunctionalComponent1(__VLS_230, new __VLS_230({
        type: (scope.row.status === 1 ? 'success' : 'danger'),
        size: "small",
    }));
    const __VLS_232 = __VLS_231({
        type: (scope.row.status === 1 ? 'success' : 'danger'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_231));
    const { default: __VLS_235 } = __VLS_233.slots;
    (scope.row.status === 1 ? '已启用' : '已禁用');
    // @ts-ignore
    [];
    var __VLS_233;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_226;
let __VLS_236;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent1(__VLS_236, new __VLS_236({
    label: "入驻时间",
    width: "160",
}));
const __VLS_238 = __VLS_237({
    label: "入驻时间",
    width: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
const { default: __VLS_241 } = __VLS_239.slots;
{
    const { default: __VLS_242 } = __VLS_239.slots;
    const [scope] = __VLS_vSlot(__VLS_242);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (scope.row.createTime || '-');
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_239;
let __VLS_243;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_244 = __VLS_asFunctionalComponent1(__VLS_243, new __VLS_243({
    label: "操作",
    width: "220",
    fixed: "right",
}));
const __VLS_245 = __VLS_244({
    label: "操作",
    width: "220",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_244));
const { default: __VLS_248 } = __VLS_246.slots;
{
    const { default: __VLS_249 } = __VLS_246.slots;
    const [scope] = __VLS_vSlot(__VLS_249);
    let __VLS_250;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_251 = __VLS_asFunctionalComponent1(__VLS_250, new __VLS_250({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        link: true,
    }));
    const __VLS_252 = __VLS_251({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_251));
    let __VLS_255;
    const __VLS_256 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleViewDetail(scope.row);
                // @ts-ignore
                [handleViewDetail,];
            } });
    const { default: __VLS_257 } = __VLS_253.slots;
    // @ts-ignore
    [];
    var __VLS_253;
    var __VLS_254;
    let __VLS_258;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_259 = __VLS_asFunctionalComponent1(__VLS_258, new __VLS_258({
        ...{ 'onClick': {} },
        size: "small",
        type: "warning",
        link: true,
    }));
    const __VLS_260 = __VLS_259({
        ...{ 'onClick': {} },
        size: "small",
        type: "warning",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_259));
    let __VLS_263;
    const __VLS_264 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(scope.row);
                // @ts-ignore
                [handleEdit,];
            } });
    const { default: __VLS_265 } = __VLS_261.slots;
    // @ts-ignore
    [];
    var __VLS_261;
    var __VLS_262;
    let __VLS_266;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_267 = __VLS_asFunctionalComponent1(__VLS_266, new __VLS_266({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        link: true,
    }));
    const __VLS_268 = __VLS_267({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_267));
    let __VLS_271;
    const __VLS_272 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(scope.row);
                // @ts-ignore
                [handleDelete,];
            } });
    const { default: __VLS_273 } = __VLS_269.slots;
    // @ts-ignore
    [];
    var __VLS_269;
    var __VLS_270;
    let __VLS_274;
    /** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
    elSwitch;
    // @ts-ignore
    const __VLS_275 = __VLS_asFunctionalComponent1(__VLS_274, new __VLS_274({
        ...{ 'onChange': {} },
        modelValue: (scope.row.status),
        activeValue: (1),
        inactiveValue: (0),
        size: "small",
    }));
    const __VLS_276 = __VLS_275({
        ...{ 'onChange': {} },
        modelValue: (scope.row.status),
        activeValue: (1),
        inactiveValue: (0),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_275));
    let __VLS_279;
    const __VLS_280 = ({ change: {} },
        { onChange: (...[$event]) => {
                __VLS_ctx.handleStatusChange(scope.row);
                // @ts-ignore
                [handleStatusChange,];
            } });
    var __VLS_277;
    var __VLS_278;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_246;
// @ts-ignore
[];
var __VLS_145;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
let __VLS_281;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_282 = __VLS_asFunctionalComponent1(__VLS_281, new __VLS_281({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50, 100]),
    layout: "total, sizes, prev, pager, next, jumper",
}));
const __VLS_283 = __VLS_282({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50, 100]),
    layout: "total, sizes, prev, pager, next, jumper",
}, ...__VLS_functionalComponentArgsRest(__VLS_282));
let __VLS_286;
const __VLS_287 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.handleSizeChange) });
const __VLS_288 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.handleCurrentChange) });
var __VLS_284;
var __VLS_285;
let __VLS_289;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_290 = __VLS_asFunctionalComponent1(__VLS_289, new __VLS_289({
    modelValue: (__VLS_ctx.formDialogVisible),
    title: (__VLS_ctx.formDialogType === 'add' ? '新增咨询师' : '编辑咨询师'),
    width: "600px",
}));
const __VLS_291 = __VLS_290({
    modelValue: (__VLS_ctx.formDialogVisible),
    title: (__VLS_ctx.formDialogType === 'add' ? '新增咨询师' : '编辑咨询师'),
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_290));
const { default: __VLS_294 } = __VLS_292.slots;
let __VLS_295;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_296 = __VLS_asFunctionalComponent1(__VLS_295, new __VLS_295({
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
    ref: "formRef",
    labelWidth: "100px",
}));
const __VLS_297 = __VLS_296({
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
    ref: "formRef",
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_296));
var __VLS_300 = {};
const { default: __VLS_302 } = __VLS_298.slots;
if (__VLS_ctx.formDialogType === 'add') {
    let __VLS_303;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_304 = __VLS_asFunctionalComponent1(__VLS_303, new __VLS_303({
        label: "关联用户",
        prop: "userId",
    }));
    const __VLS_305 = __VLS_304({
        label: "关联用户",
        prop: "userId",
    }, ...__VLS_functionalComponentArgsRest(__VLS_304));
    const { default: __VLS_308 } = __VLS_306.slots;
    let __VLS_309;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_310 = __VLS_asFunctionalComponent1(__VLS_309, new __VLS_309({
        ...{ 'onFocus': {} },
        modelValue: (__VLS_ctx.formData.userId),
        filterable: true,
        placeholder: "请选择关联的用户",
        ...{ style: {} },
    }));
    const __VLS_311 = __VLS_310({
        ...{ 'onFocus': {} },
        modelValue: (__VLS_ctx.formData.userId),
        filterable: true,
        placeholder: "请选择关联的用户",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_310));
    let __VLS_314;
    const __VLS_315 = ({ focus: {} },
        { onFocus: (__VLS_ctx.loadUserOptions) });
    const { default: __VLS_316 } = __VLS_312.slots;
    for (const [user] of __VLS_vFor((__VLS_ctx.userOptions))) {
        let __VLS_317;
        /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
        elOption;
        // @ts-ignore
        const __VLS_318 = __VLS_asFunctionalComponent1(__VLS_317, new __VLS_317({
            key: (user.id),
            label: (`${user.nickname || user.username} (${user.username})`),
            value: (user.id),
        }));
        const __VLS_319 = __VLS_318({
            key: (user.id),
            label: (`${user.nickname || user.username} (${user.username})`),
            value: (user.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_318));
        const { default: __VLS_322 } = __VLS_320.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ style: {} },
        });
        (user.nickname || user.username);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ style: {} },
        });
        (user.username);
        // @ts-ignore
        [currentPage, pageSize, total, handleSizeChange, handleCurrentChange, formDialogVisible, formDialogType, formDialogType, formData, formData, formRules, loadUserOptions, userOptions,];
        var __VLS_320;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_312;
    var __VLS_313;
    // @ts-ignore
    [];
    var __VLS_306;
}
let __VLS_323;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_324 = __VLS_asFunctionalComponent1(__VLS_323, new __VLS_323({
    label: "咨询师姓名",
    prop: "realName",
}));
const __VLS_325 = __VLS_324({
    label: "咨询师姓名",
    prop: "realName",
}, ...__VLS_functionalComponentArgsRest(__VLS_324));
const { default: __VLS_328 } = __VLS_326.slots;
let __VLS_329;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_330 = __VLS_asFunctionalComponent1(__VLS_329, new __VLS_329({
    modelValue: (__VLS_ctx.formData.realName),
    placeholder: "请输入咨询师姓名",
}));
const __VLS_331 = __VLS_330({
    modelValue: (__VLS_ctx.formData.realName),
    placeholder: "请输入咨询师姓名",
}, ...__VLS_functionalComponentArgsRest(__VLS_330));
// @ts-ignore
[formData,];
var __VLS_326;
let __VLS_334;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_335 = __VLS_asFunctionalComponent1(__VLS_334, new __VLS_334({
    label: "性别",
}));
const __VLS_336 = __VLS_335({
    label: "性别",
}, ...__VLS_functionalComponentArgsRest(__VLS_335));
const { default: __VLS_339 } = __VLS_337.slots;
let __VLS_340;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_341 = __VLS_asFunctionalComponent1(__VLS_340, new __VLS_340({
    modelValue: (__VLS_ctx.formData.sex),
}));
const __VLS_342 = __VLS_341({
    modelValue: (__VLS_ctx.formData.sex),
}, ...__VLS_functionalComponentArgsRest(__VLS_341));
const { default: __VLS_345 } = __VLS_343.slots;
let __VLS_346;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_347 = __VLS_asFunctionalComponent1(__VLS_346, new __VLS_346({
    label: (1),
}));
const __VLS_348 = __VLS_347({
    label: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_347));
const { default: __VLS_351 } = __VLS_349.slots;
// @ts-ignore
[formData,];
var __VLS_349;
let __VLS_352;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_353 = __VLS_asFunctionalComponent1(__VLS_352, new __VLS_352({
    label: (2),
}));
const __VLS_354 = __VLS_353({
    label: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_353));
const { default: __VLS_357 } = __VLS_355.slots;
// @ts-ignore
[];
var __VLS_355;
let __VLS_358;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_359 = __VLS_asFunctionalComponent1(__VLS_358, new __VLS_358({
    label: (0),
}));
const __VLS_360 = __VLS_359({
    label: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_359));
const { default: __VLS_363 } = __VLS_361.slots;
// @ts-ignore
[];
var __VLS_361;
// @ts-ignore
[];
var __VLS_343;
// @ts-ignore
[];
var __VLS_337;
let __VLS_364;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_365 = __VLS_asFunctionalComponent1(__VLS_364, new __VLS_364({
    label: "头像",
}));
const __VLS_366 = __VLS_365({
    label: "头像",
}, ...__VLS_functionalComponentArgsRest(__VLS_365));
const { default: __VLS_369 } = __VLS_367.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "avatar-upload-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['avatar-upload-wrapper']} */ ;
let __VLS_370;
/** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
elAvatar;
// @ts-ignore
const __VLS_371 = __VLS_asFunctionalComponent1(__VLS_370, new __VLS_370({
    size: (80),
    src: (__VLS_ctx.formData.headPath),
    ...{ class: "avatar-preview" },
}));
const __VLS_372 = __VLS_371({
    size: (80),
    src: (__VLS_ctx.formData.headPath),
    ...{ class: "avatar-preview" },
}, ...__VLS_functionalComponentArgsRest(__VLS_371));
/** @type {__VLS_StyleScopedClasses['avatar-preview']} */ ;
const { default: __VLS_375 } = __VLS_373.slots;
let __VLS_376;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_377 = __VLS_asFunctionalComponent1(__VLS_376, new __VLS_376({
    size: (30),
}));
const __VLS_378 = __VLS_377({
    size: (30),
}, ...__VLS_functionalComponentArgsRest(__VLS_377));
const { default: __VLS_381 } = __VLS_379.slots;
let __VLS_382;
/** @ts-ignore @type {typeof __VLS_components.User} */
User;
// @ts-ignore
const __VLS_383 = __VLS_asFunctionalComponent1(__VLS_382, new __VLS_382({}));
const __VLS_384 = __VLS_383({}, ...__VLS_functionalComponentArgsRest(__VLS_383));
// @ts-ignore
[formData,];
var __VLS_379;
// @ts-ignore
[];
var __VLS_373;
let __VLS_387;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_388 = __VLS_asFunctionalComponent1(__VLS_387, new __VLS_387({
    ...{ class: "avatar-uploader" },
    action: "/api/psychologist-apply/upload",
    headers: ({ token: __VLS_ctx.token }),
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleAvatarSuccess),
    beforeUpload: (__VLS_ctx.beforeAvatarUpload),
    accept: "image/*",
}));
const __VLS_389 = __VLS_388({
    ...{ class: "avatar-uploader" },
    action: "/api/psychologist-apply/upload",
    headers: ({ token: __VLS_ctx.token }),
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleAvatarSuccess),
    beforeUpload: (__VLS_ctx.beforeAvatarUpload),
    accept: "image/*",
}, ...__VLS_functionalComponentArgsRest(__VLS_388));
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
const { default: __VLS_392 } = __VLS_390.slots;
let __VLS_393;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_394 = __VLS_asFunctionalComponent1(__VLS_393, new __VLS_393({
    size: "small",
    type: "primary",
}));
const __VLS_395 = __VLS_394({
    size: "small",
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_394));
const { default: __VLS_398 } = __VLS_396.slots;
// @ts-ignore
[token, handleAvatarSuccess, beforeAvatarUpload,];
var __VLS_396;
// @ts-ignore
[];
var __VLS_390;
// @ts-ignore
[];
var __VLS_367;
let __VLS_399;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_400 = __VLS_asFunctionalComponent1(__VLS_399, new __VLS_399({
    label: "咨询定价",
    prop: "consultationPrice",
}));
const __VLS_401 = __VLS_400({
    label: "咨询定价",
    prop: "consultationPrice",
}, ...__VLS_functionalComponentArgsRest(__VLS_400));
const { default: __VLS_404 } = __VLS_402.slots;
let __VLS_405;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_406 = __VLS_asFunctionalComponent1(__VLS_405, new __VLS_405({
    modelValue: (__VLS_ctx.formData.consultationPrice),
    min: (0),
    precision: (2),
    step: (50),
}));
const __VLS_407 = __VLS_406({
    modelValue: (__VLS_ctx.formData.consultationPrice),
    min: (0),
    precision: (2),
    step: (50),
}, ...__VLS_functionalComponentArgsRest(__VLS_406));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "unit-label" },
});
/** @type {__VLS_StyleScopedClasses['unit-label']} */ ;
// @ts-ignore
[formData,];
var __VLS_402;
let __VLS_410;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_411 = __VLS_asFunctionalComponent1(__VLS_410, new __VLS_410({
    label: "从业年数",
}));
const __VLS_412 = __VLS_411({
    label: "从业年数",
}, ...__VLS_functionalComponentArgsRest(__VLS_411));
const { default: __VLS_415 } = __VLS_413.slots;
let __VLS_416;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_417 = __VLS_asFunctionalComponent1(__VLS_416, new __VLS_416({
    modelValue: (__VLS_ctx.formData.yearsExperience),
    min: (0),
    max: (50),
}));
const __VLS_418 = __VLS_417({
    modelValue: (__VLS_ctx.formData.yearsExperience),
    min: (0),
    max: (50),
}, ...__VLS_functionalComponentArgsRest(__VLS_417));
// @ts-ignore
[formData,];
var __VLS_413;
let __VLS_421;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_422 = __VLS_asFunctionalComponent1(__VLS_421, new __VLS_421({
    label: "专业认证",
}));
const __VLS_423 = __VLS_422({
    label: "专业认证",
}, ...__VLS_functionalComponentArgsRest(__VLS_422));
const { default: __VLS_426 } = __VLS_424.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "qualification-select" },
});
/** @type {__VLS_StyleScopedClasses['qualification-select']} */ ;
let __VLS_427;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_428 = __VLS_asFunctionalComponent1(__VLS_427, new __VLS_427({
    ...{ 'onFocus': {} },
    modelValue: (__VLS_ctx.selectedQualificationId),
    placeholder: "选择资质类型",
    ...{ style: {} },
}));
const __VLS_429 = __VLS_428({
    ...{ 'onFocus': {} },
    modelValue: (__VLS_ctx.selectedQualificationId),
    placeholder: "选择资质类型",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_428));
let __VLS_432;
const __VLS_433 = ({ focus: {} },
    { onFocus: (__VLS_ctx.loadQualificationOptions) });
const { default: __VLS_434 } = __VLS_430.slots;
for (const [q] of __VLS_vFor((__VLS_ctx.qualificationOptions))) {
    let __VLS_435;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_436 = __VLS_asFunctionalComponent1(__VLS_435, new __VLS_435({
        key: (q.id),
        label: (q.name),
        value: (q.id),
    }));
    const __VLS_437 = __VLS_436({
        key: (q.id),
        label: (q.name),
        value: (q.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_436));
    // @ts-ignore
    [selectedQualificationId, loadQualificationOptions, qualificationOptions,];
}
// @ts-ignore
[];
var __VLS_430;
var __VLS_431;
let __VLS_440;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_441 = __VLS_asFunctionalComponent1(__VLS_440, new __VLS_440({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.selectedQualificationId),
}));
const __VLS_442 = __VLS_441({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.selectedQualificationId),
}, ...__VLS_functionalComponentArgsRest(__VLS_441));
let __VLS_445;
const __VLS_446 = ({ click: {} },
    { onClick: (__VLS_ctx.addQualificationTag) });
const { default: __VLS_447 } = __VLS_443.slots;
// @ts-ignore
[selectedQualificationId, addQualificationTag,];
var __VLS_443;
var __VLS_444;
if (__VLS_ctx.formData.qualificationIds.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "qualification-tags" },
    });
    /** @type {__VLS_StyleScopedClasses['qualification-tags']} */ ;
    for (const [qid] of __VLS_vFor((__VLS_ctx.formData.qualificationIds))) {
        let __VLS_448;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_449 = __VLS_asFunctionalComponent1(__VLS_448, new __VLS_448({
            ...{ 'onClose': {} },
            key: (qid),
            closable: true,
        }));
        const __VLS_450 = __VLS_449({
            ...{ 'onClose': {} },
            key: (qid),
            closable: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_449));
        let __VLS_453;
        const __VLS_454 = ({ close: {} },
            { onClose: (...[$event]) => {
                    if (!(__VLS_ctx.formData.qualificationIds.length > 0))
                        return;
                    __VLS_ctx.removeQualificationTag(qid);
                    // @ts-ignore
                    [formData, formData, removeQualificationTag,];
                } });
        const { default: __VLS_455 } = __VLS_451.slots;
        (__VLS_ctx.getQualificationName(qid));
        // @ts-ignore
        [getQualificationName,];
        var __VLS_451;
        var __VLS_452;
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
var __VLS_424;
let __VLS_456;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_457 = __VLS_asFunctionalComponent1(__VLS_456, new __VLS_456({
    label: "擅长领域",
}));
const __VLS_458 = __VLS_457({
    label: "擅长领域",
}, ...__VLS_functionalComponentArgsRest(__VLS_457));
const { default: __VLS_461 } = __VLS_459.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "qualification-select" },
});
/** @type {__VLS_StyleScopedClasses['qualification-select']} */ ;
let __VLS_462;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_463 = __VLS_asFunctionalComponent1(__VLS_462, new __VLS_462({
    ...{ 'onFocus': {} },
    modelValue: (__VLS_ctx.selectedFieldId),
    placeholder: "选择擅长领域",
    ...{ style: {} },
}));
const __VLS_464 = __VLS_463({
    ...{ 'onFocus': {} },
    modelValue: (__VLS_ctx.selectedFieldId),
    placeholder: "选择擅长领域",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_463));
let __VLS_467;
const __VLS_468 = ({ focus: {} },
    { onFocus: (__VLS_ctx.loadFieldOptions) });
const { default: __VLS_469 } = __VLS_465.slots;
for (const [f] of __VLS_vFor((__VLS_ctx.fieldOptions))) {
    let __VLS_470;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_471 = __VLS_asFunctionalComponent1(__VLS_470, new __VLS_470({
        key: (f.id),
        label: (f.name),
        value: (f.id),
    }));
    const __VLS_472 = __VLS_471({
        key: (f.id),
        label: (f.name),
        value: (f.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_471));
    // @ts-ignore
    [selectedFieldId, loadFieldOptions, fieldOptions,];
}
// @ts-ignore
[];
var __VLS_465;
var __VLS_466;
let __VLS_475;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_476 = __VLS_asFunctionalComponent1(__VLS_475, new __VLS_475({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.selectedFieldId),
}));
const __VLS_477 = __VLS_476({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.selectedFieldId),
}, ...__VLS_functionalComponentArgsRest(__VLS_476));
let __VLS_480;
const __VLS_481 = ({ click: {} },
    { onClick: (__VLS_ctx.addFieldTag) });
const { default: __VLS_482 } = __VLS_478.slots;
// @ts-ignore
[selectedFieldId, addFieldTag,];
var __VLS_478;
var __VLS_479;
if (__VLS_ctx.formData.fieldIds.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "qualification-tags" },
    });
    /** @type {__VLS_StyleScopedClasses['qualification-tags']} */ ;
    for (const [fid] of __VLS_vFor((__VLS_ctx.formData.fieldIds))) {
        let __VLS_483;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_484 = __VLS_asFunctionalComponent1(__VLS_483, new __VLS_483({
            ...{ 'onClose': {} },
            key: (fid),
            closable: true,
        }));
        const __VLS_485 = __VLS_484({
            ...{ 'onClose': {} },
            key: (fid),
            closable: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_484));
        let __VLS_488;
        const __VLS_489 = ({ close: {} },
            { onClose: (...[$event]) => {
                    if (!(__VLS_ctx.formData.fieldIds.length > 0))
                        return;
                    __VLS_ctx.removeFieldTag(fid);
                    // @ts-ignore
                    [formData, formData, removeFieldTag,];
                } });
        const { default: __VLS_490 } = __VLS_486.slots;
        (__VLS_ctx.getFieldName(fid));
        // @ts-ignore
        [getFieldName,];
        var __VLS_486;
        var __VLS_487;
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
var __VLS_459;
let __VLS_491;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_492 = __VLS_asFunctionalComponent1(__VLS_491, new __VLS_491({
    label: "状态",
}));
const __VLS_493 = __VLS_492({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_492));
const { default: __VLS_496 } = __VLS_494.slots;
let __VLS_497;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_498 = __VLS_asFunctionalComponent1(__VLS_497, new __VLS_497({
    modelValue: (__VLS_ctx.formData.status),
}));
const __VLS_499 = __VLS_498({
    modelValue: (__VLS_ctx.formData.status),
}, ...__VLS_functionalComponentArgsRest(__VLS_498));
const { default: __VLS_502 } = __VLS_500.slots;
let __VLS_503;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_504 = __VLS_asFunctionalComponent1(__VLS_503, new __VLS_503({
    label: (1),
}));
const __VLS_505 = __VLS_504({
    label: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_504));
const { default: __VLS_508 } = __VLS_506.slots;
// @ts-ignore
[formData,];
var __VLS_506;
let __VLS_509;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_510 = __VLS_asFunctionalComponent1(__VLS_509, new __VLS_509({
    label: (0),
}));
const __VLS_511 = __VLS_510({
    label: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_510));
const { default: __VLS_514 } = __VLS_512.slots;
// @ts-ignore
[];
var __VLS_512;
// @ts-ignore
[];
var __VLS_500;
// @ts-ignore
[];
var __VLS_494;
// @ts-ignore
[];
var __VLS_298;
{
    const { footer: __VLS_515 } = __VLS_292.slots;
    let __VLS_516;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_517 = __VLS_asFunctionalComponent1(__VLS_516, new __VLS_516({
        ...{ 'onClick': {} },
    }));
    const __VLS_518 = __VLS_517({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_517));
    let __VLS_521;
    const __VLS_522 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.formDialogVisible = false;
                // @ts-ignore
                [formDialogVisible,];
            } });
    const { default: __VLS_523 } = __VLS_519.slots;
    // @ts-ignore
    [];
    var __VLS_519;
    var __VLS_520;
    let __VLS_524;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_525 = __VLS_asFunctionalComponent1(__VLS_524, new __VLS_524({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.formLoading),
    }));
    const __VLS_526 = __VLS_525({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.formLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_525));
    let __VLS_529;
    const __VLS_530 = ({ click: {} },
        { onClick: (__VLS_ctx.submitForm) });
    const { default: __VLS_531 } = __VLS_527.slots;
    // @ts-ignore
    [formLoading, submitForm,];
    var __VLS_527;
    var __VLS_528;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_292;
let __VLS_532;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_533 = __VLS_asFunctionalComponent1(__VLS_532, new __VLS_532({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: "咨询师详情",
    width: "900px",
}));
const __VLS_534 = __VLS_533({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: "咨询师详情",
    width: "900px",
}, ...__VLS_functionalComponentArgsRest(__VLS_533));
const { default: __VLS_537 } = __VLS_535.slots;
if (__VLS_ctx.currentPsychologist) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-content" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
    let __VLS_538;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_539 = __VLS_asFunctionalComponent1(__VLS_538, new __VLS_538({
        column: (2),
        border: true,
    }));
    const __VLS_540 = __VLS_539({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_539));
    const { default: __VLS_543 } = __VLS_541.slots;
    let __VLS_544;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_545 = __VLS_asFunctionalComponent1(__VLS_544, new __VLS_544({
        label: "咨询师姓名",
    }));
    const __VLS_546 = __VLS_545({
        label: "咨询师姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_545));
    const { default: __VLS_549 } = __VLS_547.slots;
    (__VLS_ctx.currentPsychologist.realName || '-');
    // @ts-ignore
    [detailDialogVisible, currentPsychologist, currentPsychologist,];
    var __VLS_547;
    let __VLS_550;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_551 = __VLS_asFunctionalComponent1(__VLS_550, new __VLS_550({
        label: "用户名",
    }));
    const __VLS_552 = __VLS_551({
        label: "用户名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_551));
    const { default: __VLS_555 } = __VLS_553.slots;
    (__VLS_ctx.currentPsychologist.userNickname || '-');
    // @ts-ignore
    [currentPsychologist,];
    var __VLS_553;
    let __VLS_556;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_557 = __VLS_asFunctionalComponent1(__VLS_556, new __VLS_556({
        label: "性别",
    }));
    const __VLS_558 = __VLS_557({
        label: "性别",
    }, ...__VLS_functionalComponentArgsRest(__VLS_557));
    const { default: __VLS_561 } = __VLS_559.slots;
    (__VLS_ctx.currentPsychologist.sex === 1 ? '男' : __VLS_ctx.currentPsychologist.sex === 2 ? '女' : '-');
    // @ts-ignore
    [currentPsychologist, currentPsychologist,];
    var __VLS_559;
    let __VLS_562;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_563 = __VLS_asFunctionalComponent1(__VLS_562, new __VLS_562({
        label: "手机号",
    }));
    const __VLS_564 = __VLS_563({
        label: "手机号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_563));
    const { default: __VLS_567 } = __VLS_565.slots;
    (__VLS_ctx.currentPsychologist.phone || '-');
    // @ts-ignore
    [currentPsychologist,];
    var __VLS_565;
    let __VLS_568;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_569 = __VLS_asFunctionalComponent1(__VLS_568, new __VLS_568({
        label: "咨询定价",
    }));
    const __VLS_570 = __VLS_569({
        label: "咨询定价",
    }, ...__VLS_functionalComponentArgsRest(__VLS_569));
    const { default: __VLS_573 } = __VLS_571.slots;
    (__VLS_ctx.currentPsychologist.consultationPrice || '-');
    // @ts-ignore
    [currentPsychologist,];
    var __VLS_571;
    let __VLS_574;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_575 = __VLS_asFunctionalComponent1(__VLS_574, new __VLS_574({
        label: "咨询经验",
    }));
    const __VLS_576 = __VLS_575({
        label: "咨询经验",
    }, ...__VLS_functionalComponentArgsRest(__VLS_575));
    const { default: __VLS_579 } = __VLS_577.slots;
    (__VLS_ctx.currentPsychologist.yearsExperience || '-');
    // @ts-ignore
    [currentPsychologist,];
    var __VLS_577;
    let __VLS_580;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_581 = __VLS_asFunctionalComponent1(__VLS_580, new __VLS_580({
        label: "评分",
        span: (2),
    }));
    const __VLS_582 = __VLS_581({
        label: "评分",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_581));
    const { default: __VLS_585 } = __VLS_583.slots;
    (__VLS_ctx.currentPsychologist.rating ? __VLS_ctx.currentPsychologist.rating.toFixed(1) : '-');
    // @ts-ignore
    [currentPsychologist, currentPsychologist,];
    var __VLS_583;
    let __VLS_586;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_587 = __VLS_asFunctionalComponent1(__VLS_586, new __VLS_586({
        label: "咨询次数",
        span: (2),
    }));
    const __VLS_588 = __VLS_587({
        label: "咨询次数",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_587));
    const { default: __VLS_591 } = __VLS_589.slots;
    (__VLS_ctx.currentPsychologist.consultationCount || 0);
    // @ts-ignore
    [currentPsychologist,];
    var __VLS_589;
    let __VLS_592;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_593 = __VLS_asFunctionalComponent1(__VLS_592, new __VLS_592({
        label: "个人简介",
        span: (2),
    }));
    const __VLS_594 = __VLS_593({
        label: "个人简介",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_593));
    const { default: __VLS_597 } = __VLS_595.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bio-content" },
    });
    /** @type {__VLS_StyleScopedClasses['bio-content']} */ ;
    (__VLS_ctx.currentPsychologist.bio || '暂无简介');
    // @ts-ignore
    [currentPsychologist,];
    var __VLS_595;
    let __VLS_598;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_599 = __VLS_asFunctionalComponent1(__VLS_598, new __VLS_598({
        label: "状态",
    }));
    const __VLS_600 = __VLS_599({
        label: "状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_599));
    const { default: __VLS_603 } = __VLS_601.slots;
    let __VLS_604;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_605 = __VLS_asFunctionalComponent1(__VLS_604, new __VLS_604({
        type: (__VLS_ctx.currentPsychologist.status === 1 ? 'success' : 'danger'),
    }));
    const __VLS_606 = __VLS_605({
        type: (__VLS_ctx.currentPsychologist.status === 1 ? 'success' : 'danger'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_605));
    const { default: __VLS_609 } = __VLS_607.slots;
    (__VLS_ctx.currentPsychologist.status === 1 ? '已启用' : '已禁用');
    // @ts-ignore
    [currentPsychologist, currentPsychologist,];
    var __VLS_607;
    // @ts-ignore
    [];
    var __VLS_601;
    let __VLS_610;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_611 = __VLS_asFunctionalComponent1(__VLS_610, new __VLS_610({
        label: "在线状态",
    }));
    const __VLS_612 = __VLS_611({
        label: "在线状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_611));
    const { default: __VLS_615 } = __VLS_613.slots;
    let __VLS_616;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_617 = __VLS_asFunctionalComponent1(__VLS_616, new __VLS_616({
        type: (__VLS_ctx.currentPsychologist.onlineStatus === 1 ? 'success' : 'info'),
    }));
    const __VLS_618 = __VLS_617({
        type: (__VLS_ctx.currentPsychologist.onlineStatus === 1 ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_617));
    const { default: __VLS_621 } = __VLS_619.slots;
    (__VLS_ctx.currentPsychologist.onlineStatus === 1 ? '在线' : '离线');
    // @ts-ignore
    [currentPsychologist, currentPsychologist,];
    var __VLS_619;
    // @ts-ignore
    [];
    var __VLS_613;
    // @ts-ignore
    [];
    var __VLS_541;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section" },
    });
    /** @type {__VLS_StyleScopedClasses['section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    let __VLS_622;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_623 = __VLS_asFunctionalComponent1(__VLS_622, new __VLS_622({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_624 = __VLS_623({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_623));
    let __VLS_627;
    const __VLS_628 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.currentPsychologist))
                    return;
                __VLS_ctx.openFieldDialog('add');
                // @ts-ignore
                [openFieldDialog,];
            } });
    const { default: __VLS_629 } = __VLS_625.slots;
    let __VLS_630;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_631 = __VLS_asFunctionalComponent1(__VLS_630, new __VLS_630({}));
    const __VLS_632 = __VLS_631({}, ...__VLS_functionalComponentArgsRest(__VLS_631));
    const { default: __VLS_635 } = __VLS_633.slots;
    let __VLS_636;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_637 = __VLS_asFunctionalComponent1(__VLS_636, new __VLS_636({}));
    const __VLS_638 = __VLS_637({}, ...__VLS_functionalComponentArgsRest(__VLS_637));
    // @ts-ignore
    [];
    var __VLS_633;
    // @ts-ignore
    [];
    var __VLS_625;
    var __VLS_626;
    let __VLS_641;
    /** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
    elTable;
    // @ts-ignore
    const __VLS_642 = __VLS_asFunctionalComponent1(__VLS_641, new __VLS_641({
        data: (__VLS_ctx.psychologistFields),
        stripe: true,
        size: "small",
        maxHeight: "200",
    }));
    const __VLS_643 = __VLS_642({
        data: (__VLS_ctx.psychologistFields),
        stripe: true,
        size: "small",
        maxHeight: "200",
    }, ...__VLS_functionalComponentArgsRest(__VLS_642));
    const { default: __VLS_646 } = __VLS_644.slots;
    let __VLS_647;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_648 = __VLS_asFunctionalComponent1(__VLS_647, new __VLS_647({
        prop: "fieldName",
        label: "领域名称",
        minWidth: "120",
    }));
    const __VLS_649 = __VLS_648({
        prop: "fieldName",
        label: "领域名称",
        minWidth: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_648));
    let __VLS_652;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_653 = __VLS_asFunctionalComponent1(__VLS_652, new __VLS_652({
        prop: "fieldCode",
        label: "领域代码",
        width: "120",
    }));
    const __VLS_654 = __VLS_653({
        prop: "fieldCode",
        label: "领域代码",
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_653));
    let __VLS_657;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_658 = __VLS_asFunctionalComponent1(__VLS_657, new __VLS_657({
        prop: "subTags",
        label: "细分标签",
        minWidth: "150",
    }));
    const __VLS_659 = __VLS_658({
        prop: "subTags",
        label: "细分标签",
        minWidth: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_658));
    const { default: __VLS_662 } = __VLS_660.slots;
    {
        const { default: __VLS_663 } = __VLS_660.slots;
        const [scope] = __VLS_vSlot(__VLS_663);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (scope.row.subTags || '-');
        // @ts-ignore
        [psychologistFields,];
    }
    // @ts-ignore
    [];
    var __VLS_660;
    let __VLS_664;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_665 = __VLS_asFunctionalComponent1(__VLS_664, new __VLS_664({
        label: "操作",
        width: "120",
        fixed: "right",
    }));
    const __VLS_666 = __VLS_665({
        label: "操作",
        width: "120",
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_665));
    const { default: __VLS_669 } = __VLS_667.slots;
    {
        const { default: __VLS_670 } = __VLS_667.slots;
        const [scope] = __VLS_vSlot(__VLS_670);
        let __VLS_671;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_672 = __VLS_asFunctionalComponent1(__VLS_671, new __VLS_671({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
            link: true,
        }));
        const __VLS_673 = __VLS_672({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_672));
        let __VLS_676;
        const __VLS_677 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentPsychologist))
                        return;
                    __VLS_ctx.openFieldDialog('edit', scope.row);
                    // @ts-ignore
                    [openFieldDialog,];
                } });
        const { default: __VLS_678 } = __VLS_674.slots;
        // @ts-ignore
        [];
        var __VLS_674;
        var __VLS_675;
        let __VLS_679;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_680 = __VLS_asFunctionalComponent1(__VLS_679, new __VLS_679({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
            link: true,
        }));
        const __VLS_681 = __VLS_680({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_680));
        let __VLS_684;
        const __VLS_685 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentPsychologist))
                        return;
                    __VLS_ctx.deleteField(scope.row.id);
                    // @ts-ignore
                    [deleteField,];
                } });
        const { default: __VLS_686 } = __VLS_682.slots;
        // @ts-ignore
        [];
        var __VLS_682;
        var __VLS_683;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_667;
    // @ts-ignore
    [];
    var __VLS_644;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section" },
    });
    /** @type {__VLS_StyleScopedClasses['section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    let __VLS_687;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_688 = __VLS_asFunctionalComponent1(__VLS_687, new __VLS_687({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_689 = __VLS_688({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_688));
    let __VLS_692;
    const __VLS_693 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.currentPsychologist))
                    return;
                __VLS_ctx.openQualificationDialog('add');
                // @ts-ignore
                [openQualificationDialog,];
            } });
    const { default: __VLS_694 } = __VLS_690.slots;
    let __VLS_695;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_696 = __VLS_asFunctionalComponent1(__VLS_695, new __VLS_695({}));
    const __VLS_697 = __VLS_696({}, ...__VLS_functionalComponentArgsRest(__VLS_696));
    const { default: __VLS_700 } = __VLS_698.slots;
    let __VLS_701;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_702 = __VLS_asFunctionalComponent1(__VLS_701, new __VLS_701({}));
    const __VLS_703 = __VLS_702({}, ...__VLS_functionalComponentArgsRest(__VLS_702));
    // @ts-ignore
    [];
    var __VLS_698;
    // @ts-ignore
    [];
    var __VLS_690;
    var __VLS_691;
    let __VLS_706;
    /** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
    elTable;
    // @ts-ignore
    const __VLS_707 = __VLS_asFunctionalComponent1(__VLS_706, new __VLS_706({
        data: (__VLS_ctx.psychologistQualifications),
        stripe: true,
        size: "small",
        maxHeight: "200",
    }));
    const __VLS_708 = __VLS_707({
        data: (__VLS_ctx.psychologistQualifications),
        stripe: true,
        size: "small",
        maxHeight: "200",
    }, ...__VLS_functionalComponentArgsRest(__VLS_707));
    const { default: __VLS_711 } = __VLS_709.slots;
    let __VLS_712;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_713 = __VLS_asFunctionalComponent1(__VLS_712, new __VLS_712({
        prop: "qualificationName",
        label: "资质名称",
        minWidth: "150",
    }));
    const __VLS_714 = __VLS_713({
        prop: "qualificationName",
        label: "资质名称",
        minWidth: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_713));
    let __VLS_717;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_718 = __VLS_asFunctionalComponent1(__VLS_717, new __VLS_717({
        prop: "qualificationCode",
        label: "资质代码",
        width: "120",
    }));
    const __VLS_719 = __VLS_718({
        prop: "qualificationCode",
        label: "资质代码",
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_718));
    let __VLS_722;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_723 = __VLS_asFunctionalComponent1(__VLS_722, new __VLS_722({
        prop: "certificateUrl",
        label: "证书图片",
        minWidth: "150",
    }));
    const __VLS_724 = __VLS_723({
        prop: "certificateUrl",
        label: "证书图片",
        minWidth: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_723));
    const { default: __VLS_727 } = __VLS_725.slots;
    {
        const { default: __VLS_728 } = __VLS_725.slots;
        const [scope] = __VLS_vSlot(__VLS_728);
        if (scope.row.certificateUrl) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (scope.row.certificateUrl);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
        // @ts-ignore
        [psychologistQualifications,];
    }
    // @ts-ignore
    [];
    var __VLS_725;
    let __VLS_729;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_730 = __VLS_asFunctionalComponent1(__VLS_729, new __VLS_729({
        prop: "isVerified",
        label: "认证状态",
        width: "100",
    }));
    const __VLS_731 = __VLS_730({
        prop: "isVerified",
        label: "认证状态",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_730));
    const { default: __VLS_734 } = __VLS_732.slots;
    {
        const { default: __VLS_735 } = __VLS_732.slots;
        const [scope] = __VLS_vSlot(__VLS_735);
        let __VLS_736;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_737 = __VLS_asFunctionalComponent1(__VLS_736, new __VLS_736({
            type: (scope.row.isVerified === 1 ? 'success' : 'info'),
            size: "small",
        }));
        const __VLS_738 = __VLS_737({
            type: (scope.row.isVerified === 1 ? 'success' : 'info'),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_737));
        const { default: __VLS_741 } = __VLS_739.slots;
        (scope.row.isVerified === 1 ? '已认证' : '未认证');
        // @ts-ignore
        [];
        var __VLS_739;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_732;
    let __VLS_742;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_743 = __VLS_asFunctionalComponent1(__VLS_742, new __VLS_742({
        label: "操作",
        width: "120",
        fixed: "right",
    }));
    const __VLS_744 = __VLS_743({
        label: "操作",
        width: "120",
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_743));
    const { default: __VLS_747 } = __VLS_745.slots;
    {
        const { default: __VLS_748 } = __VLS_745.slots;
        const [scope] = __VLS_vSlot(__VLS_748);
        let __VLS_749;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_750 = __VLS_asFunctionalComponent1(__VLS_749, new __VLS_749({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
            link: true,
        }));
        const __VLS_751 = __VLS_750({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_750));
        let __VLS_754;
        const __VLS_755 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentPsychologist))
                        return;
                    __VLS_ctx.openQualificationDialog('edit', scope.row);
                    // @ts-ignore
                    [openQualificationDialog,];
                } });
        const { default: __VLS_756 } = __VLS_752.slots;
        // @ts-ignore
        [];
        var __VLS_752;
        var __VLS_753;
        let __VLS_757;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_758 = __VLS_asFunctionalComponent1(__VLS_757, new __VLS_757({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
            link: true,
        }));
        const __VLS_759 = __VLS_758({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_758));
        let __VLS_762;
        const __VLS_763 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentPsychologist))
                        return;
                    __VLS_ctx.deleteQualification(scope.row.id);
                    // @ts-ignore
                    [deleteQualification,];
                } });
        const { default: __VLS_764 } = __VLS_760.slots;
        // @ts-ignore
        [];
        var __VLS_760;
        var __VLS_761;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_745;
    // @ts-ignore
    [];
    var __VLS_709;
}
// @ts-ignore
[];
var __VLS_535;
let __VLS_765;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_766 = __VLS_asFunctionalComponent1(__VLS_765, new __VLS_765({
    modelValue: (__VLS_ctx.fieldDialogVisible),
    title: (__VLS_ctx.fieldDialogType === 'add' ? '添加擅长领域' : '编辑擅长领域'),
    width: "500px",
}));
const __VLS_767 = __VLS_766({
    modelValue: (__VLS_ctx.fieldDialogVisible),
    title: (__VLS_ctx.fieldDialogType === 'add' ? '添加擅长领域' : '编辑擅长领域'),
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_766));
const { default: __VLS_770 } = __VLS_768.slots;
let __VLS_771;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_772 = __VLS_asFunctionalComponent1(__VLS_771, new __VLS_771({
    model: (__VLS_ctx.fieldForm),
    labelWidth: "100px",
}));
const __VLS_773 = __VLS_772({
    model: (__VLS_ctx.fieldForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_772));
const { default: __VLS_776 } = __VLS_774.slots;
let __VLS_777;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_778 = __VLS_asFunctionalComponent1(__VLS_777, new __VLS_777({
    label: "咨询领域",
    required: true,
}));
const __VLS_779 = __VLS_778({
    label: "咨询领域",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_778));
const { default: __VLS_782 } = __VLS_780.slots;
let __VLS_783;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_784 = __VLS_asFunctionalComponent1(__VLS_783, new __VLS_783({
    modelValue: (__VLS_ctx.fieldForm.fieldId),
    placeholder: "请选择咨询领域",
    ...{ style: {} },
}));
const __VLS_785 = __VLS_784({
    modelValue: (__VLS_ctx.fieldForm.fieldId),
    placeholder: "请选择咨询领域",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_784));
const { default: __VLS_788 } = __VLS_786.slots;
for (const [item] of __VLS_vFor((__VLS_ctx.fieldOptions))) {
    let __VLS_789;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_790 = __VLS_asFunctionalComponent1(__VLS_789, new __VLS_789({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }));
    const __VLS_791 = __VLS_790({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_790));
    // @ts-ignore
    [fieldOptions, fieldDialogVisible, fieldDialogType, fieldForm, fieldForm,];
}
// @ts-ignore
[];
var __VLS_786;
// @ts-ignore
[];
var __VLS_780;
let __VLS_794;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_795 = __VLS_asFunctionalComponent1(__VLS_794, new __VLS_794({
    label: "细分标签",
}));
const __VLS_796 = __VLS_795({
    label: "细分标签",
}, ...__VLS_functionalComponentArgsRest(__VLS_795));
const { default: __VLS_799 } = __VLS_797.slots;
let __VLS_800;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_801 = __VLS_asFunctionalComponent1(__VLS_800, new __VLS_800({
    modelValue: (__VLS_ctx.fieldForm.subTags),
    placeholder: "多个标签用逗号分隔",
}));
const __VLS_802 = __VLS_801({
    modelValue: (__VLS_ctx.fieldForm.subTags),
    placeholder: "多个标签用逗号分隔",
}, ...__VLS_functionalComponentArgsRest(__VLS_801));
// @ts-ignore
[fieldForm,];
var __VLS_797;
// @ts-ignore
[];
var __VLS_774;
{
    const { footer: __VLS_805 } = __VLS_768.slots;
    let __VLS_806;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_807 = __VLS_asFunctionalComponent1(__VLS_806, new __VLS_806({
        ...{ 'onClick': {} },
    }));
    const __VLS_808 = __VLS_807({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_807));
    let __VLS_811;
    const __VLS_812 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.fieldDialogVisible = false;
                // @ts-ignore
                [fieldDialogVisible,];
            } });
    const { default: __VLS_813 } = __VLS_809.slots;
    // @ts-ignore
    [];
    var __VLS_809;
    var __VLS_810;
    let __VLS_814;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_815 = __VLS_asFunctionalComponent1(__VLS_814, new __VLS_814({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.fieldLoading),
    }));
    const __VLS_816 = __VLS_815({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.fieldLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_815));
    let __VLS_819;
    const __VLS_820 = ({ click: {} },
        { onClick: (__VLS_ctx.saveField) });
    const { default: __VLS_821 } = __VLS_817.slots;
    // @ts-ignore
    [fieldLoading, saveField,];
    var __VLS_817;
    var __VLS_818;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_768;
let __VLS_822;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_823 = __VLS_asFunctionalComponent1(__VLS_822, new __VLS_822({
    modelValue: (__VLS_ctx.qualificationDialogVisible),
    title: (__VLS_ctx.qualificationDialogType === 'add' ? '添加资质' : '编辑资质'),
    width: "500px",
}));
const __VLS_824 = __VLS_823({
    modelValue: (__VLS_ctx.qualificationDialogVisible),
    title: (__VLS_ctx.qualificationDialogType === 'add' ? '添加资质' : '编辑资质'),
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_823));
const { default: __VLS_827 } = __VLS_825.slots;
let __VLS_828;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_829 = __VLS_asFunctionalComponent1(__VLS_828, new __VLS_828({
    model: (__VLS_ctx.qualificationForm),
    labelWidth: "100px",
}));
const __VLS_830 = __VLS_829({
    model: (__VLS_ctx.qualificationForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_829));
const { default: __VLS_833 } = __VLS_831.slots;
let __VLS_834;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_835 = __VLS_asFunctionalComponent1(__VLS_834, new __VLS_834({
    label: "资质类型",
    required: true,
}));
const __VLS_836 = __VLS_835({
    label: "资质类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_835));
const { default: __VLS_839 } = __VLS_837.slots;
let __VLS_840;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_841 = __VLS_asFunctionalComponent1(__VLS_840, new __VLS_840({
    modelValue: (__VLS_ctx.qualificationForm.qualificationId),
    placeholder: "请选择资质类型",
    ...{ style: {} },
}));
const __VLS_842 = __VLS_841({
    modelValue: (__VLS_ctx.qualificationForm.qualificationId),
    placeholder: "请选择资质类型",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_841));
const { default: __VLS_845 } = __VLS_843.slots;
for (const [item] of __VLS_vFor((__VLS_ctx.qualificationOptions))) {
    let __VLS_846;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_847 = __VLS_asFunctionalComponent1(__VLS_846, new __VLS_846({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }));
    const __VLS_848 = __VLS_847({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_847));
    // @ts-ignore
    [qualificationOptions, qualificationDialogVisible, qualificationDialogType, qualificationForm, qualificationForm,];
}
// @ts-ignore
[];
var __VLS_843;
// @ts-ignore
[];
var __VLS_837;
let __VLS_851;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_852 = __VLS_asFunctionalComponent1(__VLS_851, new __VLS_851({
    label: "证书图片",
}));
const __VLS_853 = __VLS_852({
    label: "证书图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_852));
const { default: __VLS_856 } = __VLS_854.slots;
let __VLS_857;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_858 = __VLS_asFunctionalComponent1(__VLS_857, new __VLS_857({
    ...{ class: "certificate-uploader" },
    action: "/api/psychologist-apply/upload",
    headers: ({ token: __VLS_ctx.token }),
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleCertificateSuccess),
    beforeUpload: (__VLS_ctx.beforeCertificateUpload),
    accept: "image/*",
}));
const __VLS_859 = __VLS_858({
    ...{ class: "certificate-uploader" },
    action: "/api/psychologist-apply/upload",
    headers: ({ token: __VLS_ctx.token }),
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleCertificateSuccess),
    beforeUpload: (__VLS_ctx.beforeCertificateUpload),
    accept: "image/*",
}, ...__VLS_functionalComponentArgsRest(__VLS_858));
/** @type {__VLS_StyleScopedClasses['certificate-uploader']} */ ;
const { default: __VLS_862 } = __VLS_860.slots;
if (__VLS_ctx.qualificationForm.certificateUrl) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.qualificationForm.certificateUrl),
        ...{ class: "certificate-preview" },
    });
    /** @type {__VLS_StyleScopedClasses['certificate-preview']} */ ;
}
else {
    let __VLS_863;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_864 = __VLS_asFunctionalComponent1(__VLS_863, new __VLS_863({
        ...{ class: "certificate-uploader-icon" },
    }));
    const __VLS_865 = __VLS_864({
        ...{ class: "certificate-uploader-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_864));
    /** @type {__VLS_StyleScopedClasses['certificate-uploader-icon']} */ ;
    const { default: __VLS_868 } = __VLS_866.slots;
    let __VLS_869;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_870 = __VLS_asFunctionalComponent1(__VLS_869, new __VLS_869({}));
    const __VLS_871 = __VLS_870({}, ...__VLS_functionalComponentArgsRest(__VLS_870));
    // @ts-ignore
    [token, qualificationForm, qualificationForm, handleCertificateSuccess, beforeCertificateUpload,];
    var __VLS_866;
}
// @ts-ignore
[];
var __VLS_860;
// @ts-ignore
[];
var __VLS_854;
let __VLS_874;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_875 = __VLS_asFunctionalComponent1(__VLS_874, new __VLS_874({
    label: "认证状态",
}));
const __VLS_876 = __VLS_875({
    label: "认证状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_875));
const { default: __VLS_879 } = __VLS_877.slots;
let __VLS_880;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_881 = __VLS_asFunctionalComponent1(__VLS_880, new __VLS_880({
    modelValue: (__VLS_ctx.qualificationForm.isVerified),
}));
const __VLS_882 = __VLS_881({
    modelValue: (__VLS_ctx.qualificationForm.isVerified),
}, ...__VLS_functionalComponentArgsRest(__VLS_881));
const { default: __VLS_885 } = __VLS_883.slots;
let __VLS_886;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_887 = __VLS_asFunctionalComponent1(__VLS_886, new __VLS_886({
    label: (1),
}));
const __VLS_888 = __VLS_887({
    label: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_887));
const { default: __VLS_891 } = __VLS_889.slots;
// @ts-ignore
[qualificationForm,];
var __VLS_889;
let __VLS_892;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_893 = __VLS_asFunctionalComponent1(__VLS_892, new __VLS_892({
    label: (0),
}));
const __VLS_894 = __VLS_893({
    label: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_893));
const { default: __VLS_897 } = __VLS_895.slots;
// @ts-ignore
[];
var __VLS_895;
// @ts-ignore
[];
var __VLS_883;
// @ts-ignore
[];
var __VLS_877;
// @ts-ignore
[];
var __VLS_831;
{
    const { footer: __VLS_898 } = __VLS_825.slots;
    let __VLS_899;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_900 = __VLS_asFunctionalComponent1(__VLS_899, new __VLS_899({
        ...{ 'onClick': {} },
    }));
    const __VLS_901 = __VLS_900({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_900));
    let __VLS_904;
    const __VLS_905 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.qualificationDialogVisible = false;
                // @ts-ignore
                [qualificationDialogVisible,];
            } });
    const { default: __VLS_906 } = __VLS_902.slots;
    // @ts-ignore
    [];
    var __VLS_902;
    var __VLS_903;
    let __VLS_907;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_908 = __VLS_asFunctionalComponent1(__VLS_907, new __VLS_907({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.qualificationLoading),
    }));
    const __VLS_909 = __VLS_908({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.qualificationLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_908));
    let __VLS_912;
    const __VLS_913 = ({ click: {} },
        { onClick: (__VLS_ctx.saveQualification) });
    const { default: __VLS_914 } = __VLS_910.slots;
    // @ts-ignore
    [qualificationLoading, saveQualification,];
    var __VLS_910;
    var __VLS_911;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_825;
// @ts-ignore
var __VLS_301 = __VLS_300;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
