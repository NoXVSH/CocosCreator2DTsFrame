var fs = require('fs');
var path = require('path');
var child_process = require("child_process");

var platform = "web-mobile";

var buildPath = Editor.Project.path + path.sep + "build" + path.sep + platform;

var beforeBuildFinishCallBack = null;

let unCompressArray = [ //这边type 一律都是sprite-frame
  // ['db://assets/source/texture/background/**/*', 'sprite-frame'],
  // ['db://assets/resources/texture/**/*', 'sprite-frame'],
  // ['db://assets/remoteres/texture/**/*', 'sprite-frame'],
];

function onBuildStart(options, callback) {
  let filePath = Editor.url('packages://autobuild/uipath.txt');
  Editor.log(filePath);
  fs.writeFileSync(filePath, "");

  platform = options.actualPlatform;
  Editor.log("当前平台++++  " + platform);
  buildPath = Editor.Project.path + path.sep + "build" + path.sep + platform;

  Editor.log("当前平台++++1  " + buildPath);

  callback();
}

function onBeforeBuildFinish(options, callback) {
  if (options.buildScriptsOnly) {
    callback();
    return;
  }

  for (let i = 0, len = unCompressArray.length; i < len; i++) {
    let path = unCompressArray[i][0];
    let type = unCompressArray[i][1];

    Editor.assetdb.queryAssets(path, type, (err, assetInfos) => {
      let filePath = Editor.url('packages://autobuild/uipath.txt');

      assetInfos.forEach((assetInfo) => {

        options.bundles.forEach(bundle => {
          let buildResults = bundle.buildResults;
          let depends = buildResults.getDependencies(assetInfo.uuid);
          if (depends.length > 0) {
            // sprite frame should have only one texture
            let assetPath = buildResults.getNativeAssetPath(depends[0]);
            let fileName = getFileNameByPath(assetPath);
            fs.appendFileSync(filePath, `${fileName},`);
            Editor.log(`Texture of ${path}: ${fileName}`);
          }
        });

      });
    });
  }

  beforeBuildFinishCallBack = callback;
  startCompression(options);
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

  if (platform != "web-mobile" && !options.buildScriptsOnly) {
    Editor.log(options);
    if (!options.debug) {
      setTimeout(function () {
        Editor.log("发送上传至CDN指令");
        Editor.Ipc.sendToMain('autodeploytocdn:startUpload');
      }, 1000);
    }
    else {
      Editor.log("调试包, 不上传资源到cdn");
    }
  }

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

function checkIsExistProject(target) {
  let proj_path = path.sep + "build" + path.sep + target;
  res_path = null;

  res_path = Editor.Project.path + proj_path + path.sep + "assets";

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

  if (!ui_path) ui_path = [];

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
        // Editor.success(completeCount);
        // Editor.success(threadCount);
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

// function openTool() {
//   let toolsPath = Editor.Project.path + path.sep + "tools" + path.sep + "autobuild" + path.sep + "CocosBuildUtils.exe";

//   Editor.log(toolsPath);

//   child_process.exec(toolsPath, {
//     timeout: 3654321
//   }, function (error, stdout, stderr) {
//     Editor.log(error);
//     Editor.log(stdout);
//     Editor.log(stderr);

//   });
// }

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