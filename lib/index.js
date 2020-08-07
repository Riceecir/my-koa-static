const path = require('path')
const fs = require('fs')
const mime = require('./utils/mime')

// 静态资源服务
class StaticServe {
  constructor (staticPath) {
    // 资源路径
    this.staticPath = staticPath
    return this.start.bind(this)
  }

  /**
   * 开始~
   */
  async start (ctx, next) {
    const reqStaticPath = path.join(this.staticPath, ctx.url)
    const content = this.getContent(ctx, reqStaticPath)
    const fileMime = this.parseMime(ctx.url)
    if (fileMime) {
      ctx.type = fileMime
    }
    ctx.body = content
    await next()
  }

  // 解析mime类型
  parseMime (url) {
    let extName = path.extname(url)
    extName = extName ? extName.slice(1) : 'unkonw'
    return mime[extName]
  }

  /** 获取内容
   * @param {obj} ctx: Koa Context
   * @param {string} reqStaticPath: 请求资源路径
   * @return {string} 文件内容
   */
  getContent (ctx, reqStaticPath) {
  // 确认目录是否存在
    const exist = fs.existsSync(reqStaticPath)
    let content = ''

    if (!exist) {
      content = '404 Not Found!'
    } else {
      const stat = fs.statSync(reqStaticPath)
      if (stat.isDirectory()) {
      // 返回目录
        content = this.getDir(ctx.url, reqStaticPath)
      } else {
      // 返回文件
        content = this.getFile(reqStaticPath)
      }
    }

    return content
  }

  /** 获取某个目录列表
   * @param {string} url: 请求url
   * @param {string} reqStaticPath: 请求资源路径
   * @return {string} 显示目录and文件的html
   */
  getDir (url, reqStaticPath) {
    const list = []
    if (url !== '/') list.push('<li><a href="../">../</a>')
    const contentList = this.getWalk(reqStaticPath)

    contentList.forEach(item => {
      list.push(`<li><a href="${url === '/' ? '' : url}/${item}">${item}</a>`)
    })

    return `
      <ul>
        ${list.join('\n\r')}
      </ul>
    `
  }

  /** 获取目录and文件信息
   * @param {string} reqStaticPath: 请求资源路径
   * @return {array} 当前路径下的目录、文件
   */
  getWalk (reqStaticPath) {
    const files = fs.readdirSync(reqStaticPath)
    const dirList = []
    const fileList = []

    for (const i in files) {
      const itemArr = files[i].split('.')
      const itemMime = (itemArr.length > 1) ? itemArr[itemArr.length - 1] : null
      if (typeof itemMime === 'undefined') {
        dirList.push(files[i])
      } else {
        fileList.push(files[i])
      }
    }

    return [...fileList, ...dirList]
  }

  /**
   * 读取文件
   * @param {string} reqStaticPath: 请求资源路径
   * @return {string|binary} 文件数据
   */
  getFile (reqStaticPath) {
    const file = fs.readFileSync(reqStaticPath, 'binary')
    const fileData = Buffer.alloc(file.length, file, 'binary')
    return fileData
  }
}

const createStaticServe = staticPath => {
  return new StaticServe(staticPath)
}

module.exports = createStaticServe
