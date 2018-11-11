const gulp = require('gulp');
const del = require('del');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const webserver = require('gulp-webserver');
const fs = require('fs');
const replace = require('gulp-replace');


gulp.task('clean:dist', [], () => {
  return del('dist');
});

gulp.task('bundle', ['clean:dist'], () => {
  return browserify([], {debug: true})
    .add("src/index.ts")
    .plugin("tsify", { noImplicitAny: true })
    .bundle()
    .pipe(source('sticky.js'))
    .pipe(buffer())
    .pipe(replace('resize_observer_polyfill_1.default', 'resize_observer_polyfill_1'))
    .pipe(gulp.dest('dist'));
});

gulp.task('serve', ['bundle'], () => {
  gulp.watch('src/**/*.ts', ['bundle']);

  return gulp.src('./playground')
    .pipe(webserver({
      livereload: true,
      directoryListing: true,
      open: true,
      path: './playground',
      fallback: 'index.html',
      middleware(req, res, next) {
        if (!(req.url.endsWith('.js') || req.url.endsWith('.map'))) {
          return next();
        }

        fs.createReadStream("./dist" + req.url).pipe(res);
      }
    }));
});