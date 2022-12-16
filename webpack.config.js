const path = require('path')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports={
    mode : 'development' , 
    entry : './scr/app.js' ,
    output : {
        path : path.resolve(__dirname,'scr/views/js'),
        filename : 'bundle.js'
    },
    watch : true ,
    plugins: [
        new NodePolyfillPlugin()
    ],
    resolve: {
  
        fallback: {
          net : false,
          url : false ,
          fs : false ,
          os : false ,
          async_hooks: false,
        },
      }
}

