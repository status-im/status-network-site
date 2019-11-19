const gulp = require('gulp')
const log = require('fancy-log')
const browserSync = require('browser-sync').create()
const sass = require('gulp-sass')
const Hexo = require('hexo');
const runSequence = require('run-sequence');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");

const gitBranch = require('./scripts/git-branch');

const getEnv = () => {
    return gitBranch() == 'master' ? 'prod' : 'dev'
}

const hexo = async (cmdName, args={}) => {
    var h = new Hexo(process.cwd(), {
        config: `_config.${getEnv()}.yml`,
        watch: false,
    })
    try {
        await h.init()
        await h.call(cmdName, args)
        await h.exit()
    } catch(err) {
        h.exit(err)
        throw err
    }
}

gulp.task('generate', async (cb) => {
    await hexo('generate') /* generate html with 'hexo generate' */
})

gulp.task('compress', ['sass'], () => {
    gulp.src('./themes/navy/source/js/main.js')
        .pipe(minify({ext:{min:'.min.js'}}))
        .pipe(gulp.dest('./public/js/'))

    gulp.src('./public/css/main.css')
        .pipe(cleanCSS())
        .pipe(rename("main.min.css"))
        .pipe(gulp.dest('./public/css/'));
});

gulp.task('sass', () => {
    return gulp.src("./themes/navy/source/scss/main.scss")
        .pipe(sass())
        .on('error', log.error)
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream())
})

gulp.task('watch', async () => {
    gulp.watch('./themes/navy/source/scss/*.scss', ['compress'])
});

gulp.task('build', (cb) => {
    runSequence('generate', 'compress', 'watch')
});

gulp.task('run', (cb) => {
    runSequence('generate', 'compress')
});

gulp.task('default', [])
