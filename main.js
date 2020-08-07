const path = require('path')
const Koa = require('koa')
const app = new Koa()
const midStatic = require('./lib/index')
const portfinder = require('portfinder')

/* 中间件 */
app.use(midStatic(path.join(__dirname, './static')))
portfinder.basePort = 3000
portfinder.getPortPromise()
  .then(port => {
    app.listen(port, () => {
      console.log(`listen to http://localhost:${port}`)
    })
  })
