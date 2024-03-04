# @gritwork/swaggerToApi

将`swagger`的json转为指定的前端格式, swagger2目前仅仅转为ts，swagger3目前仅仅转为js
## 用法
```Typescript
interface Config {
    baseURL: string; // swaggerjson的host
    dir: string; // 生成的位置
    template?: string; // 模板的位置，不填则使用默认 
    modules: ModulesItem[]; 
    commonUrl?: string; // 只在swagger3中出现
}
interface ModulesItem {
    name: string;
    url: string;
}
```
```js

// transform(config: Config, DEBUG?: boolean = false)  DEBUG是否开启打印
// registerHelper用于注册handlebars的helper函数

// swagger2 ==》 ts
// index.js
const {swagget2} = require('@gritwork/swaggerToApi')
swagget2.transform(config)

// swagger3 ==> js
const {swagget3} = require('@gritwork/swaggerToApi')
swagget3.transform(config)
```
运行
```shell
node ./index.js
```

## 模板
> 不填入template字段则使用默认模板
> 
> 使用`handlebars`，可自定义替换模板
# swaggertoapi
