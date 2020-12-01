/*
 * @Descripttion: 
 * @Author: chelsea.jiang
 * @Date: 2020-11-30 20:20:10
 * @LastEditors: chelsea.jiang
 * @LastEditTime: 2020-12-01 19:28:58
 */
const RENDER_TO_DOM = Symbol("render to dom"); // 私有属性

const xixiToy = {
    createElement,
    render,
};

class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }
    setAttribute(name, value) {
        if (name.match(/^on([\s\S]+)$/)) {
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
        } else {
            this.root.setAttribute(name, value);
        }
    }
    appendChild(component) {
        let range = document.createRange();
        // 因为是appendChild 所以是插在最后
        range.setStart(this.root, this.root.childNodes.length);
        range.setEnd(this.root, this.root.childNodes.length);
        component[RENDER_TO_DOM](range);
    }
    [RENDER_TO_DOM](range) {
        range.deleteContents(); // 删除内容
        range.insertNode(this.root); 
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content);
    }
    [RENDER_TO_DOM](range) {
        range.deleteContents(); // 删除内容
        range.insertNode(this.root); 
    }
}

export class Component {
    constructor() {
        this._root = null;
        this.props = Object.create(null);
        this.children = [];
        this._range = null;
    }
    setAttribute(name, value) {
        this.props[name] = value;
    }
    appendChild(component) {
        this.children.push(component);
    }
    /**
     * 一个递归过程
     * @param {*} range 重新渲染
     * @return {*}
     */
    [RENDER_TO_DOM](range) {
        this._range = range;
        this.render()[RENDER_TO_DOM](range);
    }
    reRender() {
        this._range.deleteContents();
        this[RENDER_TO_DOM](this._range);
    }
    setState(newState) {
        if (this.state === null || typeof this.state !== 'object') {
            this.state = newState;
            this.reRender();
            return;
        }
        let merge = (oldState, newState) => {
            for (let p in newState) {
                if (oldState[p] === null || typeof oldState[p] !== "object") {
                    oldState[p] = newState[p];
                } else {
                    merge(oldState[p], newState[p]); // 深拷贝
                }
            }
        }
        merge(this.state, newState);
        this.reRender();
    }
}

/**
 * @name: chelsea.jiang
 * @test: 
 * @msg: 
 * @param {*} type
 * @param {*} attributes 属性
 * @param {array} children 子节点
 * @return {*}
 */
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

function render(component, parentElement) {
    let range = document.createRange();
    range.setStart(parentElement, 0);
    range.setEnd(parentElement, parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range);
}

export default xixiToy;