const marked = require('marked')
const Post = require('../lib/mongo').Post
const CommentModel = require('./comments')

// 将 post 的 content 从 markdown 转换成 html
Post.plugin('contentToHtml', {
    afterFind: function (posts) {
        return posts.map(function (post) {
            post.content = marked(post.content)
            return post
        })
    },
    afterFindOne: function (post) {
        if (post) {
            post.content = marked(post.content)
        }
        return post
    }
})

// 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
    afterFind (posts) {
        return Promise.all(posts.map((post) => {
            return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
                post.commentsCount = commentsCount
                return post
            })
        }))
    },
    afterFindOne (post) {
        if (post) {
            return CommentModel.getCommentsCount(post._id).then(function (count) {
                post.commentsCount = count
                return post
            })
        }
        return post
    }
})

module.exports = {
    // 创建一篇文章
    create: function create(post) {
        return Post.insertOne(post).exec()
    },

    // 通过文章 id 获取一篇文章
    getPostById: function getPostById(postId) {
        return Post
            .findOne({
                _id: postId
            })
            .populate({
                path: 'author',
                model: 'User'
            })
            .contentToHtml()
            .addCommentsCount()
            .exec()
    },

    // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
    getPosts: function getPosts(author) {
        let query = {}
        if (author) {
            query.author = author
        }
        return Post
            .find({ author: query.author })
            .populate({ path: 'author', model: 'User' })
            .sort({ _id: -1 })
            .addCommentsCount()
            .exec()
    },

    // 通过文章 id 给 pv 加 1
    incPv: function incPv(postId) {
        return Post
            .updateOne({
                _id: postId
            }, {
                $inc: {
                    pv: 1
                }
            })
            .exec()
    },
    // 通过文章 id 获取一篇原生文章（编辑文章）
    getRawPostById (postId) {
        return Post
            .findOne({ _id: postId })
            .populate({ path: 'author', model: 'User' })
            .exec()
    },
    // 通过文章 id 更新文章
    updatePostById (postId, data) {
        return Post.updateOne({ _id: postId }, { $set: data }).exec()
    },
    // 通过文章 id 删除文章
    delPostById (postId) {
        return Post.deleteOne({ _id: postId })
            .exec()
            .then((res) => {
                // 文章删除后， 再删除留言
                if (res.result.ok && res.result.n > 0) {
                    return CommentModel.delCommentByPostId(postId)
                }
            })
    }
}