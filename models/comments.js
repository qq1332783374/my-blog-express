const marked = require('marked')
const Comment = require('../lib/mongo').Comment

// Markdown 语法转换
Comment.plugin('contentToHtml', {
    afterFind (comments) {
        return comments.map((comment) => {
            comment.content = marked(comment.content)
            return comment
        })
    }
})

module.exports = {
    // 创建一个留言
    create (comment) {
        return Comment.insertOne(comment).exec()
    },

    // 通过留言 id 获取一个留言
    getCommentById (commentId) {
        return Comment.findOne({
            _id: commentId
        }).exec()
    },

    // 通过留言 id 删除一条留言
    delCommentById (commentId) {
        return Comment.deleteOne(
            { _id: commentId }
        ).exec()
    },

    // 通过文章id 删除所有留言
    delCommentByPostId (postId) {
        return Comment.deleteMany({
            postId: postId
        }).exec()
    },

    // 通过文章 id 获取该文章下的全部留言
    getComments (postId) {
        return Comment
            .find({ postId: postId })
            .populate({ path: 'author', model: 'User' })
            .sort({ _id: 1 })
            .exec()
    },

    // 通过文章 id 获取留言数
    getCommentsCount (postId) {
        return  Comment.count({
            postId: postId
        }).exec()
    }
}