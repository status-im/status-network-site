const gulp = require('gulp')
const log = require('fancy-log')
const webserver = require('gulp-webserver')
const browserSync = require('browser-sync').create()
const gulpSass = require('gulp-sass')
const Hexo = require('hexo')
const gulpMinify = require('gulp-minify')
const cleanCSS = require('gulp-clean-css')
const concat = require('gulp-concat')
const rename = require("gulp-rename")

const gitBranch = require('./scripts/git-branch')

const getEnv = () => {
    return gitBranch() == 'master' ? 'prod' : 'dev'
}

// loads hexo configuration based on env we build for
const hexo = async (cmd) => {
    var hexo = new Hexo(process.cwd(), {
        config: `_config.${getEnv()}.yml`,
        watch: false,
    })
    await hexo.init()
    await hexo.call(cmd)
    return await hexo.exit()
}

const content = () => hexo('generate')

const minijs = () =>
    gulp.src([
        'node_modules/jquery/dist/jquery.min.js', 
        'node_modules/popper.js/dist/umd/popper.min.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'node_modules/moment/min/moment.min.js',
        'node_modules/@tryghost/content-api/umd/content-api.min.js',
        'node_modules/sticky-kit/dist/sticky-kit.min.js',
        'node_modules/tilt.js/dest/tilt.jquery.min.js',
        'node_modules/rellax/rellax.min.js',
        'node_modules/store/dist/store.everything.min.js',
        'node_modules/handlebars/dist/handlebars.min.js',
        'themes/navy/source/js/fathom.js',
        'themes/navy/source/js/main.js',
    ])
        .pipe(concat('main.js'))
        .pipe(gulpMinify({ext:{min:'.min.js'}}))
        .pipe(gulp.dest('./public/js/'))

const css = () =>
    gulp.src('./public/css/main.css')
        .pipe(cleanCSS())
        .pipe(rename("main.min.css"))
        .pipe(gulp.dest('./public/css/'))

const sass = () =>
    gulp.src("./themes/navy/source/scss/main.scss")
        .pipe(gulpSass())
        .on('error', log.error)
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream())

const devel = () => {
    gulp.watch('./themes/navy/source/scss/*.scss', sass, css)
    gulp.watch('./themes/navy/source/js/main.js', minijs)
    gulp.watch(['./source/**/*.{md,yml}', './themes/navy/**/*'], content)
}

const server = () =>
  gulp.src('./public').pipe(webserver({
    port: 8080, livereload: true, open: true
  }))

exports.content = content
exports.sass = sass
exports.css = gulp.series(sass, css)
exports.server = server
exports.devel = gulp.parallel(server, devel)
exports.build = gulp.parallel(content, exports.css, minijs)
exports.default = exports.build
