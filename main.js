/*
 * @Descripttion: 
 * @Author: chelsea.jiang
 * @Date: 2020-11-30 18:59:12
 * @LastEditors: chelsea.jiang
 * @LastEditTime: 2020-11-30 21:15:46
 */
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

