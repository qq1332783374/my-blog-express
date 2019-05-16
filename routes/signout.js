// 登出

const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin

// GET /signout 登出
router.get('/', checkLogin, (req, res, next) => {
    // 清空session中的用户信息
    req.session.user = null
    req.flash('success', '成功退出登录')
    // 重定向到首页
    res.redirect('/posts')
})

module.exports = router