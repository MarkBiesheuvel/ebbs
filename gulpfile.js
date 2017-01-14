const gulp = require('gulp')
const babel = require('gulp-babel')

gulp.task('default', () => {
    gulp.src('src/main.js')
      .pipe(babel({
        presets: ['es2016']
      }))
      .pipe(gulp.dest('dist'))
  }
)
