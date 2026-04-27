import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue')
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('../views/ForgotPassword.vue')
    },
    {
        path: '/',
        component: () => import('../views/Layout.vue'),
        children: [
            {
                path: 'home',
                name: 'Home',
                component: () => import('../views/Home.vue')
            },
            {
                path: 'search',
                name: 'SearchResults',
                component: () => import('../views/SearchResults.vue')
            },
            {
                // 新增书籍路由
                path: 'books',
                name: 'Books',
                component: () => import('../views/book/BookList.vue')
            },
            {
                path: 'book/:id',
                name: 'BookDetail',
                component: () => import('../views/book/BookDetail.vue')
            },
            {
                path: 'apply-psychologist',
                name: 'ApplyPsychologist',
                component: () => import('../views/ApplyPsychologist.vue')
            },
            {
                path: 'apply-psychologist/basic',
                name: 'ApplyPsychologistBasic',
                component: () => import('../views/psychologist/ApplyBasicInfo.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'apply-psychologist/form',
                name: 'ApplyPsychologistForm',
                component: () => import('../views/psychologist/ApplyForm.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'apply-psychologist/status',
                name: 'ApplyPsychologistStatus',
                component: () => import('../views/psychologist/ApplyStatus.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'consultation',
                name: 'Consultation',
                component: () => import('../views/consultation/PsychologistHub.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'consultation/psychologist',
                name: 'PsychologistList',
                component: () => import('../views/consultation/PsychologistList.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'consultation/psychologist/:id',
                name: 'PsychologistDetail',
                component: () => import('../views/consultation/PsychologistDetail.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'consultation/doctor',
                name: 'DoctorBook',
                component: () => import('../views/user/Consultation.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'my-psychology',
                name: 'MyPsychology',
                component: () => import('../views/consultation/MyPsychology.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'user-chat/:appointmentId',
                name: 'UserChat',
                component: () => import('../views/consultation/UserChat.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'my-orders',
                name: 'MyOrders',
                component: () => import('../views/order/MyOrders.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'articles',
                name: 'Articles',
                component: () => import('../views/content/ArticleList.vue')
            },
            {
                path: 'article/:id',
                name: 'ArticleDetail',
                component: () => import('../views/content/ArticleDetail.vue')
            },
            {
                path: 'courses',
                name: 'Courses',
                component: () => import('../views/content/CourseList.vue')
            },
            {
                path: 'assessments',
                name: 'Assessments',
                component: () => import('../views/assessment/AssessmentList.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'assessment/:id',
                name: 'AssessmentDetail',
                component: () => import('../views/assessment/AssessmentDetail.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'assessment-history',
                name: 'AssessmentHistory',
                component: () => import('../views/assessment/AssessmentHistory.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('../views/user/Profile.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'user/feedback',
                name: 'MyFeedback',
                component: () => import('../views/user/MyFeedback.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'patient-records',
                name: 'PatientRecords',
                component: () => import('../views/user/PatientRecord.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'ai-consultation',
                name: 'AIConsultation',
                component: () => import('../views/AIConsultation.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'xiaoai-listen',
                name: 'XiaoaiListen',
                component: () => import('../views/XiaoaiListen.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'publish-article',
                name: 'PublishArticle',
                component: () => import('../views/user/PublishArticle.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'my-articles',
                name: 'MyArticles',
                component: () => import('../views/user/MyArticles.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'follow',
                name: 'FollowList',
                component: () => import('../views/user/FollowList.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'user-home/:userId',
                name: 'UserHome',
                component: () => import('../views/user/UserHome.vue')
            },
            {
                path: 'user-follow/:userId',
                name: 'UserFollowList',
                component: () => import('../views/user/UserFollowList.vue')
            },
            {
                path: 'user-article/:userId/:articleId',
                name: 'UserArticleDetail',
                component: () => import('../views/user/UserArticleDetail.vue')
            },
            {
                path: 'my-messages',
                name: 'MyMessages',
                component: () => import('../views/user/MyMessages.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'my-home',
                component: () => import('../views/user/MyHomeLayout.vue'),
                meta: { requiresAuth: true },
                children: [
                    {
                        path: '',
                        redirect: '/my-home/info'
                    },
                    {
                        path: 'info',
                        name: 'MyHomeInfo',
                        component: () => import('../views/user/MyHomeInfo.vue')
                    },
                    {
                        path: 'articles',
                        name: 'MyHomeArticles',
                        component: () => import('../views/user/MyHomeArticles.vue')
                    },
                    {
                        path: 'followings',
                        name: 'MyHomeFollowings',
                        component: () => import('../views/user/MyHomeFollowings.vue')
                    },
                    {
                        path: 'fans',
                        name: 'MyHomeFans',
                        component: () => import('../views/user/MyHomeFans.vue')
                    },
                    {
                        path: 'privacy',
                        name: 'MyHomePrivacy',
                        component: () => import('../views/user/MyHomePrivacy.vue')
                    },
                    {
                        path: 'favorites',
                        name: 'MyHomeFavorites',
                        component: () => import('../views/user/MyHomeFavorites.vue')
                    },
                    {
                        path: 'likes',
                        name: 'MyHomeLikes',
                        component: () => import('../views/user/MyHomeLikes.vue')
                    },
                    {
                        path: 'assessments',
                        name: 'MyHomeAssessments',
                        component: () => import('../views/user/MyHomeAssessments.vue')
                    },
                    {
                        path: 'feedback',
                        name: 'MyHomeFeedback',
                        component: () => import('../views/user/MyHomeFeedback.vue')
                    },
                    {
                        path: 'patients',
                        name: 'MyHomePatients',
                        component: () => import('../views/user/MyHomePatients.vue')
                    }
                ]
            }
        ]
    },
    {
        path: '/admin',
        component: () => import('../views/AdminLayout.vue'),
        meta: { requiresAuth: true, requiresRole: [2, 3, 4] },
        children: [
            {
                path: '',
                redirect: '/admin/dashboard'
            },
            {
                path: 'dashboard',
                name: 'AdminDashboard',
                component: () => import('../views/admin/Dashboard.vue')
            },
            {
                path: 'hospitals',
                name: 'AdminHospitals',
                component: () => import('../views/admin/HospitalList.vue')
            },
            {
                path: 'users',
                name: 'AdminUsers',
                component: () => import('../views/admin/UserList.vue')
            },
            {
                path: 'content/articles',
                name: 'ArticleManager',
                component: () => import('../views/admin/content/ArticleManager.vue')
            },
            {
                path: 'content/articles/create',
                name: 'ArticleCreate',
                component: () => import('../views/admin/content/ArticleEditor.vue')
            },
            {
                path: 'content/articles/edit/:id',
                name: 'ArticleEdit',
                component: () => import('../views/admin/content/ArticleEditor.vue')
            },
            {
                path: 'content/audit',
                name: 'ArticleAudit',
                component: () => import('../views/admin/content/ArticleAudit.vue')
            },
            {
                path: 'content/courses',
                name: 'CourseManager',
                component: () => import('../views/admin/content/CourseManager.vue')
            },
            {
                path: 'content/assessments',
                name: 'AssessmentManager',
                component: () => import('../views/admin/content/AssessmentManager.vue')
            },
            {
                path: 'content/assessments/create',
                name: 'AssessmentCreate',
                component: () => import('../views/admin/content/AssessmentEditor.vue')
            },
            {
                path: 'content/assessments/edit/:id',
                name: 'AssessmentEdit',
                component: () => import('../views/admin/content/AssessmentEditor.vue')
            },
            // 书籍管理
            {
                path: 'content/books',
                name: 'BookManager',
                component: () => import('../views/admin/content/BookManager.vue'),
                meta: { requiresRole: [4] }
            },
            {
                path: 'content/books/create',
                name: 'BookCreate',
                component: () => import('../views/admin/content/BookEditor.vue'),
                meta: { requiresRole: [4] }
            },
            {
                path: 'content/books/edit/:id',
                name: 'BookEdit',
                component: () => import('../views/admin/content/BookEditor.vue'),
                meta: { requiresRole: [4] }
            },
            {
                path: 'system/quotes',
                name: 'QuoteManager',
                component: () => import('../views/admin/system/QuoteManager.vue')
            },
            {
                path: 'system/feedbacks',
                name: 'FeedbackManager',
                component: () => import('../views/admin/system/FeedbackManager.vue')
            },
            {
                path: 'system/tags',
                name: 'TagManager',
                component: () => import('../views/admin/system/TagManager.vue')
            },
            {
                path: 'complaints',
                name: 'AdminComplaints',
                component: () => import('../views/admin/system/ComplaintManager.vue')
            },
            {
                path: 'meme',
                name: 'MemeManager',
                component: () => import('../views/admin/system/MemeManager.vue')
            },
            {
                path: 'content/tag',
                name: 'TagManager',
                component: () => import('../views/admin/system/TagManager.vue')
            },
            {
                path: 'psychologist',
                name: 'PsychologistAdmin',
                component: () => import('../views/admin/psychologist/PsychologistAdmin.vue'),
                meta: { requiresRole: [4] }
            },
            {
                path: 'psychologist/audit',
                name: 'ProfileAudit',
                component: () => import('../views/admin/psychologist/ProfileAudit.vue'),
                meta: { requiresRole: [4] }
            },
            {
                path: 'psychologist/income',
                name: 'PlatformIncome',
                component: () => import('../views/admin/system/PlatformIncome.vue'),
                meta: { requiresRole: [4] }
            },
            {
                path: 'psychologist/income-detail',
                name: 'ConsultationIncomeDetail',
                component: () => import('../views/admin/psychologist/ConsultationIncomeDetail.vue'),
                meta: { requiresRole: [4] }
            },
            {
                path: 'psychologist-fields',
                name: 'PsychologistFieldManager',
                component: () => import('../views/admin/psychologist/FieldManager.vue'),
                meta: { requiresRole: [4] }
            },
            {
                path: 'psychologist-qualifications',
                name: 'PsychologistQualificationManager',
                component: () => import('../views/admin/psychologist/QualificationManager.vue'),
                meta: { requiresRole: [4] }
            },
            {
                path: 'content/audit',
                name: 'ArticleAudit',
                component: () => import('../views/admin/content/ArticleAudit.vue')
            },
            {
                path: 'platform/income',
                name: 'PlatformIncome',
                component: () => import('../views/admin/system/PlatformIncome.vue'),
            }
        ]
    },
    {
        path: '/hospital',
        component: () => import('../views/AdminLayout.vue'),
        meta: { requiresAuth: true, requiresRole: [2, 3, 4] },
        children: [
            {
                path: '',
                redirect: '/hospital/dashboard'
            },
            {
                path: 'dashboard',
                name: 'HospitalDashboard',
                component: () => import('../views/hospital/HospitalDashboard.vue')
            },
            {
                path: 'doctors',
                name: 'HospitalDoctors',
                component: () => import('../views/hospital/DoctorList.vue')
            },
            {
                path: 'departments',
                name: 'HospitalDepartments',
                component: () => import('../views/hospital/DepartmentList.vue')
            },
            {
                path: 'feedbacks',
                name: 'HospitalFeedbacks',
                component: () => import('../views/hospital/FeedbackManager.vue')
            },
            {
                path: 'complaints',
                name: 'HospitalComplaints',
                component: () => import('../views/admin/system/ComplaintManager.vue')
            }
        ]
    },
    {
        path: '/doctor',
        component: () => import('../views/AdminLayout.vue'),
        meta: { requiresAuth: true, requiresRole: [2, 3, 4] },
        children: [
            {
                path: '',
                redirect: '/doctor/dashboard'
            },
            {
                path: 'dashboard',
                name: 'DoctorDashboard',
                component: () => import('../views/doctor/DoctorDashboard.vue')
            },
            {
                path: 'workbench',
                name: 'DoctorWorkbench',
                component: () => import('../views/doctor/Workbench.vue')
            },
            {
                path: 'schedule',
                name: 'DoctorSchedule',
                component: () => import('../views/doctor/ScheduleManager.vue')
            },
            {
                path: 'patients',
                name: 'DoctorPatients',
                component: () => import('../views/doctor/PatientArchives.vue')
            }
        ]
    },
    {
        path: '/psychologist-admin',
        component: () => import('../views/AdminLayout.vue'),
        meta: { requiresAuth: true, requiresPsychologist: true },
        children: [
            {
                path: '',
                redirect: '/psychologist-admin/workbench'
            },
            {
                path: 'workbench',
                name: 'PsychologistWorkbench',
                component: () => import('../views/psychologist/Workbench.vue')
            },
            {
                path: 'schedule',
                name: 'PsychologistSchedule',
                component: () => import('../views/psychologist/Schedule.vue')
            },
            {
                path: 'appointments',
                name: 'PsychologistAppointments',
                component: () => import('../views/psychologist/Appointments.vue')
            },
            {
                path: 'income',
                name: 'PsychologistIncome',
                component: () => import('../views/psychologist/Income.vue')
            },
            {
                path: 'chat',
                name: 'PsychologistChat',
                component: () => import('../views/psychologist/Chat.vue')
            },
            {
                path: 'profile',
                name: 'PsychologistProfile',
                component: () => import('../views/psychologist/Profile.vue')
            }
        ]
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes
});
// 路由守卫（Vue Router 4：通过 return 重定向，避免已弃用的 next() 回调）
router.beforeEach((to) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 1;
    const isPsychologist = user.isPsychologist === true || user.isPsychologist === 1;
    if (to.meta.requiresAuth && !token) {
        ElMessage.warning('您当前还未登录，请先登录');
        return '/login';
    }
    const requiredRoles = to.meta.requiresRole;
    if (requiredRoles && !requiredRoles.includes(role)) {
        ElMessage.error('您没有权限访问该页面');
        return '/home';
    }
    // 心理咨询师专属路由
    const requiresPsychologist = to.meta.requiresPsychologist;
    if (requiresPsychologist && !isPsychologist) {
        ElMessage.error('您没有权限访问该页面');
        return '/home';
    }
});
export default router;
