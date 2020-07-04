var fs = require('fs');
var path = require('path');
var fire_fs = require('fire-fs');
var child_process = require("child_process");

var platform = "web-mobile";

var buildPath = Editor.Project.path + path.sep + "build" + path.sep + platform;

var beforeBuildFinishCallBack = null;

let unCompressArray = [ //这边type 一律都是sprite-frame
  ['db://assets/source/texture/background/**/*', 'sprite-frame'],  
  ['db://assets/source_remote/texture/background/**/*', 'sprite-frame'],   
];

let moveToOutArray = [
  ['db://assets/source_remote/**/*'], 
  ['db://assets/resources/remote/**/*'], 
];

function onBuildStart(options, callback) {
  let filePath = Editor.url('packages://autobuild/uipath.txt');
  Editor.log(filePath);
  fs.writeFileSync(filePath, "");

  filePath = Editor.url('packages://autobuild/moveoutui.txt');
  Editor.log(filePath);
  fs.writeFileSync(filePath, "");

  platform = options.actualPlatform;
  Editor.log("当前平台++++  " + platform);
  buildPath = Editor.Project.path + path.sep + "build" + path.sep + platform;

  Editor.log("当前平台++++1  " + buildPath);

  callback();
}

function onBeforeBuildFinish(options, callback) {
  let buildResults = options.buildResults;

  for (let i = 0, len = unCompressArray.length; i < len; i++) {
    let path = unCompressArray[i][0];
    let type = unCompressArray[i][1];

    Editor.assetdb.queryAssets(path, type, (err, assetInfos) => {
      let filePath = Editor.url('packages://autobuild/uipath.txt');

      assetInfos.forEach((assetInfo) => {
        let depends = buildResults.getDependencies(assetInfo.uuid);
        if (depends.length > 0) {
          // sprite frame should have only one texture
          let assetPath = buildResults.getNativeAssetPath(depends[0]);   
          let fileName = getFileNameByPath(assetPath); 
          fs.appendFileSync(filePath, `${fileName},`);
          Editor.log(`Texture of ${path}: ${fileName}`);
        }
      })
    });
  }

  for (let i = 0, len = moveToOutArray.length; i < len; i++) {
    let path = moveToOutArray[i][0];
    let filePath = Editor.url('packages://autobuild/moveoutui.txt');

    Editor.assetdb.queryAssets(path, null, (err, assetInfos) => {  //目前不去取资源依赖的资源 没这必要, 但自动图集打出来的图集特殊
      assetInfos.forEach((assetInfo) => {
        if(!buildResults.containsAsset(assetInfo.uuid)) return;

        let type = buildResults.getAssetType(assetInfo.uuid);

        if (type == `folder`) return;

        if (type == `cc.SpriteFrame`) {
          let depends = buildResults.getDependencies(assetInfo.uuid);
          if (depends.length > 0) {
            // sprite frame should have only one texture
            let assetPath = buildResults.getNativeAssetPath(depends[0]);   
            let fileName = getFileNameByPath(assetPath); 
            fs.appendFileSync(filePath, `${fileName},`);
            Editor.log(`Move Out of ${path}: ${fileName}`);
          }

          fs.appendFileSync(filePath, `${assetInfo.uuid}.json,`);
          Editor.log(`Move Out of ${path}: ${assetInfo.uuid}.json`);        
        }
        else {
          let assetPath = buildResults.getNativeAssetPath(assetInfo.uuid);
          if(assetPath) {
            let fileName = getFileNameByPath(assetPath); 
            fs.appendFileSync(filePath, `${fileName},`);
            Editor.log(`Move Out of ${path}: ${fileName}`);
          }

          fs.appendFileSync(filePath, `${assetInfo.uuid}.json,`); 
          Editor.log(`Move Out of ${path}: ${assetInfo.uuid}.json`);

          let packUuid = getPackUuid(assetInfo.uuid, buildResults);
          if(packUuid) {
            fs.appendFileSync(filePath, `${packUuid}.json,`);
            Editor.log(`Move Out of ${path}: ${packUuid}.json`);
          }
        }
      });
    });
  }

  beforeBuildFinishCallBack = callback;
  startCompression(options);
}

function getPackUuid(uuid, buildResults) {
  for (const key in buildResults._packedAssets) {
    if (buildResults._packedAssets.hasOwnProperty(key)) {
      const item = buildResults._packedAssets[key];
      for (let index = 0; index < item.length; index++) {
        const element = item[index];
        if (uuid === element) {
          return key;
        }
      }
    }
  }
}

