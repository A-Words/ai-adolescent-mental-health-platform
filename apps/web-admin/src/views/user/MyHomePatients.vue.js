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
    fileList.value.push(file);
    return false;
};
const handleRemoveImage = (file) => {
    const index = fileList.value.indexOf(file);
    if (index > -1) {
        fileList.value.splice(index, 1);
    }
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
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-home-patients" },
});
/** @type {__VLS_StyleScopedClasses['my-home-patients']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
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
    { onClick: (__VLS_ctx.handleAddPatient) });
const { default: __VLS_7 } = __VLS_3.slots;
// @ts-ignore
[handleAddPatient,];
var __VLS_3;
var __VLS_4;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ 'onTabClick': {} },
    modelValue: (__VLS_ctx.activePatientId),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onTabClick': {} },
    modelValue: (__VLS_ctx.activePatientId),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ tabClick: {} },
    { onTabClick: (__VLS_ctx.handleTabClick) });
const { default: __VLS_15 } = __VLS_11.slots;
for (const [patient] of __VLS_vFor((__VLS_ctx.patients))) {
    let __VLS_16;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        key: (patient.id),
        label: (patient.name),
        name: (String(patient.id)),
    }));
    const __VLS_18 = __VLS_17({
        key: (patient.id),
        label: (patient.name),
        name: (String(patient.id)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const { default: __VLS_21 } = __VLS_19.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "patient-info-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['patient-info-bar']} */ ;
    let __VLS_22;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        column: (3),
        border: true,
    }));
    const __VLS_24 = __VLS_23({
        column: (3),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    const { default: __VLS_27 } = __VLS_25.slots;
    let __VLS_28;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
        label: "姓名",
    }));
    const __VLS_30 = __VLS_29({
        label: "姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const { default: __VLS_33 } = __VLS_31.slots;
    (patient.name);
    // @ts-ignore
    [activePatientId, handleTabClick, patients,];
    var __VLS_31;
    let __VLS_34;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
        label: "年龄",
    }));
    const __VLS_36 = __VLS_35({
        label: "年龄",
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    const { default: __VLS_39 } = __VLS_37.slots;
    (__VLS_ctx.calculateAge(patient.birthday));
    // @ts-ignore
    [calculateAge,];
    var __VLS_37;
    let __VLS_40;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
        label: "性别",
    }));
    const __VLS_42 = __VLS_41({
        label: "性别",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const { default: __VLS_45 } = __VLS_43.slots;
    (patient.sex === 1 ? '男' : '女');
    // @ts-ignore
    [];
    var __VLS_43;
    let __VLS_46;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
        label: "关系",
    }));
    const __VLS_48 = __VLS_47({
        label: "关系",
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    const { default: __VLS_51 } = __VLS_49.slots;
    (patient.relationship);
    // @ts-ignore
    [];
    var __VLS_49;
    let __VLS_52;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        label: "操作",
    }));
    const __VLS_54 = __VLS_53({
        label: "操作",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    const { default: __VLS_57 } = __VLS_55.slots;
    let __VLS_58;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_60 = __VLS_59({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    let __VLS_63;
    const __VLS_64 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleEditPatient(patient);
                // @ts-ignore
                [handleEditPatient,];
            } });
    const { default: __VLS_65 } = __VLS_61.slots;
    // @ts-ignore
    [];
    var __VLS_61;
    var __VLS_62;
    let __VLS_66;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_68 = __VLS_67({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    let __VLS_71;
    const __VLS_72 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDeletePatient(patient.id);
                // @ts-ignore
                [handleDeletePatient,];
            } });
    const { default: __VLS_73 } = __VLS_69.slots;
    // @ts-ignore
    [];
    var __VLS_69;
    var __VLS_70;
    // @ts-ignore
    [];
    var __VLS_55;
    // @ts-ignore
    [];
    var __VLS_25;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "records-section" },
    });
    /** @type {__VLS_StyleScopedClasses['records-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    let __VLS_74;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
        ...{ 'onClick': {} },
        type: "success",
        size: "small",
    }));
    const __VLS_76 = __VLS_75({
        ...{ 'onClick': {} },
        type: "success",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    let __VLS_79;
    const __VLS_80 = ({ click: {} },
        { onClick: (__VLS_ctx.handleAddRecord) });
    const { default: __VLS_81 } = __VLS_77.slots;
    // @ts-ignore
    [handleAddRecord,];
    var __VLS_77;
    var __VLS_78;
    let __VLS_82;
    /** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
    elTable;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
        data: (__VLS_ctx.records),
        ...{ style: {} },
    }));
    const __VLS_84 = __VLS_83({
        data: (__VLS_ctx.records),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingRecords) }, null, null);
    const { default: __VLS_87 } = __VLS_85.slots;
    let __VLS_88;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
        prop: "visitDate",
        label: "就诊日期",
        width: "120",
    }));
    const __VLS_90 = __VLS_89({
        prop: "visitDate",
        label: "就诊日期",
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_93;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
        prop: "department",
        label: "科室",
        width: "120",
    }));
    const __VLS_95 = __VLS_94({
        prop: "department",
        label: "科室",
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    let __VLS_98;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
        prop: "hospital",
        label: "医院",
        width: "180",
    }));
    const __VLS_100 = __VLS_99({
        prop: "hospital",
        label: "医院",
        width: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    let __VLS_103;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
        prop: "symptoms",
        label: "病症",
        showOverflowTooltip: true,
    }));
    const __VLS_105 = __VLS_104({
        prop: "symptoms",
        label: "病症",
        showOverflowTooltip: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    let __VLS_108;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
        label: "操作",
        width: "150",
    }));
    const __VLS_110 = __VLS_109({
        label: "操作",
        width: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    const { default: __VLS_113 } = __VLS_111.slots;
    {
        const { default: __VLS_114 } = __VLS_111.slots;
        const [scope] = __VLS_vSlot(__VLS_114);
        let __VLS_115;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
            ...{ 'onClick': {} },
            size: "small",
        }));
        const __VLS_117 = __VLS_116({
            ...{ 'onClick': {} },
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_116));
        let __VLS_120;
        const __VLS_121 = ({ click: {} },
            { onClick: (...[$event]) => {
                    __VLS_ctx.handleViewRecord(scope.row);
                    // @ts-ignore
                    [records, vLoading, loadingRecords, handleViewRecord,];
                } });
        const { default: __VLS_122 } = __VLS_118.slots;
        // @ts-ignore
        [];
        var __VLS_118;
        var __VLS_119;
        let __VLS_123;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_125 = __VLS_124({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_124));
        let __VLS_128;
        const __VLS_129 = ({ click: {} },
            { onClick: (...[$event]) => {
                    __VLS_ctx.handleDeleteRecord(scope.row.id);
                    // @ts-ignore
                    [handleDeleteRecord,];
                } });
        const { default: __VLS_130 } = __VLS_126.slots;
        // @ts-ignore
        [];
        var __VLS_126;
        var __VLS_127;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_111;
    // @ts-ignore
    [];
    var __VLS_85;
    // @ts-ignore
    [];
    var __VLS_19;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_11;
var __VLS_12;
if (__VLS_ctx.patients.length === 0) {
    let __VLS_131;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
        description: "暂无就诊人信息，请添加",
    }));
    const __VLS_133 = __VLS_132({
        description: "暂无就诊人信息，请添加",
    }, ...__VLS_functionalComponentArgsRest(__VLS_132));
}
let __VLS_136;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent1(__VLS_136, new __VLS_136({
    modelValue: (__VLS_ctx.patientDialogVisible),
    title: (__VLS_ctx.patientForm.id ? '修改就诊人' : '添加就诊人'),
    width: "400px",
}));
const __VLS_138 = __VLS_137({
    modelValue: (__VLS_ctx.patientDialogVisible),
    title: (__VLS_ctx.patientForm.id ? '修改就诊人' : '添加就诊人'),
    width: "400px",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
const { default: __VLS_141 } = __VLS_139.slots;
let __VLS_142;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent1(__VLS_142, new __VLS_142({
    model: (__VLS_ctx.patientForm),
    labelWidth: "80px",
}));
const __VLS_144 = __VLS_143({
    model: (__VLS_ctx.patientForm),
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
const { default: __VLS_147 } = __VLS_145.slots;
let __VLS_148;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
    label: "姓名",
    required: true,
}));
const __VLS_150 = __VLS_149({
    label: "姓名",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
const { default: __VLS_153 } = __VLS_151.slots;
let __VLS_154;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent1(__VLS_154, new __VLS_154({
    modelValue: (__VLS_ctx.patientForm.name),
}));
const __VLS_156 = __VLS_155({
    modelValue: (__VLS_ctx.patientForm.name),
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
// @ts-ignore
[patients, patientDialogVisible, patientForm, patientForm, patientForm,];
var __VLS_151;
let __VLS_159;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_160 = __VLS_asFunctionalComponent1(__VLS_159, new __VLS_159({
    label: "性别",
    required: true,
}));
const __VLS_161 = __VLS_160({
    label: "性别",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_160));
const { default: __VLS_164 } = __VLS_162.slots;
let __VLS_165;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_166 = __VLS_asFunctionalComponent1(__VLS_165, new __VLS_165({
    modelValue: (__VLS_ctx.patientForm.sex),
}));
const __VLS_167 = __VLS_166({
    modelValue: (__VLS_ctx.patientForm.sex),
}, ...__VLS_functionalComponentArgsRest(__VLS_166));
const { default: __VLS_170 } = __VLS_168.slots;
let __VLS_171;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_172 = __VLS_asFunctionalComponent1(__VLS_171, new __VLS_171({
    label: (1),
}));
const __VLS_173 = __VLS_172({
    label: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_172));
const { default: __VLS_176 } = __VLS_174.slots;
// @ts-ignore
[patientForm,];
var __VLS_174;
let __VLS_177;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent1(__VLS_177, new __VLS_177({
    label: (2),
}));
const __VLS_179 = __VLS_178({
    label: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
const { default: __VLS_182 } = __VLS_180.slots;
// @ts-ignore
[];
var __VLS_180;
// @ts-ignore
[];
var __VLS_168;
// @ts-ignore
[];
var __VLS_162;
let __VLS_183;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_184 = __VLS_asFunctionalComponent1(__VLS_183, new __VLS_183({
    label: "出生日期",
    required: true,
}));
const __VLS_185 = __VLS_184({
    label: "出生日期",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_184));
const { default: __VLS_188 } = __VLS_186.slots;
let __VLS_189;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker | typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent1(__VLS_189, new __VLS_189({
    modelValue: (__VLS_ctx.patientForm.birthday),
    type: "date",
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}));
const __VLS_191 = __VLS_190({
    modelValue: (__VLS_ctx.patientForm.birthday),
    type: "date",
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
// @ts-ignore
[patientForm,];
var __VLS_186;
let __VLS_194;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_195 = __VLS_asFunctionalComponent1(__VLS_194, new __VLS_194({
    label: "关系",
    required: true,
}));
const __VLS_196 = __VLS_195({
    label: "关系",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_195));
const { default: __VLS_199 } = __VLS_197.slots;
let __VLS_200;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent1(__VLS_200, new __VLS_200({
    modelValue: (__VLS_ctx.patientForm.relationship),
    placeholder: "请选择关系",
    ...{ style: {} },
}));
const __VLS_202 = __VLS_201({
    modelValue: (__VLS_ctx.patientForm.relationship),
    placeholder: "请选择关系",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
const { default: __VLS_205 } = __VLS_203.slots;
let __VLS_206;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_207 = __VLS_asFunctionalComponent1(__VLS_206, new __VLS_206({
    label: "本人",
    value: "本人",
}));
const __VLS_208 = __VLS_207({
    label: "本人",
    value: "本人",
}, ...__VLS_functionalComponentArgsRest(__VLS_207));
let __VLS_211;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_212 = __VLS_asFunctionalComponent1(__VLS_211, new __VLS_211({
    label: "父母",
    value: "父母",
}));
const __VLS_213 = __VLS_212({
    label: "父母",
    value: "父母",
}, ...__VLS_functionalComponentArgsRest(__VLS_212));
let __VLS_216;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({
    label: "子女",
    value: "子女",
}));
const __VLS_218 = __VLS_217({
    label: "子女",
    value: "子女",
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
let __VLS_221;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_222 = __VLS_asFunctionalComponent1(__VLS_221, new __VLS_221({
    label: "亲戚",
    value: "亲戚",
}));
const __VLS_223 = __VLS_222({
    label: "亲戚",
    value: "亲戚",
}, ...__VLS_functionalComponentArgsRest(__VLS_222));
let __VLS_226;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_227 = __VLS_asFunctionalComponent1(__VLS_226, new __VLS_226({
    label: "其他",
    value: "其他",
}));
const __VLS_228 = __VLS_227({
    label: "其他",
    value: "其他",
}, ...__VLS_functionalComponentArgsRest(__VLS_227));
// @ts-ignore
[patientForm,];
var __VLS_203;
// @ts-ignore
[];
var __VLS_197;
// @ts-ignore
[];
var __VLS_145;
{
    const { footer: __VLS_231 } = __VLS_139.slots;
    let __VLS_232;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent1(__VLS_232, new __VLS_232({
        ...{ 'onClick': {} },
    }));
    const __VLS_234 = __VLS_233({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    let __VLS_237;
    const __VLS_238 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.patientDialogVisible = false;
                // @ts-ignore
                [patientDialogVisible,];
            } });
    const { default: __VLS_239 } = __VLS_235.slots;
    // @ts-ignore
    [];
    var __VLS_235;
    var __VLS_236;
    let __VLS_240;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent1(__VLS_240, new __VLS_240({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_242 = __VLS_241({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_241));
    let __VLS_245;
    const __VLS_246 = ({ click: {} },
        { onClick: (__VLS_ctx.submitPatient) });
    const { default: __VLS_247 } = __VLS_243.slots;
    // @ts-ignore
    [submitPatient,];
    var __VLS_243;
    var __VLS_244;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_139;
let __VLS_248;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent1(__VLS_248, new __VLS_248({
    modelValue: (__VLS_ctx.recordDialogVisible),
    title: (__VLS_ctx.recordForm.id ? '病历详情' : '新增就诊经历'),
    width: "600px",
}));
const __VLS_250 = __VLS_249({
    modelValue: (__VLS_ctx.recordDialogVisible),
    title: (__VLS_ctx.recordForm.id ? '病历详情' : '新增就诊经历'),
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
const { default: __VLS_253 } = __VLS_251.slots;
let __VLS_254;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_255 = __VLS_asFunctionalComponent1(__VLS_254, new __VLS_254({
    model: (__VLS_ctx.recordForm),
    labelWidth: "100px",
    disabled: (__VLS_ctx.isViewOnly),
}));
const __VLS_256 = __VLS_255({
    model: (__VLS_ctx.recordForm),
    labelWidth: "100px",
    disabled: (__VLS_ctx.isViewOnly),
}, ...__VLS_functionalComponentArgsRest(__VLS_255));
const { default: __VLS_259 } = __VLS_257.slots;
let __VLS_260;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent1(__VLS_260, new __VLS_260({
    label: "就诊日期",
    required: true,
}));
const __VLS_262 = __VLS_261({
    label: "就诊日期",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
const { default: __VLS_265 } = __VLS_263.slots;
let __VLS_266;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker | typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_267 = __VLS_asFunctionalComponent1(__VLS_266, new __VLS_266({
    modelValue: (__VLS_ctx.recordForm.visitDate),
    type: "date",
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}));
const __VLS_268 = __VLS_267({
    modelValue: (__VLS_ctx.recordForm.visitDate),
    type: "date",
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_267));
// @ts-ignore
[recordDialogVisible, recordForm, recordForm, recordForm, isViewOnly,];
var __VLS_263;
let __VLS_271;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_272 = __VLS_asFunctionalComponent1(__VLS_271, new __VLS_271({
    label: "就诊科室",
    required: true,
}));
const __VLS_273 = __VLS_272({
    label: "就诊科室",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_272));
const { default: __VLS_276 } = __VLS_274.slots;
let __VLS_277;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_278 = __VLS_asFunctionalComponent1(__VLS_277, new __VLS_277({
    modelValue: (__VLS_ctx.recordForm.department),
}));
const __VLS_279 = __VLS_278({
    modelValue: (__VLS_ctx.recordForm.department),
}, ...__VLS_functionalComponentArgsRest(__VLS_278));
// @ts-ignore
[recordForm,];
var __VLS_274;
let __VLS_282;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_283 = __VLS_asFunctionalComponent1(__VLS_282, new __VLS_282({
    label: "就诊医院",
}));
const __VLS_284 = __VLS_283({
    label: "就诊医院",
}, ...__VLS_functionalComponentArgsRest(__VLS_283));
const { default: __VLS_287 } = __VLS_285.slots;
let __VLS_288;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent1(__VLS_288, new __VLS_288({
    modelValue: (__VLS_ctx.recordForm.hospital),
}));
const __VLS_290 = __VLS_289({
    modelValue: (__VLS_ctx.recordForm.hospital),
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
// @ts-ignore
[recordForm,];
var __VLS_285;
let __VLS_293;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_294 = __VLS_asFunctionalComponent1(__VLS_293, new __VLS_293({
    label: "病症",
    required: true,
}));
const __VLS_295 = __VLS_294({
    label: "病症",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_294));
const { default: __VLS_298 } = __VLS_296.slots;
let __VLS_299;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_300 = __VLS_asFunctionalComponent1(__VLS_299, new __VLS_299({
    type: "textarea",
    modelValue: (__VLS_ctx.recordForm.symptoms),
    rows: (3),
}));
const __VLS_301 = __VLS_300({
    type: "textarea",
    modelValue: (__VLS_ctx.recordForm.symptoms),
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_300));
// @ts-ignore
[recordForm,];
var __VLS_296;
let __VLS_304;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent1(__VLS_304, new __VLS_304({
    label: "病历单图片",
}));
const __VLS_306 = __VLS_305({
    label: "病历单图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
const { default: __VLS_309 } = __VLS_307.slots;
let __VLS_310;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_311 = __VLS_asFunctionalComponent1(__VLS_310, new __VLS_310({
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
const __VLS_312 = __VLS_311({
    action: "#",
    listType: "picture-card",
    onError: (__VLS_ctx.handleUploadError),
    beforeUpload: (__VLS_ctx.beforeUpload),
    onRemove: (__VLS_ctx.handleRemoveImage),
    onChange: (__VLS_ctx.handleChange),
    fileList: (__VLS_ctx.fileList),
    autoUpload: (false),
    multiple: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_311));
const { default: __VLS_315 } = __VLS_313.slots;
let __VLS_316;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent1(__VLS_316, new __VLS_316({}));
const __VLS_318 = __VLS_317({}, ...__VLS_functionalComponentArgsRest(__VLS_317));
const { default: __VLS_321 } = __VLS_319.slots;
let __VLS_322;
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_323 = __VLS_asFunctionalComponent1(__VLS_322, new __VLS_322({}));
const __VLS_324 = __VLS_323({}, ...__VLS_functionalComponentArgsRest(__VLS_323));
// @ts-ignore
[handleUploadError, beforeUpload, handleRemoveImage, handleChange, fileList,];
var __VLS_319;
// @ts-ignore
[];
var __VLS_313;
// @ts-ignore
[];
var __VLS_307;
let __VLS_327;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_328 = __VLS_asFunctionalComponent1(__VLS_327, new __VLS_327({
    label: "备注",
}));
const __VLS_329 = __VLS_328({
    label: "备注",
}, ...__VLS_functionalComponentArgsRest(__VLS_328));
const { default: __VLS_332 } = __VLS_330.slots;
let __VLS_333;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_334 = __VLS_asFunctionalComponent1(__VLS_333, new __VLS_333({
    type: "textarea",
    modelValue: (__VLS_ctx.recordForm.remarks),
    rows: (2),
}));
const __VLS_335 = __VLS_334({
    type: "textarea",
    modelValue: (__VLS_ctx.recordForm.remarks),
    rows: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_334));
// @ts-ignore
[recordForm,];
var __VLS_330;
// @ts-ignore
[];
var __VLS_257;
{
    const { footer: __VLS_338 } = __VLS_251.slots;
    let __VLS_339;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_340 = __VLS_asFunctionalComponent1(__VLS_339, new __VLS_339({
        ...{ 'onClick': {} },
    }));
    const __VLS_341 = __VLS_340({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_340));
    let __VLS_344;
    const __VLS_345 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.recordDialogVisible = false;
                // @ts-ignore
                [recordDialogVisible,];
            } });
    const { default: __VLS_346 } = __VLS_342.slots;
    (__VLS_ctx.isViewOnly ? '关闭' : '取消');
    // @ts-ignore
    [isViewOnly,];
    var __VLS_342;
    var __VLS_343;
    if (!__VLS_ctx.isViewOnly) {
        let __VLS_347;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_348 = __VLS_asFunctionalComponent1(__VLS_347, new __VLS_347({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_349 = __VLS_348({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_348));
        let __VLS_352;
        const __VLS_353 = ({ click: {} },
            { onClick: (__VLS_ctx.submitRecord) });
        const { default: __VLS_354 } = __VLS_350.slots;
        // @ts-ignore
        [isViewOnly, submitRecord,];
        var __VLS_350;
        var __VLS_351;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_251;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
