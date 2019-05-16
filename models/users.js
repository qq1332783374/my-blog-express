const User = require('../lib/mongo').User

module.exports = {
    // 注册一个用户
    create: function create(user) {
        return User.insertOne(user).exec()
    },
    // 通过用户名来查找用户
    getUserByName (name) {
        return User
            .findOne({name: name})
            .addCreatedAt()
            .exec()
    }
}