function getFileNameByPath(filePath) {
  let start = filePath.lastIndexOf("\\");
  let end = filePath.lastIndexOf(".");

  let fileName = filePath.slice(start + 1, end);
  let fileType = filePath.slice(end + 1, filePath.length);
  return `${fileName}.${fileType}`;
}

function buildFinished(options, callback) {
  platform = options.actualPlatform;
  Editor.log("当前平台++++  " + platform);
  buildPath = Editor.Project.path + path.sep + "build" + path.sep + platform;
  Editor.log("当前平台++++  " + buildPath);

  if (platform != "web-mobile") {
    startCopyOutRes();
    Editor.log(options);
    if(!options.debug) {
      setTimeout(function() {
        Editor.log("发送上传至CDN指令");
        Editor.Ipc.sendToMain('autodeploytocdn:startUpload');
      }, 1000);
    }
    else {
      Editor.log("调试包, 不上传资源到cdn");
    }
  }
  else Editor.log("不进行资源分离!!!");

  callback();

  // openTool();
}

function startCompression(options) {

  this.setTimeout(function () {
    Editor.log("当前平台" + options.actualPlatform);
    Editor.log("打包完成, 开始压缩图集");
    if (checkIsExistProject(options.actualPlatform)) {
      let compressList = loadPngFiles();
      compressionPng(compressList);
    }
  }.bind(this), 1000);

}

function startCopyOutRes() {
  let recordPath = Editor.url('packages://autobuild/moveoutui.txt');
  let file = fs.readFileSync(recordPath);
  let moveList = file.toString().split(',');

  if (moveList == null || moveList.length == 0) {
    return;
  }

  let targetPath = Editor.Project.path + path.sep + "build" + path.sep + "res";

  if (checkDir(targetPath)) {
    Editor.log("删除旧res文件夹");
    deleteFile(targetPath);
  }
  else {
    fs.mkdirSync(targetPath);
  }

  if (!res_path) return;

  Editor.log(res_path, targetPath);
  copyFileAndFolder(res_path, targetPath, moveList);
  deleteEmptyFolder(targetPath);
}

function checkIsExistProject(target) {
  let proj_path = path.sep + "build" + path.sep + target;
  res_path = null;

  res_path = Editor.Project.path + proj_path + path.sep + "res";

  Editor.log(`正在检测构建工程是否存在：${Editor.Project.path}${proj_path}`);
  try {
    let state = fs.lstatSync(`${Editor.Project.path}${proj_path}`);
    return state.isDirectory();
  } catch (error) {
    Editor.error("构建工程不存在!请先构建项目...");
    return false;
  }
}

function loadPngFiles() {
  if (!res_path) return;

  let uiFilePath = Editor.url('packages://autobuild/uipath.txt');
  let file = fs.readFileSync(uiFilePath);
  let ui_path = file.toString().split(',');

  if(!ui_path) ui_path = [];

  let list = [];
  let state = fs.lstatSync(res_path);
  if (state.isDirectory()) {
    scanFiles(res_path, ui_path, list);
  }
  return list;
}

function scanFiles(dir, ui_path, list) {
  let files = fs.readdirSync(dir);

  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let file_path = path.join(dir, file);
    let stat = fs.lstatSync(file_path);
    if (stat.isDirectory()) {
      scanFiles(file_path, ui_path, list);
    } 
    else {
      let start = file_path.lastIndexOf("\\");
      let end = file_path.lastIndexOf(".");
      let fileName = file_path.slice(start + 1, end);
      let fileType = file_path.slice(end + 1, file_path.length);
      fileName = `${fileName}.${fileType}`;

      if (ui_path.indexOf(fileName) == -1) {
        if (isPng(file_path)) {
          let item = {
            path: file_path,
            before_size: stat.size,
            name: file,
          }
          list.push(item);
        }
      } else {
        // Editor.log("no scan " + file_path + ":" + fileName);
      }
    }
  }
}

function isPng(fileName) {
  if (path.extname(fileName).toLocaleLowerCase() == ".png") {
    return true;
  } else {
    return false;
  }
}

let completeCount = 0;
let threadCount = 8;
let count = 0;

