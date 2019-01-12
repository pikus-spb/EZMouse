module.exports = {
    context: __dirname,
    devtool: "inline-source-map",
    entry: "./index.ts",
    output: {
        path: __dirname + "/js",
        filename: "scripts.min.js"
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