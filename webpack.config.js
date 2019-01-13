module.exports = {
    devServer: {
        contentBase:  __dirname + '/demo',
        port: 8080
    },
    context: __dirname,
    devtool: "inline-source-map",
    entry: "./demo/index.ts",
    output: {
        path: __dirname + "/demo",
        filename: "src.js"
    },
    watchOptions: {
        poll: true
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    mode: 'development',
    plugins: [],
    module: {
        rules: [
            {test: /\.tsx?$/, loader: "ts-loader"}
        ]
    }
};