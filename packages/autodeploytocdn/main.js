'use strict';

const path = require('path');
const SftpClient = require('ssh2-sftp-client');
const SSH2 = require("ssh2");
const compressing = require('compressing');
const fs = require('fs');

let sftpConfig = {
  host: "",
  port: "",
  username: "",
  password: "",
};

const remotePath = "/xx/xx/xx/xx/xx/xx/res.zip";  //跟着项目走
const shRemotePath = "/xx/xx/xx/xx/xx/xx/res.sh"; //跟着项目走

const localCompressPath = `${Editor.Project.path}${path.sep}build${path.sep}res`;
const localPath = `${Editor.Project.path}${path.sep}build${path.sep}res.zip`;

function compressRes() {
  let p = new Promise((resovle, reject) => {
    compressing.zip.compressDir(localCompressPath, localPath)
      .then(() => {
        resovle();
      })
      .catch(err => {
        Editor.error("压缩失败");
        reject(err);
      });
  });

  return p;
}

function uploadToCdn() {
  let p = new Promise((resovle, reject) => {
    const sftp = new SftpClient();
    sftp
      .connect(sftpConfig)
      .then(() => {
        Editor.log('----------------------------- 连接远程资源服成功,上传中... -----------------------------');
        return sftp.fastPut(localPath, remotePath);
      })
      .then(data => {
        Editor.log('----------------------------- 上传完成,及时清除缓存 ----------------------------');
        Editor.log(data);
        sftp.end()
        resovle();
      })
      .catch(err => {
        Editor.error('----------------------------- 上传失败 -----------------------------');
        sftp.end()
        reject(err);
      });
  });

  return p;
}

function unZipRes() {
  let p = new Promise((resolve, reject) => {
    const conn = new SSH2.Client();
    Editor.log("开始连接");
    connectSsh(conn, sftpConfig)
      .then(() => {
        Editor.log("开始解压");
        return execShellCmd(conn, shRemotePath);
      })
      .then(() => {
        conn.end();
        resolve();
      })
      .catch((err) => {
        conn.end();
        reject(err);
      });
  });

  return p;
}

function connectSsh(conn, config) {
  let p = new Promise((resovle, reject) => {
    conn.on("ready", function () {
      resovle();
    }).on('error', function (err) {
      Editor.log("connect error!");
      reject(err);
    }).on('end', function () {
      Editor.log("connect end!");
    }).on('close', function (had_error) {
      Editor.log("connect close");
    }).connect(config);
  });

  return p;
}

function execShellCmd(conn, cmd) {
  let p = new Promise((resolve, reject) => {
    conn.exec(cmd, function (err, stream) {
      if (err) {
        reject(err);
        return;
      }

      stream.on('close', function (code, signal) {
        resolve();
      }).on('data', function (data) {
        Editor.log('STDOUT: ' + data);
      }).stderr.on('data', function (data) {
        Editor.log('STDERR: ' + data);
      });
    });
  });

  return p;
};


module.exports = {
  load() {
    // execute when package loaded
  },

  unload() {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {
    'startUpload'() {
      if(!fs.existsSync(localCompressPath)) {
        Editor.error(`${localCompressPath}文件夹不存在`);
        Editor.error("自动上传资源至CDN流程失败");
        return;
      }

      compressRes()
        .then(() => {
          Editor.log("压缩完成, 开始上传至cdn");
          return uploadToCdn();
        })
        .then(() => {
          Editor.log("上传完成, 开始压缩");
          return unZipRes();
        })
        .then(() => {
          Editor.log("上传至CDN完成");
        })
        .catch((err) => {
          Editor.error("自动上传资源至CDN流程失败");
          Editor.error(err);
        });
    },

  },
};