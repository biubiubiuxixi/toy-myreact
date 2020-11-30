/*
 * @Descripttion: 
 * @Author: chelsea.jiang
 * @Date: 2020-11-30 18:52:07
 * @LastEditors: chelsea.jiang
 * @LastEditTime: 2020-11-30 19:40:20
 */
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
                        plugins: [['@babel/plugin-transform-react-jsx', {pragma: 'xixiToy.createElement'}]],
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
