// all plugins
import { src, dest, watch, series, parallel } from 'gulp';
import browsersync from "browser-sync"
import fileinclude from "gulp-file-include";
import del from "del";
import scss from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import group_media from "gulp-group-css-media-queries";
import clean_css from "gulp-clean-css";
import rename from "gulp-rename";
import uglify from 'gulp-uglify';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import imagemin from "gulp-imagemin";
import ghpages from 'gh-pages';
			 ghpages.publish('dist', function(err) {});
			 browsersync.create();

let projectFolder = require("path").basename(__dirname);
let sourceFolder = "src";

// all paths
const path = {
	build: {
		html: `${projectFolder}/`,
		css: `${projectFolder}/css/`,
		js: `${projectFolder}/js/`,
		img: `${projectFolder}/img/`,
		fonts: `${projectFolder}/fonts/`
	},
	src: {
		html: `${sourceFolder}/*.html`,
		css: `${sourceFolder}/scss/style.scss`,
		js: `${sourceFolder}/js/index.js`,
		img: `${sourceFolder}/img/**/*.{jpg,png,svg,gif,ico}`,
		fonts: `${sourceFolder}/fonts/*{woff(2),ttf,eot}`
	},
	watch: {
		html: `${sourceFolder}/**/*.html`,
		css: `${sourceFolder}/scss/**/*.scss`,
		js: `${sourceFolder}/js/**/*.js`,
		img: `${sourceFolder}/img/**/*.{jpg,png,svg,gif,ico}`,
	},
	clean: `./${projectFolder}/*`
};

// function launch local server
const browserSync = (params) => {
	browsersync.init({
		server: { baseDir: `./${projectFolder}/` },
		port: 3000,
		notify: false
	})
}
// function import all html files
const processHtml = () => {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
}
// function import all scss file to one css and minimized them
const processCss = () => {
	return src(path.src.css)
		.pipe(scss({ outputStyle: "expanded" }))
		.pipe(group_media())
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
    )
		.pipe(clean_css())
		.pipe(rename({ extname: ".min.css"}))
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}
// function import all js files transpiled them by babel and minimized them all
const processJs = () => {
	browserify({ entries: [path.src.js] })
	.transform(babelify.configure({ 
	presets: ['@babel/env'], 
	plugins: [
		["@babel/transform-runtime"]
	],
}))
	.bundle()
		.pipe(source('app.js'))
		.pipe(buffer())
		.pipe(fileinclude())
		.pipe(uglify())
		.pipe(rename({extname: ".min.js"}))
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
}
// function import and minimized all images
const processImages = () => {
	src(path.src.img)
		.pipe(imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream())
}
// function import all fonts
const processFonts = () => {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts));
};
// function wathcing all our files and update them all
const watchFiles = (params) => {
	watch([path.watch.html], processHtml);
	watch([path.watch.css], processCss);
	watch([path.watch.js], processJs);
	watch([path.watch.img], processImages);
}

const clean = (params) => del(path.clean);

let build = series(clean, parallel(processJs, processCss, processHtml, processImages, processFonts));
export default parallel(build, watchFiles, browserSync);
