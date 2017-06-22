var smartSass = require("./smartSass");
var path = require('path');

console.log("Smart Sass, files to compile:\n");
console.log(smartSass(["sass/**/*.*"], "css"));

module.exports.app;
