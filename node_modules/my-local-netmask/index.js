#! /usr/bin/env node

var n = require('os').networkInterfaces()

var myNetmask = module.exports = function () {
  for(var k in n) {
    var inter = n[k]
    for(var j in inter)
      if(inter[j].family === 'IPv4' && !inter[j].internal)
        return inter[j].netmask
  }
}

if(!module.parent)
  return console.log(myNetmask())
