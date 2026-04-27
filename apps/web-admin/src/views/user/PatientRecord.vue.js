/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, reactive } from 'vue';
import request from '@/api/user';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
const patients = ref([]);
const activePatientId = ref('');
const records = ref([]);
const loadingRecords = ref(false);
const calculateAge = (birthday) => {
    if (!birthday)
        return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};
const fetchPatients = async () => {
    try {
        const res = await request.get('/patient/list');
        if (res.code === 200) {
            patients.value = res.data;
            if (patients.value.length > 0 && !activePatientId.value) {
                activePatientId.value = String(patients.value[0].id);
                fetchRecords(activePatientId.value);
            }
        }
    }
    catch (e) { }
};
const fetchRecords = async (patientId) => {
    loadingRecords.value = true;
    try {
        const res = await request.get(`/medical-record/list/${patientId}`);
        if (res.code === 200) {
            records.value = res.data;
        }
    }
    catch (e) { }
    finally {
        loadingRecords.value = false;
    }
};
const handleTabClick = (tab) => {
    fetchRecords(tab.paneName);
};
// Patient Dialog Logic
const patientDialogVisible = ref(false);
const patientForm = reactive({
    id: null,
    name: '',
    sex: 1,
    birthday: '',
    relationship: ''
});
const handleAddPatient = () => {
    Object.assign(patientForm, { id: null, name: '', sex: 1, birthday: '', relationship: '' });
    patientDialogVisible.value = true;
};
const handleEditPatient = (patient) => {
    Object.assign(patientForm, patient);
    patientDialogVisible.value = true;
};
const submitPatient = async () => {
    if (!patientForm.name || !patientForm.birthday || !patientForm.relationship) {
        ElMessage.warning('请填写完整信息');
        return;
    }
    const url = patientForm.id ? '/patient/update' : '/patient/add';
    const method = patientForm.id ? 'put' : 'post';
    try {
        const res = await request[method](url, patientForm);
        if (res.code === 200) {
            ElMessage.success('保存成功');
            patientDialogVisible.value = false;
            fetchPatients();
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) { }
};
const handleDeletePatient = (id) => {
    ElMessageBox.confirm('确定要删除该就诊人吗？其相关的病历也将无法通过该入口查看。', '警告', { type: 'warning' }).then(async () => {
        const res = await request.delete(`/patient/${id}`);
        if (res.code === 200) {
            ElMessage.success('删除成功');
            activePatientId.value = '';
            fetchPatients();
        }
    });
};
// Record Dialog Logic
const recordDialogVisible = ref(false);
const isViewOnly = ref(false);
const fileList = ref([]);
const recordForm = reactive({
    id: null,
    patientContactId: null,
    visitDate: '',
    department: '',
    hospital: '',
    symptoms: '',
    remarks: '',
    images: []
});
// const uploadHeaders = {
//   token: localStorage.getItem('token')
// }
const handleAddRecord = () => {
    isViewOnly.value = false;
    fileList.value = [];
    Object.assign(recordForm, {
        id: null,
        patientContactId: Number(activePatientId.value),
        visitDate: new Date().toISOString().split('T')[0],
        department: '',
        hospital: '',
        symptoms: '',
        remarks: '',
        images: []
    });
    recordDialogVisible.value = true;
};
const handleViewRecord = (record) => {
    isViewOnly.value = true;
    Object.assign(recordForm, {
        ...record,
        images: record.images ? [...record.images] : []
    });
    fileList.value = record.images ? record.images.map((url) => ({
        name: url.substring(url.lastIndexOf('/') + 1),
        url: url
    })) : [];
    recordDialogVisible.value = true;
};
const handleUploadError = (error) => {
    let message = '上传失败';
    try {
        const response = JSON.parse(error.message);
        message = response.message || message;
    }
    catch (e) {
        if (error.message && error.message.includes('400')) {
            message = '文件上传异常,文件不能超过3MB';
        }
    }
    ElMessage.error(message);
};
const beforeUpload = (file) => {
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
        ElMessage.error('上传图片大小不能超过 3MB!');
        return false;
    }
    // Store file locally instead of uploading
    fileList.value.push(file);
    return false; // Prevent auto upload
};
const handleRemoveImage = (file) => {
    const index = fileList.value.indexOf(file);
    if (index > -1) {
        fileList.value.splice(index, 1);
    }
    // Also check recordForm.images (existing remote images)
    if (file.url && !file.raw) {
        const urlIndex = recordForm.images.indexOf(file.url);
        if (urlIndex > -1) {
            recordForm.images.splice(urlIndex, 1);
        }
    }
};
const handleChange = (uploadFile, uploadFiles) => {
    fileList.value = uploadFiles;
    if (uploadFile.size / 1024 / 1024 > 3) {
        ElMessage.error('上传图片大小不能超过 3MB!');
        const idx = fileList.value.indexOf(uploadFile);
        if (idx > -1)
            fileList.value.splice(idx, 1);
    }
};
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'medical-record');
    // Manual upload request
    // Note: 'request' instance handles base URL, but we need to set Content-Type if not auto
    // Using axios directly or existing request wrapper?
    // request wrapper usually handles JSON. For FormData, axios usually auto-detects.
    // Let's try using the existing request wrapper.
    return request.post('/common/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
const submitRecord = async () => {
    if (!recordForm.visitDate || !recordForm.department || !recordForm.symptoms) {
        ElMessage.warning('请填写必填项');
        return;
    }
    // Upload pending files
    const pendingFiles = fileList.value.filter((f) => f.raw);
    const newImageUrls = [];
    if (pendingFiles.length > 0) {
        const loading = ElLoading.service({
            text: '正在上传图片...'
        });
        try {
            for (const file of pendingFiles) {
                const res = await uploadFile(file.raw);
                if (res.code === 200) {
                    newImageUrls.push(res.data);
                }
                else {
                    throw new Error(res.message || '上传失败');
                }
            }
            loading.close();
        }
        catch (e) {
            loading.close();
            ElMessage.error(e.message || '图片上传失败');
            return;
        }
    }
    // Combine existing images and new images
    // Existing images are already in recordForm.images (filtered by remove handler)
    // Wait, handleRemoveImage logic above might need adjustment.
    // When opening dialog: fileList is populated from record.images.
    // If user removes one, we should remove from recordForm.images.
    // If user adds one, it goes to fileList (as raw file).
    // So final images list = (recordForm.images - removed) + newImageUrls
    // Actually, let's just use a clean approach:
    // 1. Existing remote images are in `recordForm.images`.
    // 2. New local files are in `fileList` with `raw` property.
    // 3. `fileList` also contains existing images for display.
    // Let's refine handleRemoveImage and submit logic.
    const finalImages = [...recordForm.images, ...newImageUrls];
    const url = recordForm.id ? '/medical-record/update' : '/medical-record/add';
    const method = recordForm.id ? 'put' : 'post';
    try {
        const res = await request[method](url, {
            record: {
                id: recordForm.id,
                patientContactId: recordForm.patientContactId,
                visitDate: recordForm.visitDate,
                department: recordForm.department,
                hospital: recordForm.hospital,
                symptoms: recordForm.symptoms,
                remarks: recordForm.remarks
            },
            images: finalImages
        });
        if (res.code === 200) {
            ElMessage.success('保存成功');
            recordDialogVisible.value = false;
            fetchRecords(activePatientId.value);
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) { }
};
const handleDeleteRecord = (id) => {
    ElMessageBox.confirm('确定要删除该病历记录吗？', '提示', { type: 'warning' }).then(async () => {
        const res = await request.delete(`/medical-record/${id}`);
        if (res.code === 200) {
            ElMessage.success('删除成功');
            fetchRecords(activePatientId.value);
        }
    });
};
onMounted(() => {
    fetchPatients();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "patient-record-container" },
});
/** @type {__VLS_StyleScopedClasses['patient-record-container']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "box-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "box-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['box-card']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
{
    const { header: __VLS_6 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_7;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_12;
    const __VLS_13 = ({ click: {} },
        { onClick: (__VLS_ctx.handleAddPatient) });
    const { default: __VLS_14 } = __VLS_10.slots;
    // @ts-ignore
    [handleAddPatient,];
    var __VLS_10;
    var __VLS_11;
    // @ts-ignore
    [];
}
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    ...{ 'onTabClick': {} },
    modelValue: (__VLS_ctx.activePatientId),
}));
const __VLS_17 = __VLS_16({
    ...{ 'onTabClick': {} },
    modelValue: (__VLS_ctx.activePatientId),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_20;
const __VLS_21 = ({ tabClick: {} },
    { onTabClick: (__VLS_ctx.handleTabClick) });
const { default: __VLS_22 } = __VLS_18.slots;
for (const [patient] of __VLS_vFor((__VLS_ctx.patients))) {
    let __VLS_23;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        key: (patient.id),
        label: (patient.name),
        name: (String(patient.id)),
    }));
    const __VLS_25 = __VLS_24({
        key: (patient.id),
        label: (patient.name),
        name: (String(patient.id)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    const { default: __VLS_28 } = __VLS_26.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "patient-info-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['patient-info-bar']} */ ;
    let __VLS_29;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        column: (3),
        border: true,
    }));
    const __VLS_31 = __VLS_30({
        column: (3),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    const { default: __VLS_34 } = __VLS_32.slots;
    let __VLS_35;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        label: "姓名",
    }));
    const __VLS_37 = __VLS_36({
        label: "姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    const { default: __VLS_40 } = __VLS_38.slots;
    (patient.name);
    // @ts-ignore
    [activePatientId, handleTabClick, patients,];
    var __VLS_38;
    let __VLS_41;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        label: "年龄",
    }));
    const __VLS_43 = __VLS_42({
        label: "年龄",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    const { default: __VLS_46 } = __VLS_44.slots;
    (__VLS_ctx.calculateAge(patient.birthday));
    // @ts-ignore
    [calculateAge,];
    var __VLS_44;
    let __VLS_47;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
        label: "性别",
    }));
    const __VLS_49 = __VLS_48({
        label: "性别",
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    const { default: __VLS_52 } = __VLS_50.slots;
    (patient.sex === 1 ? '男' : '女');
    // @ts-ignore
    [];
    var __VLS_50;
    let __VLS_53;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
        label: "关系",
    }));
    const __VLS_55 = __VLS_54({
        label: "关系",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    const { default: __VLS_58 } = __VLS_56.slots;
    (patient.relationship);
    // @ts-ignore
    [];
    var __VLS_56;
    let __VLS_59;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
        label: "操作",
    }));
    const __VLS_61 = __VLS_60({
        label: "操作",
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    const { default: __VLS_64 } = __VLS_62.slots;
    let __VLS_65;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_67 = __VLS_66({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    let __VLS_70;
    const __VLS_71 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleEditPatient(patient);
                // @ts-ignore
                [handleEditPatient,];
            } });
    const { default: __VLS_72 } = __VLS_68.slots;
    // @ts-ignore
    [];
    var __VLS_68;
    var __VLS_69;
    let __VLS_73;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_75 = __VLS_74({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    let __VLS_78;
    const __VLS_79 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDeletePatient(patient.id);
                // @ts-ignore
                [handleDeletePatient,];
            } });
    const { default: __VLS_80 } = __VLS_76.slots;
    // @ts-ignore
    [];
    var __VLS_76;
    var __VLS_77;
    // @ts-ignore
    [];
    var __VLS_62;
    // @ts-ignore
    [];
    var __VLS_32;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "records-section" },
    });
    /** @type {__VLS_StyleScopedClasses['records-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    let __VLS_81;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
        ...{ 'onClick': {} },
        type: "success",
        size: "small",
    }));
    const __VLS_83 = __VLS_82({
        ...{ 'onClick': {} },
        type: "success",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    let __VLS_86;
    const __VLS_87 = ({ click: {} },
        { onClick: (__VLS_ctx.handleAddRecord) });
    const { default: __VLS_88 } = __VLS_84.slots;
    // @ts-ignore
    [handleAddRecord,];
    var __VLS_84;
    var __VLS_85;
    let __VLS_89;
    /** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
    elTable;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
        data: (__VLS_ctx.records),
        ...{ style: {} },
    }));
    const __VLS_91 = __VLS_90({
        data: (__VLS_ctx.records),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingRecords) }, null, null);
    const { default: __VLS_94 } = __VLS_92.slots;
    let __VLS_95;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
        prop: "visitDate",
        label: "就诊日期",
        width: "120",
    }));
    const __VLS_97 = __VLS_96({
        prop: "visitDate",
        label: "就诊日期",
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    let __VLS_100;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
        prop: "department",
        label: "科室",
        width: "120",
    }));
    const __VLS_102 = __VLS_101({
        prop: "department",
        label: "科室",
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    let __VLS_105;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
        prop: "hospital",
        label: "医院",
        width: "180",
    }));
    const __VLS_107 = __VLS_106({
        prop: "hospital",
        label: "医院",
        width: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    let __VLS_110;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
        prop: "symptoms",
        label: "病症",
        showOverflowTooltip: true,
    }));
    const __VLS_112 = __VLS_111({
        prop: "symptoms",
        label: "病症",
        showOverflowTooltip: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    let __VLS_115;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
        label: "操作",
        width: "150",
    }));
    const __VLS_117 = __VLS_116({
        label: "操作",
        width: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    const { default: __VLS_120 } = __VLS_118.slots;
    {
        const { default: __VLS_121 } = __VLS_118.slots;
        const [scope] = __VLS_vSlot(__VLS_121);
        let __VLS_122;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
            ...{ 'onClick': {} },
            size: "small",
        }));
        const __VLS_124 = __VLS_123({
            ...{ 'onClick': {} },
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_123));
        let __VLS_127;
        const __VLS_128 = ({ click: {} },
            { onClick: (...[$event]) => {
                    __VLS_ctx.handleViewRecord(scope.row);
                    // @ts-ignore
                    [records, vLoading, loadingRecords, handleViewRecord,];
                } });
        const { default: __VLS_129 } = __VLS_125.slots;
        // @ts-ignore
        [];
        var __VLS_125;
        var __VLS_126;
        let __VLS_130;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_132 = __VLS_131({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        let __VLS_135;
        const __VLS_136 = ({ click: {} },
            { onClick: (...[$event]) => {
                    __VLS_ctx.handleDeleteRecord(scope.row.id);
                    // @ts-ignore
                    [handleDeleteRecord,];
                } });
        const { default: __VLS_137 } = __VLS_133.slots;
        // @ts-ignore
        [];
        var __VLS_133;
        var __VLS_134;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_118;
    // @ts-ignore
    [];
    var __VLS_92;
    // @ts-ignore
    [];
    var __VLS_26;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_18;
var __VLS_19;
if (__VLS_ctx.patients.length === 0) {
    let __VLS_138;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
        description: "暂无就诊人信息，请添加",
    }));
    const __VLS_140 = __VLS_139({
        description: "暂无就诊人信息，请添加",
    }, ...__VLS_functionalComponentArgsRest(__VLS_139));
}
// @ts-ignore
[patients,];
var __VLS_3;
let __VLS_143;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
    modelValue: (__VLS_ctx.patientDialogVisible),
    title: (__VLS_ctx.patientForm.id ? '修改就诊人' : '添加就诊人'),
    width: "400px",
}));
const __VLS_145 = __VLS_144({
    modelValue: (__VLS_ctx.patientDialogVisible),
    title: (__VLS_ctx.patientForm.id ? '修改就诊人' : '添加就诊人'),
    width: "400px",
}, ...__VLS_functionalComponentArgsRest(__VLS_144));
const { default: __VLS_148 } = __VLS_146.slots;
let __VLS_149;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({
    model: (__VLS_ctx.patientForm),
    labelWidth: "80px",
}));
const __VLS_151 = __VLS_150({
    model: (__VLS_ctx.patientForm),
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
const { default: __VLS_154 } = __VLS_152.slots;
let __VLS_155;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155({
    label: "姓名",
    required: true,
}));
const __VLS_157 = __VLS_156({
    label: "姓名",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_156));
const { default: __VLS_160 } = __VLS_158.slots;
let __VLS_161;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
    modelValue: (__VLS_ctx.patientForm.name),
}));
const __VLS_163 = __VLS_162({
    modelValue: (__VLS_ctx.patientForm.name),
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
// @ts-ignore
[patientDialogVisible, patientForm, patientForm, patientForm,];
var __VLS_158;
let __VLS_166;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_167 = __VLS_asFunctionalComponent1(__VLS_166, new __VLS_166({
    label: "性别",
    required: true,
}));
const __VLS_168 = __VLS_167({
    label: "性别",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_167));
const { default: __VLS_171 } = __VLS_169.slots;
let __VLS_172;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent1(__VLS_172, new __VLS_172({
    modelValue: (__VLS_ctx.patientForm.sex),
}));
const __VLS_174 = __VLS_173({
    modelValue: (__VLS_ctx.patientForm.sex),
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
const { default: __VLS_177 } = __VLS_175.slots;
let __VLS_178;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_179 = __VLS_asFunctionalComponent1(__VLS_178, new __VLS_178({
    label: (1),
}));
const __VLS_180 = __VLS_179({
    label: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_179));
const { default: __VLS_183 } = __VLS_181.slots;
// @ts-ignore
[patientForm,];
var __VLS_181;
let __VLS_184;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent1(__VLS_184, new __VLS_184({
    label: (2),
}));
const __VLS_186 = __VLS_185({
    label: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
const { default: __VLS_189 } = __VLS_187.slots;
// @ts-ignore
[];
var __VLS_187;
// @ts-ignore
[];
var __VLS_175;
// @ts-ignore
[];
var __VLS_169;
let __VLS_190;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_191 = __VLS_asFunctionalComponent1(__VLS_190, new __VLS_190({
    label: "出生日期",
    required: true,
}));
const __VLS_192 = __VLS_191({
    label: "出生日期",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_191));
const { default: __VLS_195 } = __VLS_193.slots;
let __VLS_196;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker | typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent1(__VLS_196, new __VLS_196({
    modelValue: (__VLS_ctx.patientForm.birthday),
    type: "date",
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}));
const __VLS_198 = __VLS_197({
    modelValue: (__VLS_ctx.patientForm.birthday),
    type: "date",
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
// @ts-ignore
[patientForm,];
var __VLS_193;
let __VLS_201;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_202 = __VLS_asFunctionalComponent1(__VLS_201, new __VLS_201({
    label: "关系",
    required: true,
}));
const __VLS_203 = __VLS_202({
    label: "关系",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_202));
const { default: __VLS_206 } = __VLS_204.slots;
let __VLS_207;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_208 = __VLS_asFunctionalComponent1(__VLS_207, new __VLS_207({
    modelValue: (__VLS_ctx.patientForm.relationship),
    placeholder: "请选择关系",
    ...{ style: {} },
}));
const __VLS_209 = __VLS_208({
    modelValue: (__VLS_ctx.patientForm.relationship),
    placeholder: "请选择关系",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_208));
const { default: __VLS_212 } = __VLS_210.slots;
let __VLS_213;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent1(__VLS_213, new __VLS_213({
    label: "本人",
    value: "本人",
}));
const __VLS_215 = __VLS_214({
    label: "本人",
    value: "本人",
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
let __VLS_218;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_219 = __VLS_asFunctionalComponent1(__VLS_218, new __VLS_218({
    label: "父母",
    value: "父母",
}));
const __VLS_220 = __VLS_219({
    label: "父母",
    value: "父母",
}, ...__VLS_functionalComponentArgsRest(__VLS_219));
let __VLS_223;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_224 = __VLS_asFunctionalComponent1(__VLS_223, new __VLS_223({
    label: "子女",
    value: "子女",
}));
const __VLS_225 = __VLS_224({
    label: "子女",
    value: "子女",
}, ...__VLS_functionalComponentArgsRest(__VLS_224));
let __VLS_228;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent1(__VLS_228, new __VLS_228({
    label: "亲戚",
    value: "亲戚",
}));
const __VLS_230 = __VLS_229({
    label: "亲戚",
    value: "亲戚",
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
let __VLS_233;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_234 = __VLS_asFunctionalComponent1(__VLS_233, new __VLS_233({
    label: "其他",
    value: "其他",
}));
const __VLS_235 = __VLS_234({
    label: "其他",
    value: "其他",
}, ...__VLS_functionalComponentArgsRest(__VLS_234));
// @ts-ignore
[patientForm,];
var __VLS_210;
// @ts-ignore
[];
var __VLS_204;
// @ts-ignore
[];
var __VLS_152;
{
    const { footer: __VLS_238 } = __VLS_146.slots;
    let __VLS_239;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_240 = __VLS_asFunctionalComponent1(__VLS_239, new __VLS_239({
        ...{ 'onClick': {} },
    }));
    const __VLS_241 = __VLS_240({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_240));
    let __VLS_244;
    const __VLS_245 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.patientDialogVisible = false;
                // @ts-ignore
                [patientDialogVisible,];
            } });
    const { default: __VLS_246 } = __VLS_242.slots;
    // @ts-ignore
    [];
    var __VLS_242;
    var __VLS_243;
    let __VLS_247;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_248 = __VLS_asFunctionalComponent1(__VLS_247, new __VLS_247({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_249 = __VLS_248({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_248));
    let __VLS_252;
    const __VLS_253 = ({ click: {} },
        { onClick: (__VLS_ctx.submitPatient) });
    const { default: __VLS_254 } = __VLS_250.slots;
    // @ts-ignore
    [submitPatient,];
    var __VLS_250;
    var __VLS_251;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_146;
let __VLS_255;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_256 = __VLS_asFunctionalComponent1(__VLS_255, new __VLS_255({
    modelValue: (__VLS_ctx.recordDialogVisible),
    title: (__VLS_ctx.recordForm.id ? '病历详情' : '新增就诊经历'),
    width: "600px",
}));
const __VLS_257 = __VLS_256({
    modelValue: (__VLS_ctx.recordDialogVisible),
    title: (__VLS_ctx.recordForm.id ? '病历详情' : '新增就诊经历'),
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_256));
const { default: __VLS_260 } = __VLS_258.slots;
let __VLS_261;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_262 = __VLS_asFunctionalComponent1(__VLS_261, new __VLS_261({
    model: (__VLS_ctx.recordForm),
    labelWidth: "100px",
    disabled: (__VLS_ctx.isViewOnly),
}));
const __VLS_263 = __VLS_262({
    model: (__VLS_ctx.recordForm),
    labelWidth: "100px",
    disabled: (__VLS_ctx.isViewOnly),
}, ...__VLS_functionalComponentArgsRest(__VLS_262));
const { default: __VLS_266 } = __VLS_264.slots;
let __VLS_267;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_268 = __VLS_asFunctionalComponent1(__VLS_267, new __VLS_267({
    label: "就诊日期",
    required: true,
}));
const __VLS_269 = __VLS_268({
    label: "就诊日期",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_268));
const { default: __VLS_272 } = __VLS_270.slots;
let __VLS_273;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker | typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent1(__VLS_273, new __VLS_273({
    modelValue: (__VLS_ctx.recordForm.visitDate),
    type: "date",
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}));
const __VLS_275 = __VLS_274({
    modelValue: (__VLS_ctx.recordForm.visitDate),
    type: "date",
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_274));
// @ts-ignore
[recordDialogVisible, recordForm, recordForm, recordForm, isViewOnly,];
var __VLS_270;
let __VLS_278;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_279 = __VLS_asFunctionalComponent1(__VLS_278, new __VLS_278({
    label: "就诊科室",
    required: true,
}));
const __VLS_280 = __VLS_279({
    label: "就诊科室",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_279));
const { default: __VLS_283 } = __VLS_281.slots;
let __VLS_284;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent1(__VLS_284, new __VLS_284({
    modelValue: (__VLS_ctx.recordForm.department),
}));
const __VLS_286 = __VLS_285({
    modelValue: (__VLS_ctx.recordForm.department),
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
// @ts-ignore
[recordForm,];
var __VLS_281;
let __VLS_289;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_290 = __VLS_asFunctionalComponent1(__VLS_289, new __VLS_289({
    label: "就诊医院",
}));
const __VLS_291 = __VLS_290({
    label: "就诊医院",
}, ...__VLS_functionalComponentArgsRest(__VLS_290));
const { default: __VLS_294 } = __VLS_292.slots;
let __VLS_295;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_296 = __VLS_asFunctionalComponent1(__VLS_295, new __VLS_295({
    modelValue: (__VLS_ctx.recordForm.hospital),
}));
const __VLS_297 = __VLS_296({
    modelValue: (__VLS_ctx.recordForm.hospital),
}, ...__VLS_functionalComponentArgsRest(__VLS_296));
// @ts-ignore
[recordForm,];
var __VLS_292;
let __VLS_300;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent1(__VLS_300, new __VLS_300({
    label: "病症",
    required: true,
}));
const __VLS_302 = __VLS_301({
    label: "病症",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
const { default: __VLS_305 } = __VLS_303.slots;
let __VLS_306;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_307 = __VLS_asFunctionalComponent1(__VLS_306, new __VLS_306({
    type: "textarea",
    modelValue: (__VLS_ctx.recordForm.symptoms),
    rows: (3),
}));
const __VLS_308 = __VLS_307({
    type: "textarea",
    modelValue: (__VLS_ctx.recordForm.symptoms),
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_307));
// @ts-ignore
[recordForm,];
var __VLS_303;
let __VLS_311;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_312 = __VLS_asFunctionalComponent1(__VLS_311, new __VLS_311({
    label: "病历单图片",
}));
const __VLS_313 = __VLS_312({
    label: "病历单图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_312));
const { default: __VLS_316 } = __VLS_314.slots;
let __VLS_317;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_318 = __VLS_asFunctionalComponent1(__VLS_317, new __VLS_317({
    action: "#",
    listType: "picture-card",
    onError: (__VLS_ctx.handleUploadError),
    beforeUpload: (__VLS_ctx.beforeUpload),
    onRemove: (__VLS_ctx.handleRemoveImage),
    onChange: (__VLS_ctx.handleChange),
    fileList: (__VLS_ctx.fileList),
    autoUpload: (false),
    multiple: true,
}));
const __VLS_319 = __VLS_318({
    action: "#",
    listType: "picture-card",
    onError: (__VLS_ctx.handleUploadError),
    beforeUpload: (__VLS_ctx.beforeUpload),
    onRemove: (__VLS_ctx.handleRemoveImage),
    onChange: (__VLS_ctx.handleChange),
    fileList: (__VLS_ctx.fileList),
    autoUpload: (false),
    multiple: true,
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
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_330 = __VLS_asFunctionalComponent1(__VLS_329, new __VLS_329({}));
const __VLS_331 = __VLS_330({}, ...__VLS_functionalComponentArgsRest(__VLS_330));
// @ts-ignore
[handleUploadError, beforeUpload, handleRemoveImage, handleChange, fileList,];
var __VLS_326;
// @ts-ignore
[];
var __VLS_320;
// @ts-ignore
[];
var __VLS_314;
let __VLS_334;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_335 = __VLS_asFunctionalComponent1(__VLS_334, new __VLS_334({
    label: "备注",
}));
const __VLS_336 = __VLS_335({
    label: "备注",
}, ...__VLS_functionalComponentArgsRest(__VLS_335));
const { default: __VLS_339 } = __VLS_337.slots;
let __VLS_340;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_341 = __VLS_asFunctionalComponent1(__VLS_340, new __VLS_340({
    type: "textarea",
    modelValue: (__VLS_ctx.recordForm.remarks),
    rows: (2),
}));
const __VLS_342 = __VLS_341({
    type: "textarea",
    modelValue: (__VLS_ctx.recordForm.remarks),
    rows: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_341));
// @ts-ignore
[recordForm,];
var __VLS_337;
// @ts-ignore
[];
var __VLS_264;
{
    const { footer: __VLS_345 } = __VLS_258.slots;
    let __VLS_346;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_347 = __VLS_asFunctionalComponent1(__VLS_346, new __VLS_346({
        ...{ 'onClick': {} },
    }));
    const __VLS_348 = __VLS_347({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_347));
    let __VLS_351;
    const __VLS_352 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.recordDialogVisible = false;
                // @ts-ignore
                [recordDialogVisible,];
            } });
    const { default: __VLS_353 } = __VLS_349.slots;
    (__VLS_ctx.isViewOnly ? '关闭' : '取消');
    // @ts-ignore
    [isViewOnly,];
    var __VLS_349;
    var __VLS_350;
    if (!__VLS_ctx.isViewOnly) {
        let __VLS_354;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_355 = __VLS_asFunctionalComponent1(__VLS_354, new __VLS_354({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_356 = __VLS_355({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_355));
        let __VLS_359;
        const __VLS_360 = ({ click: {} },
            { onClick: (__VLS_ctx.submitRecord) });
        const { default: __VLS_361 } = __VLS_357.slots;
        // @ts-ignore
        [isViewOnly, submitRecord,];
        var __VLS_357;
        var __VLS_358;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_258;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
