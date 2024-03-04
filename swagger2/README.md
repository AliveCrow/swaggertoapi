# @gritwork/swagger2ts

将`swagger v2`的json转为指定的前端格式，仅支持v2版本

## 用法
```Typescript
interface Config {
    baseURL: string; // swaggerjson的host
    dir: string; // 生成的位置
    template?: string; // 模板的位置，不填则使用默认 
    modules: ModulesItem[]; 
}
interface ModulesItem {
    name: string;
    url: string;
}
```
```node
// index.js
const {swagget2ts, registerHelper} = require('@gritwork/swagger2ts')
// swagget2ts(config: Config, DEBUG?: boolean = false)  DEBUG是否开启打印
// registerHelper用于注册handlebars的helper函数
swagget2ts(config)
```
运行
```shell
node ./index.js
```

## 模板
> 不填入template字段则使用默认模板
> 
> 使用`handlebars`，可自定义替换模板
