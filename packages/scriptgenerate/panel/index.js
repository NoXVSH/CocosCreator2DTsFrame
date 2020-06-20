const path = require('path');
const htmlPath = Editor.url(`packages://scriptgenerate/panel/html/index.html`);
const cssPath = Editor.url(`packages://scriptgenerate/panel/css/index.css`);
const fireFs = require('fire-fs');
const moduleFolderPath = `${Editor.Project.path}${path.sep}assets${path.sep}script${path.sep}module${path.sep}`;
const moduleDbPath = 'db://assets/script/module/';

let createVue = function (element) {
  let vue = new Vue({
    el: element,
    data: {
      moduleName: ""
    },

    watch: {

    },

    methods: {
      btnClick() {
        this.createScript();
      },

      createScript() {
        let moduleName = this.moduleName;

        if (moduleName == "" || !(/^[A-Z][A-z0-9]*$/).test(moduleName)) {
          Editor.error("模块名不符合规范, 必须首字母大写");
          return;
        }

        let targetPath = `${moduleFolderPath}${moduleName.toLowerCase()}`;
        let viewPath = `${targetPath}${path.sep}view`;
        let modelPath = `${targetPath}${path.sep}model`;
        let constPath = `${targetPath}${path.sep}const`;

        if (fireFs.existsSync(targetPath)) {
          Editor.error(`模块目录已经存在${targetPath}`);
          return;
        }

        fireFs.mkdirSync(targetPath);
        fireFs.mkdirSync(viewPath);
        fireFs.mkdirSync(modelPath);
        fireFs.mkdirSync(constPath);

        let managerScriptPath = `${moduleFolderPath}${moduleName.toLowerCase()}${path.sep}${moduleName}Manager.ts`;
        let modelScriptPath = `${modelPath}${path.sep}${moduleName}Model.ts`;
        let constScriptPath = `${constPath}${path.sep}${moduleName}Const.ts`;

        let managerScriptTemplate = fireFs.readFileSync(Editor.url(`packages://scriptgenerate/panel/scripttemplate/manager.txt`));
        let modelScriptTemplate = fireFs.readFileSync(Editor.url(`packages://scriptgenerate/panel/scripttemplate/model.txt`));

        managerScriptTemplate = managerScriptTemplate.toString().replace(/_ModuleName_/g, moduleName);
        modelScriptTemplate = modelScriptTemplate.toString().replace(/_ModuleName_/g, moduleName);

        fireFs.writeFileSync(managerScriptPath, managerScriptTemplate);
        fireFs.writeFileSync(modelScriptPath, modelScriptTemplate);
        fireFs.writeFileSync(constScriptPath, "");

        Editor.assetdb.refresh(`${moduleDbPath}${moduleName.toLowerCase()}`);
        Editor.log(`生成模块目录完成${targetPath}`);
      }
    }
  });

  return vue;
}


Editor.Panel.extend({
  template: fireFs.readFileSync(htmlPath, 'utf-8'),
  style: fireFs.readFileSync(cssPath, 'utf-8'),

  $: {
    root: '#root',
  },

  ready() {
    createVue(this.root);
  },

  messages: {

  }
});