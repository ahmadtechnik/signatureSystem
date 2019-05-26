var fs = require("fs");
var fileManger = require("../fileManager/fileManager");
exports.createFolderIfNotExist = (path) => {
    if (!fs.existsSync(path)) {
        console.log("folder not exist....")
        fs.mkdirSync(path);
        console.log("folder created....", path);
        return path;
    }
    return path;
}