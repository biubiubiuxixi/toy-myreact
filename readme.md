<!--
 * @Descripttion: 
 * @Author: chelsea.jiang
 * @Date: 2020-11-30 21:27:48
 * @LastEditors: chelsea.jiang
 * @LastEditTime: 2020-11-30 21:27:48
-->
#### 第1步 新建文件
```
mkdir toy-myreact
cd toy-myreact
```

#### 第2步 npm 初始化
```
npm init
```

#### 第3步 配置webpack
```
npm install webpack webpack-cli --save-dev
```

#### 第3步 执行`webpack`打包
```
npx webpack
```

因为没有指定好webpack的config文件，会发现报错
![4bc9f368d6da2113431d064fe8bc163a.png](evernotecid://D37885D9-11A9-4C43-81D5-9EED36202623/wwwevernotecom/196305820/ENResource/p64)

#### 第4步 新建`webpack`的`config`文件 `webpack.config.js`
```
module.exports = {
    entry: {
        main: './main.js',
    },
};
```
指定一个入口文件，module.exports node的写法 配置里不做babel转化

#### 第5步 新建`webpack`的入口文件 `main.js` 空文件并执行`npx webpack`打包

打包成功后，输出一个dist目录，发现这个文件的内容并看不懂，想要看懂打包出来的文件怎么办呢？？？ 请看下一步

#### 第6步 webpack 配置内加入两个配置项
```
module.exports = {
    entry: {
        main: './main.js',
    },
    mode: "development",
    optimization: {
        minimize: false,
    },
};
```

#### 第7步 使用babel

babel 把新版本的js文件翻译成老版本的js文件

##### 安装
```
npm install --save-dev babel-loader @babel/core @babel/preset-env
```

##### 配置babel-loader
presets babel一系列的快捷方式
```
module.exports = {
    entry: {
        main: './main.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    mode: "development",
    optimization: {
        minimize: false,
    },
};
```

##### 在`main.js`内写一个`for`循环， 执行`webpack`，看是否会翻译成旧版本的js

```
for (let i of [1, 2, 3]) {
    console.log(i);
}
```
可以看到一个正常的for循环代码
![58b193e6bfc98e378893dd01298fb7ff.png](evernotecid://D37885D9-11A9-4C43-81D5-9EED36202623/wwwevernotecom/196305820/ENResource/p65)

#### 第8步 处理`jsx`
`@babel/preset-env` 是不包含jsx的执行能力的

在`main.js`内 写`jsx`并执行，报错
```
const a = <div />;
```
![56ef3a851035e402ffb532bc83330d2c.png](evernotecid://D37885D9-11A9-4C43-81D5-9EED36202623/wwwevernotecom/196305820/ENResource/p66)

##### 安装包
```
npm install @babel/plugin-transform-react-jsx --save-dev
```

`@babel/plugin-transform-react-jsx`是专门用来处理`jsx`的`plugin`

##### 配置 `webpack`

```
rules: [
    {
        test: /\.js$/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-transform-react-jsx'],
            },
        },
    },
],
```

执行后 成功

![c9b01703f56ca792e4cf9883aeeb131e.png](evernotecid://D37885D9-11A9-4C43-81D5-9EED36202623/wwwevernotecom/196305820/ENResource/p67)

直接翻译出带`React`的函数名字, `React.createElement`

#### 第9步 带React的函数名字改成我们想要的设置

继续更改webpack配置
```
rules: [
    {
        test: /\.js$/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env'],
                plugins: [['@babel/plugin-transform-react-jsx', {pragma: 'xixiToy.createElement'}]],
            },
        },
    },
],
```

执行webpack， 发现`React`函数名已经去掉了 变成了我们自己想要的名字

![69a7b04024f667fe79593a11d7459e40.png](evernotecid://D37885D9-11A9-4C43-81D5-9EED36202623/wwwevernotecom/196305820/ENResource/p68)

#### 第10步 如何去实现jsx翻译出来的函数

增加属性和子节点
```
const xixiToy = {
    createElement,
};

/**
 * @name: chelsea.jiang
 * @test: 
 * @msg: 
 * @param {*} tagName 标签名
 * @param {*} attributes 属性
 * @param {array} children 子节点
 * @return {*}
 */
function createElement(tagName, attributes, ...children) {
    let e = document.createElement(tagName);
    for (let attr in attributes) {
        e.setAttribute(attr, attributes[attr]);
    }
    for (let child of children) {
        e.appendChild(child);
    }
    return e;
}

window.a =  (<div id="a" class="x">
    <div></div>
</div>);

```

执行webpack编译之后，发现已不再报错

![6f8f730d26c001ad6c8dec772b7e8430.png](evernotecid://D37885D9-11A9-4C43-81D5-9EED36202623/wwwevernotecom/196305820/ENResource/p71)

jsx 已具备初步的可用性

但是当文本节点的时候怎么办呢???


#### 第11步 文本节点处理

```
for (let child of children) {
    if (typeof child === 'string') {
        child = document.createTextNode(child);
    }
    e.appendChild(child);
}
```

#### `div` 改为自己的组件呢？？

```
window.a =  (<div id="a" class="x">
    <div>aaaa</div>
    <div>bbb</div>
    <MyComponent>cccc</MyComponent>
</div>);
```

`MyComponent` 编译后已不是带引号的标签

#### 第12步 组件特殊处理
main.html
```
<body></body>
<script src="main.js"></script>
```

xixiToy.js
```
const xixiToy = {
    createElement,
    render,
};

class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }
    setAttribute(name, value) {
        this.root.setAttribute(name, value);
    }
    appendChild(component) {
        this.root.appendChild(component.root);
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content);
    }
}

export class Component {
    constructor() {
        this._root = null;
        this.props = Object.create(null);
        this.children = [];
    }
    setAttribute(name, value) {
        this.props[name] = value;
    }
    appendChild(component) {
        this.children.push(component);
    }
    get root() {
        if (!this._root) {
            this._root = this.render().root;
        }
        return this._root;
    }
}

function createElement(type, attributes, ...children) {
    let e;
    if (typeof type  === 'string') {
        e = new ElementWrapper(type);
    } else {
        e = new type;
    }
    for (let attr in attributes) {
        e.setAttribute(attr, attributes[attr]);
    }
    for (let child of children) {
        if (typeof child === 'string') {
            child = new TextWrapper(child);
        }
        e.appendChild(child);
    }
    return e;
}

function render(component, parentElement) {
    parentElement.appendChild(component.root);
}

export default xixiToy;
```

main.js
```
import xixiToy, { Component } from './xixiToy.js';
const { render } = xixiToy;
class MyComponent extends Component {
    render() {
        return (
            <div>
                <h1>111111</h1>
                {this.children}
            </div>
        );
    }
}

render(<div id="a" class="x">
    <div>aaaa</div>
    <div>bbb</div>
    <MyComponent id='c'>cccc</MyComponent>
</div>, document.body);
```

最后会发现控制台还是报错
![e47056161be796b42369dbed2d0ba359.png](evernotecid://D37885D9-11A9-4C43-81D5-9EED36202623/wwwevernotecom/196305820/ENResource/p72)

是因为在`createElement` child做处理的时候没有考虑到数组的情况

昨晚改造后，运行正常
```
function createElement(type, attributes, ...children) {
    let e;
    if (typeof type  === 'string') {
        e = new ElementWrapper(type);
    } else {
        e = new type;
    }
    for (let attr in attributes) {
        e.setAttribute(attr, attributes[attr]);
    }
    const insertChildren = (children) => {
        for (let child of children) {
            if (typeof child === 'string') {
                child = new TextWrapper(child);
            }
            if (typeof child === 'object' && child instanceof Array) {
                insertChildren(child);
            } else {
                e.appendChild(child);
            }
        }
    }
    insertChildren(children);
    return e;
}
```





