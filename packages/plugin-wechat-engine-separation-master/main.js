'use strict';

const Path = require('fire-path');
const Fs = require('fire-fs');
const crypto = require('crypto');
const { promisify } = require('util');
const Globby = require('globby');
const Dialog = require('electron').dialog;

// 该插件目前支持的 Cocos Creator 编辑器版本
const VERSIONS = ['2.0.5', '2.0.6', '2.0.7', '2.0.8', '2.0.9', '2.0.10', '2.1.0', '2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.2.0'];

// 由于某些版本的插件有兼容性问题需要进行特殊处理
let Plugin_Version = {
    '2.1.3': '2.2.1',
};

// 判断是否为正式版本正则表达式
const GA_VERSION_REX = /^v?[0-9.]*(?:-p.[0-9]+)?$/;

async function handlerSeparateEngine (opts, cb) {
  if (opts.platform !== 'wechatgame' && (opts.actualPlatform && opts.actualPlatform !== 'wechatgame')) {
    return cb();
  }
  try {
    Editor.info('启动适配微信小游戏引擎插件');

    // 调整 cocos2d-js-min.js 的文件存放结构用于满足微信小游戏引擎插件的功能
    const cocos_path = Path.join(opts.dest, 'cocos');
    let cocosEngineName = 'cocos2d-js-min.js';
    if (!Fs.existsSync(cocos_path)) {
      // 创建 cocos 文件夹
      Fs.ensureDirSync(cocos_path);
      
      Editor.info(`移动 cocos2d-js-min.js 文件到 ${cocos_path} 中`);

      let cocos2dPath = Path.join(opts.dest, 'cocos2d-js-min.js');
      if (opts.md5Cache) {
        let paths = await promisify(Globby)(Path.join(opts.dest, 'cocos2d-js-min.*.js'), { nodir: true });
        cocos2dPath = paths[0];
      }
      // 移动 cocos2d-js-min.js 
      await promisify(Fs.move)(cocos2dPath, Path.join(cocos_path, 'cocos2d-js-min.js'));

      cocosEngineName = Path.basename(cocos2dPath);
    }

    let REQUIRE_ENGINE_CODE = [
      `require(settings.debug ? 'cocos2d-js.js' : '${cocosEngineName}');`,
      `require('cocos/${cocosEngineName}');`
    ];

    Editor.info("修改 game.js 代码中 require cocos2d-js-min.js 为 requirePlugin('cocos')");
    // 更新 game.js
    const gameJSPath = Path.join(opts.dest, 'game.js');
    let content = Fs.readFileSync(gameJSPath, 'utf-8');
    
    REQUIRE_ENGINE_CODE.forEach((code) => {
      if (content.indexOf(code) > -1) {
        content = content.replace(code, "requirePlugin('cocos')");
        Fs.writeFileSync(gameJSPath, content);
        return;
      } 
    });

    Editor.info('新增 plugins 字段到 game.json');
    // 更新 game.json
    const gameJsonPath = Path.join(opts.dest, 'game.json');
    content = Fs.readJsonSync(gameJsonPath, 'utf8');
    let engineVersion = Editor.versions['CocosCreator'];
    content['plugins'] = {
      cocos: {
        provider: "wx7095f7fa398a2f30",
        version: Plugin_Version[engineVersion] || engineVersion,
        path: 'cocos'
      }
    };
    Fs.writeFileSync(gameJsonPath, JSON.stringify(content, null, 2));

    Editor.info(`拷贝 plugin.json 到 ${cocos_path}`);
    // 拷贝 plugin.json
    Fs.copySync(Path.join(__dirname, 'cocos/plugin.json'), Path.join(cocos_path, 'plugin.json'));

    Editor.info(`拷贝 signature.json 到 ${cocos_path}`);
    // 更新 md5 后进行拷贝 signature.json
    const signatureJsonPath = Path.join(cocos_path, 'signature.json');
    Fs.copySync(Path.join(__dirname, 'cocos/signature.json'), signatureJsonPath);
    content = Fs.readJsonSync(signatureJsonPath, 'utf8');
    let signature = content.signature[0];
    const data = Fs.readFileSync(Path.join(cocos_path, 'cocos2d-js-min.js'));
    signature['md5'] = crypto.createHash('md5').update(data).digest('hex');
    Fs.writeFileSync(signatureJsonPath, JSON.stringify(content, null, 2));

    Editor.info(`适配 project.config.json `);
    // 更新 game.json
    const projectConfigPath = Path.join(opts.dest, 'project.config.json');
    content = Fs.readJsonSync(projectConfigPath, 'utf8');
    content['libVersion'] = '9.9.9';

    Fs.writeFileSync(projectConfigPath, JSON.stringify(content, null, 2));

    Editor.info('适配微信小游戏引擎插件完成');
  }
  catch (e) {
    Editor.log(e);
  }
  cb();
}

function checkPlugin (opts, cb) {
    if (opts.platform !== 'wechatgame' && (opts.actualPlatform && opts.actualPlatform !== 'wechatgame')) {
        return cb();
    }
    try {
        let error = '';
        if (VERSIONS.indexOf(Editor.versions.CocosCreator) === -1) {
            error = `微信小游戏引擎兼容插件只适用 Cocos Creator 版本: ${VERSIONS.join('|')}`;
            Dialog.showErrorBox('构建警告', error);
            return cb(new Error(error));
        }

        let localSettings = Editor.Profile.load('profile://local/settings.json');
        let globalSettings = Editor.Profile.load('profile://global/settings.json');
        let useDefaultEngine = globalSettings.data['use-default-js-engine'];
        if (localSettings.data['use-global-engine-setting'] === false) {
            useDefaultEngine = (localSettings.data['use-default-js-engine'] === true);
        }
        let cocos2dVersion = Editor.versions['CocosCreator'];
        if (!useDefaultEngine || !GA_VERSION_REX.test(cocos2dVersion)) {
            error = `引擎插件功能仅支持 Cocos Creator 正式版本并且使用内置引擎`;
            Dialog.showErrorBox('构建警告', error);
            return cb(new Error(error));
        }

        if (!!opts.debug) {
            error = `微信小游戏引擎插件不适用调试模式`;
            Dialog.showErrorBox('构建警告', error);
            return cb(new Error(error));
        }
    } catch (e) {
        Editor.log(e);
    }
    cb();
}

module.exports = {
  load () {
    Editor.Builder.on('build-start', checkPlugin);
    Editor.Builder.on('build-finished', handlerSeparateEngine);
  },

  unload () {
    Editor.Builder.removeListener('build-start', checkPlugin);
    Editor.Builder.removeListener('build-finished', handlerSeparateEngine);
  },
};

