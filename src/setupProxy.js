const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api', // Đường dẫn proxy
        createProxyMiddleware({
            target: 'https://guland.vn', // Đích đến
            changeOrigin: true,
            pathRewrite: { '^/api': '' }, // Loại bỏ tiền tố /api
        })
    );
};