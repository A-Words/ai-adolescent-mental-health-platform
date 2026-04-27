import request from './user';
export const getDailyQuote = () => {
    return request({
        url: '/quote/daily',
        method: 'get'
    });
};
export const getQuotes = () => {
    return request({
        url: '/quote/list',
        method: 'get',
    });
};
export const saveQuote = (data) => {
    return request({
        url: '/quote',
        method: 'post',
        data
    });
};
export const deleteQuote = (id) => {
    return request({
        url: `/quote/${id}`,
        method: 'delete'
    });
};
