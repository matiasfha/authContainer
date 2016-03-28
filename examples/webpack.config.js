import path from 'path'
import fs from 'fs'
import HtmlWebpackPlugin from 'html-webpack-plugin'

module.exports = {
	entry: './app.js',
	outputh: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js',
	},
	devServer: {
		inline: true,
		historyApiFallback: true,
		stats: {
			color: true,
			hash: false,
			version: false,
			chunks: false,
			children: false,
		},
	},
	module: {
		loaders: [{
			test: /\.js$/,
			loaders: ['babel'],
			exclude: /node_modules/,
			include: __dirname,
		}],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'index.html',
			inject: 'body',
		}),
	],
}

const src = path.join(__dirname, '..', '..', 'src')
if (fs.existsSync(src)) {
	// Use the latest src
	module.exports.resolve = { alias: { 'auth-component': src } }
	module.exports.module.loaders.push({
		test: /\.js$/,
		loaders: ['babel'],
		include: src,
	})
}
