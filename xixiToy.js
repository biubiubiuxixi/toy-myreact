/*
 * @Descripttion: 
 * @Author: chelsea.jiang
 * @Date: 2020-11-30 20:20:10
 * @LastEditors: chelsea.jiang
 * @LastEditTime: 2020-11-30 21:25:30
 */

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
    parentElement.appendChild(component.root);
}

export default xixiToy;