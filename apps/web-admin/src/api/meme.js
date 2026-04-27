import request from './user';
export const getMemeList = (params) => {
    return request({
        url: '/meme/admin/list',
        method: 'get',
        params
    });
};
export const getMemeDetail = (id) => {
    return request({
        url: `/meme/admin/${id}`,
        method: 'get'
    });
};
export const saveMeme = (data) => {
    return request({
        url: '/meme/admin/save',
        method: 'post',
        data
    });
};
export const updateMeme = (data) => {
    return request({
        url: '/meme/admin/update',
        method: 'put',
        data
    });
};
export const deleteMeme = (id) => {
    return request.delete(`/meme/admin/${id}/delete`);
};
export const recognizeMemesBatch = (texts) => {
    return request.post('/meme/recognize', { texts });
};
