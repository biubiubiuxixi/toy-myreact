/*
 * @Descripttion: 
 * @Author: chelsea.jiang
 * @Date: 2020-11-30 20:20:10
 * @LastEditors: chelsea.jiang
 * @LastEditTime: 2020-12-02 20:32:15
 */
const RENDER_TO_DOM = Symbol("render to dom"); // 私有属性

const xixiToy = {
    createElement,
    render,
};

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
    get vdom() {
        return this.render().vdom;
    }
    // get vchildren() {
    //     return this.children.map((child) => child.vdom);
    // }
    /**
     * 一个递归过程
     * @param {*} range 重新渲染
     * @return {*}
     */
    [RENDER_TO_DOM](range) {
        this._range = range;
        this._vdom = this.vdom;
        this._vdom[RENDER_TO_DOM](range);
    }
    // vdom和实 dom比对
    update() {
        // 递归访问 vdom
        let isSameNode = (oldNode, newNode) => {
            // 比较根节点是否相同
            // type 类型不同
            if (oldNode.type !== newNode.type) return false;

            // props 属性不同同
            for (let name in newNode.props) {
                if (newNode.props[name] !== oldNode.props[name]) return false;
            }
            // 属性数量不同
            if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) return false;
            
            // 文本节点
            if (newNode.type === "#text") {
                if (newNode.content !== oldNode.content) return false;
            }

            return true;
        }
        let update = (oldNode, newNode) => {
            // 比较 1、根节点type、props, 2、子节点 children
            // #text content => replace
            if (!isSameNode(oldNode, newNode)) {
                newNode[RENDER_TO_DOM](oldNode._range);
                return;
            }
            newNode._range = oldNode._range;

            let newChildren = newNode.vchildren;
            let oldChildren = oldNode.vchildren;

            if (!newChildren || !newChildren.length) {
                return; // 当没有 children
            }
            let tailRange = oldChildren[oldChildren.length - 1]._range;

            for (let i = 0; i < newChildren.length; i++) {
                let newChild = newChildren[i];
                let oldChild = oldChildren[i];
                if (i < oldChildren.length) {
                    update(oldChild, newChild);
                } else {
                    let range = document.createRange();
                    range.setStart(tailRange.endContainer, tailRange.endOffset);
                    range.setEnd(tailRange.endContainer, tailRange.endOffset);
                    newChild[RENDER_TO_DOM](range);
                    tailRange = range;
                }
            }

        }
        let vdom = this.vdom
        update(this._vdom, vdom); // 旧 新
        this._vdom = vdom;
    }
    /*reRender() {
        // 先插入，再做清空
        let oldRange = this._range;

        let range = document.createRange();
        range.setStart(oldRange.startContainer, oldRange.startOffset);
        range.setEnd(oldRange.startContainer, oldRange.startOffset); // 起点和终点一样
        this[RENDER_TO_DOM](range);
    
        oldRange.setStart(range.endContainer, range.endOffset);
        oldRange.deleteContents();
    }*/
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
        this.update();
    }
}

class ElementWrapper extends Component {
    constructor(type) {
        super(type);
        this.type = type;
        // this.root = document.createElement(type);
    }
    /*
    // 存 this.props
    setAttribute(name, value) {
        if (name.match(/^on([\s\S]+)$/)) {
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
        } else {
            if (name === "className") {
                this.root.setAttribute("class", value);
            } else {
                this.root.setAttribute(name, value);
            }
        }
    }
    // 存 this.children
    appendChild(component) {
        let range = document.createRange();
        // 因为是appendChild 所以是插在最后
        range.setStart(this.root, this.root.childNodes.length);
        range.setEnd(this.root, this.root.childNodes.length);
        component[RENDER_TO_DOM](range);
    }
    */
    get vdom() {
        // 保证任何一个 vdom 属性树里面取出来，children 都有 vchildren 这个属性
        this.vchildren = this.children.map((child) => child.vdom);
        return this;
        /*{
            type: this.type,
            props: this.props,
            children: this.children.map((child) => child.vdom),
        }*/
    }
    [RENDER_TO_DOM](range) {
        this._range = range;
        let root = document.createElement(this.type);
        for (let name in this.props) {
            let value = this.props[name];
            if (name.match(/^on([\s\S]+)$/)) {
                root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
            } else {
                if (name === "className") {
                    root.setAttribute("class", value);
                } else {
                    root.setAttribute(name, value);
                }
            }
        }

        if (!this.vchildren) this.vchildren = this.children.map((child) => child.vdom);

        for (let child of this.vchildren) {
            let childRange = document.createRange();
            // 因为是appendChild 所以是插在最后
            childRange.setStart(root, root.childNodes.length);
            childRange.setEnd(root, root.childNodes.length);
            child[RENDER_TO_DOM](childRange);
        }
        replaceContent(range, root);
    }
}

class TextWrapper extends Component {
    constructor(content) {
        super(content);
        this.type = "#text";
        this.content = content;
    }
    get vdom() {
        return this;
    }
    [RENDER_TO_DOM](range) {
        this._range = range;
        let root = document.createTextNode(this.content);
        replaceContent(range, root);
    }
}

function replaceContent(range, node) {
    range.insertNode(node);
    range.setStartAfter(node);
    range.deleteContents();

    range.setStartBefore(node);
    range.setEndAfter(node);
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
            if (child === null) {
                continue;
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