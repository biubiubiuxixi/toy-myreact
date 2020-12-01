/*
 * @Descripttion: 
 * @Author: chelsea.jiang
 * @Date: 2020-11-30 18:59:12
 * @LastEditors: chelsea.jiang
 * @LastEditTime: 2020-12-01 19:24:15
 */
import xixiToy, { Component } from './xixiToy.js';
const { render } = xixiToy;
class MyComponent extends Component {
    constructor() {
        super();
        this.state = {
            a: 1,
            b: 2,
        };
    }
    render() {
        return (
            <div>
                <h1>MyComponent</h1>
                <button onClick={() => { this.setState({ a: this.state.a + 1 }) }}>加一</button>
                <div>{this.state.a.toString()}</div>
                <div>{this.state.b.toString()}</div>
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

