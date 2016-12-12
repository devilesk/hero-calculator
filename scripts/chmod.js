var config = require('../config.json');
var glob = require("glob")
var chmod = require('chmod');
var path = require('path');

var normalizedPath = path.normalize(config.path);
glob("{build,www,dist}/**/*.php", function (er, files) {
    console.log(files);

    files.forEach(function (filePath) {
        chmod(filePath, 755);
    });
});

glob(normalizedPath + '/**/*.php', function (er, files) {
    console.log(files);

    files.forEach(function (filePath) {
        chmod(filePath, 755);
    });
});