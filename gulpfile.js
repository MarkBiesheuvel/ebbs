const gulp = require('gulp')
const babel = require('gulp-babel')

gulp.task('js', () => {
  gulp.src('src/main.js')
    .pipe(babel({
      presets: ['es2015', 'es2016']
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('default', () => {
  gulp.run('js')
  gulp.watch('src/*.*', ['js'])
})