function compressionPng(compressList) {
  Editor.success("压缩图集 start!");

  let offset = parseInt(compressList.length / threadCount);

  Editor.log("图集总数量 : " + compressList.length);

  if (offset == 0) {
    threadCount = 1;
    createCompressThread(compressList, 0, compressList.length - 1, 1);
  }
  else {
    for (let i = 1; i <= threadCount; i++) {
      let startIndex = (i - 1) * offset;
      let endIndex;
      if (i != threadCount) {
        endIndex = i * offset - 1;
      } else {
        endIndex = compressList.length - 1;
      }
      createCompressThread(compressList, startIndex, endIndex, i);
    }
  }

}

function createCompressThread(list, startIndex, endIndex, i) {
  let pngquant_path = Editor.url('packages://autobuild/tool/windows/pngquant.exe');
  let cmd = pngquant_path + " --transbug --skip-if-larger --force 256 --ext .png";;

  let index = startIndex;
  let item = list[index];
  let exe_cmd = cmd + ' ' + item.path;

  function exec() {
    count++;
    // Editor.log(count + " 压缩路径 : " + item.path);
    child_process.exec(exe_cmd, {
      timeout: 3654321
    }, function (error, stdout, stderr) {
      if (stderr) {
        Editor.error("压缩图集 error : " + stderr);
        //return;
      }
      if (index < endIndex) {
        index++;
        item = list[index];
        exe_cmd = cmd + ' ' + item.path;
        exec();
      } else {
        completeCount++;
        Editor.success(i + "号线程完成压缩");
        Editor.success(completeCount);
        Editor.success(threadCount);
        if (completeCount == threadCount) {
          Editor.success("压缩数量 " + count);
          Editor.success("压缩图集 finished!");
          Editor.success("打包构建流程结束");

          beforeBuildFinishCallBack && beforeBuildFinishCallBack();
        }
      }
    })
  }

  exec();
}

function openTool() {
  let toolsPath = Editor.Project.path + path.sep + "tools" + path.sep + "autobuild" + path.sep + "CocosBuildUtils.exe";

  Editor.log(toolsPath);

  child_process.exec(toolsPath, {
    timeout: 3654321
  }, function (error, stdout, stderr) {
    Editor.log(error);
    Editor.log(stdout);
    Editor.log(stderr);

  });
}

//检查目录是否存在
function checkDir(path) {
  try {
    let state = fs.lstatSync(path);
    if (state.isDirectory()) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

//复制文件, 文件夹
function copyFileAndFolder(path, targetpath, filter) {
  var files = [];

  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {

      var curPath = path + "/" + file;
      var curTargetPath = targetpath + "/" + file;

      if (fs.statSync(curPath).isDirectory()) {
        if (!checkDir(curTargetPath)) fs.mkdirSync(curTargetPath);
        copyFileAndFolder(curPath, curTargetPath, filter);
      } else {

        let start = curPath.lastIndexOf("/");
        let end = curPath.lastIndexOf(".");
        let fileName = curPath.slice(start + 1, end);
        let fileType = curPath.slice(end + 1, curPath.length);

        if (fileType == "ttf") fileName = fileName + `.${fileType}`;
        else fileName = fileName.slice(0, fileName.indexOf(".")) + `.${fileType}`; //去除md5值

        // Editor.log(curPath);
        // Editor.log(fileName);
        if (filter.indexOf(fileName) != -1) {
          fire_fs.copySync(curPath, curTargetPath);
          fs.unlinkSync(curPath);
          Editor.log(`delete res ------ ${curPath}`);
        }
      }
    });
  }
}

//删除目录中所有文件
function deleteFile(path) {
  var files = [];

  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        deleteFile(curPath);
      } else {
        fire_fs.removeSync(curPath);
      }
    });
  }
}

//清空目录下的空文件夹
function deleteEmptyFolder(path) {
  var files = [];

  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);

    files.forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        deleteEmptyFolder(curPath);
      }
    });

    if (fs.readdirSync(path).length == 0) {
      fire_fs.removeSync(path);
    }

  }

}


module.exports = {
  load() {
    Editor.Builder.removeListener('build-start', onBuildStart);
    Editor.Builder.removeListener('before-change-files', onBeforeBuildFinish);
    Editor.Builder.removeListener('build-finished', buildFinished);

    Editor.Builder.on('build-start', onBuildStart);
    Editor.Builder.on('before-change-files', onBeforeBuildFinish);
    Editor.Builder.on('build-finished', buildFinished);
  },

  unload() {
    Editor.Builder.removeListener('build-start', onBuildStart);
    Editor.Builder.removeListener('before-change-files', onBeforeBuildFinish);
    Editor.Builder.removeListener('build-finished', buildFinished);
  },
};