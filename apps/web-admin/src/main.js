import { createApp } from 'vue';
import './style.css';
// 引入全局响应式样式
import './assets/css/responsive.css';
// 引入设计令牌（基于 web-user 主题）
import './assets/css/design-tokens.css';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
// v-md-editor
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import createAlignPlugin from '@kangc/v-md-editor/lib/plugins/align';
// highlightjs
import hljs from 'highlight.js';
VMdEditor.use(githubTheme, {
    Hljs: hljs,
});
// Handle potential interop issue
// @ts-ignore
const alignPlugin = createAlignPlugin.default || createAlignPlugin;
VMdEditor.use(alignPlugin());
const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.use(createPinia());
app.use(router);
app.use(ElementPlus);
// @ts-ignore - VMdEditor type incompatibility with Vue 3 plugin system
app.use(VMdEditor);
app.mount('#app');
