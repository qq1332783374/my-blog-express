## 相关配置文件夹

不管是小项目还是大项目，将配置与代码分离是一个非常好的做法。我们通常将配置写到一个配置文件里，如 config.js 或 config.json ，并放到项目的根目录下。但实际开发时我们会有许多环境，如本地开发环境、测试环境和线上环境等，不同环境的配置不同（如：MongoDB 的地址），我们不可能每次部署时都要去修改引用 config.test.js 或者 config.production.js。config-lite 模块正是你需要的。