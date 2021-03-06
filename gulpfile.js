// --------------------------------------------------------------------
// Plugins
// --------------------------------------------------------------------

var gulp           = require('gulp'),
    sass           = require('gulp-sass'),
    sourcemaps     = require('gulp-sourcemaps'),
    uncss          = require('gulp-uncss'),
    nano           = require('gulp-cssnano'),
    rename         = require('gulp-rename'),
    nunjucksRender = require('gulp-nunjucks-render'),
    data           = require('gulp-data'),
    notify         = require('gulp-notify'),
    uglify         = require('gulp-uglify'),
    plumber        = require('gulp-plumber'),
    browserSync    = require('browser-sync'),
    cache          = require('gulp-cache'),
    imagemin       = require('gulp-imagemin'),
    fs             = require('fs'),
    cssnano        = require('gulp-cssnano'),
    gutil          = require('gulp-util'),
    rev            = require('gulp-rev'),
    revReplace     = require('gulp-rev-replace'),
    hash           = require("gulp-hash"),
    del            = require('del'),
    critical       = require('critical').stream,
    gulpSequence   = require('gulp-sequence'),
    autoprefixer   = require('gulp-autoprefixer');

// --------------------------------------------------------------------
// Carpetas fuente y destino - Modificar las rutas según se requiera
// --------------------------------------------------------------------

/*
Ir guardando el histórico de los .json
que vayamos usando para poder switchear fácilmente si
necesitamos hacer cambios sobre alguna promoción que este vigente
y no sea en la que estemos trabajando
*/

var build = {
    sass: "build/sass/**/*.scss",
    js: "build/js/main.js",
    img: "build/img/**/*",
    html: "build/index.html",
    json_internas: "build/json/merchants_internas.json", // Información de los merchants en categorias y slider
    json_multiproduct: "build/json/multiproduct.json", // Información de los multiproduct que reemplazan el slider
    json_teaser: "build/json/teaser_slider.json", // Información de los logos del slider para la teaser
    // json_promo: "build/json/test.json"
    // json_promo: "build/json/17_01/20_home_deco.json",
    // json_promo: "build/json/17_01/23_exclusiva_grisino.json",
    // json_promo: "build/json/17_01/24_compartida_hotday_mshops.json",
    // json_promo: "build/json/17_01/27_compartida_bensimon_pepas.json",
    // json_promo: "build/json/17_02/01_exclusiva_topper.json",
    // json_promo: "build/json/17_02/08_exclusiva_dolce_gusto.json",
    // json_promo: "build/json/17_02/10_compartida_bts.json",
    // json_promo: "build/json/17_02/17_compartida_escapada.json",
    // json_promo: "build/json/17_02/21_exclusiva_adidas.json",
    // json_promo: "build/json/17_02/24_compartida_hotdays.json",
    // json_promo: "build/json/17_03/02_teaser_sport_week.json"
    // json_promo: "build/json/17_03/03_sport_week.json"
    // json_promo: "build/json/17_03/10_pre_sale_cyber_fashion.json"
    // json_promo: "build/json/17_03/15_exclusiva_casa_del_audio.json"
    // json_promo: "build/json/17_03/17_compartida_hotdays.json"
    // json_promo: "build/json/17_03/21_compartida_hotdays.json"
    // json_promo: "build/json/17_03/23_exclusiva_arredo.json"
    // json_promo: "build/json/17_03/28_exclusiva_cher.json"
    // json_promo: "build/json/17_03/30_home_deco.json"
    json_promo: "build/json/17_05/23_compartida_bizarro_saverio.json"
};

var dist = {
    css: "dist/css",
    js: "dist/js",
    img: "dist/img",
    html: "dist/index.html"
};


// --------------------------------------------------------------------
// Plumber Error Handler
// --------------------------------------------------------------------

function customPlumber(errTitle) {
  return plumber({
      errorHandler: notify.onError({
        title: errTitle || "Error running Gulp",
        message: "Error: <%= error.message %>",
      })
  });
}


// --------------------------------------------------------------------
// Task: Compilar SASS
// --------------------------------------------------------------------

gulp.task('sass', function(){
  return gulp
  .src(build.sass)
  .pipe(sourcemaps.init())
  .pipe(customPlumber('Error al compilar SASS'))
  .pipe(sass({outputStyle: 'compressed'}))
  .pipe(rename({
    basename: "main",
    suffix: "-min",
    extname: ".css"
  }))
  .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(dist.css))
  .pipe(browserSync.reload({stream: true}))
  .pipe(notify('SASS Compilado'));
});


// --------------------------------------------------------------------
// Task: Compilar HTML
// --------------------------------------------------------------------

gulp.task('html', function() {
  return gulp.src('build/pages/*.+(html|nunjucks)')
  .pipe(customPlumber('Error al compilar HTML'))
  .pipe(data(function(){
      return JSON.parse(fs.readFileSync(build.json_internas));
  }))
  .pipe(data(function(){
      return JSON.parse(fs.readFileSync(build.json_multiproduct));
  }))
  .pipe(data(function(){
      return JSON.parse(fs.readFileSync(build.json_promo));
  }))
  .pipe(data(function(){
      return JSON.parse(fs.readFileSync(build.json_teaser));
  }))
  .pipe(nunjucksRender({
    path: ['build/pages/', 'build/templates/']
  }))
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.reload({stream: true}))
  .pipe(notify('HTML Compilado'));
});


// --------------------------------------------------------------------
// Task: Minificar Imgs
// --------------------------------------------------------------------

gulp.task('img', function() {
  return gulp.src(build.img)
  .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
  .pipe(gulp.dest(dist.img));
});


// --------------------------------------------------------------------
// Task: Minificar JS
// --------------------------------------------------------------------

gulp.task('js', function() {
    gulp.src(build.js)
    .pipe(customPlumber('Error al compilar JS'))
    .pipe(uglify({mangle:false}))
    .pipe(rename(function (path) {
      path.basename += "-min";
      path.extname = ".js";
      return path;
    }))
    .pipe(gulp.dest(dist.js))
    .pipe(browserSync.reload({stream: true}))
  .pipe(notify('JS Compilado'));
});


// --------------------------------------------------------------------
// Task: JSON
// --------------------------------------------------------------------

gulp.task('json', ['html'],function(){
  return gulp.src('build/pages/*.+(html|nunjucks)')
  .pipe(customPlumber('Error JSON'))
  .pipe(data(function(){
      return JSON.parse(fs.readFileSync(build.json_internas));
  }))
  .pipe(data(function(){
      return JSON.parse(fs.readFileSync(build.json_multiproduct));
  }))
  .pipe(data(function(){
      return JSON.parse(fs.readFileSync(build.json_promo));
  }))
  .pipe(data(function(){
      return JSON.parse(fs.readFileSync(build.json_teaser));
  }))
  .pipe(nunjucksRender({
    path: ['build/pages/', 'build/templates/']
  }))
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.reload({stream: true}))
  .pipe(notify('JSON inyectado'));
});


// --------------------------------------------------------------------
// Task: Watch
// --------------------------------------------------------------------

gulp.task('sass-watch', ['sass'], browserSync.reload);
gulp.task('html-watch', ['html'], browserSync.reload);
gulp.task('js-watch', ['js'], browserSync.reload);
gulp.task('json-watch', ['json'], browserSync.reload);


// --------------------------------------------------------------------
// Task: Default
// --------------------------------------------------------------------

gulp.task('default', ['sass', 'js', 'html'], function () {
    browserSync.init({server: 'dist'});

    gulp.watch(build.sass, ['sass-watch']);
    gulp.watch(build.html, ['html-watch']);
    gulp.watch(build.js, ['js-watch']);
    gulp.watch(build.json_internas, ['json-watch']);
    gulp.watch(build.json_multiproduct, ['json-watch']);
    gulp.watch(build.json_promo, ['json-watch']);
    gulp.watch(build.json_teaser, ['json-watch']);
    gulp.watch(["build/templates/layout.nunjucks", "build/templates/partials/**/*.html", "build/pages/*.nunjucks"], ['html-watch']);
});


// --------------------------------------------------------------------
// Task: Critical - Above the fold
// --------------------------------------------------------------------

gulp.task('critical', function () {
  return gulp.src('dist/*.html')
    .pipe(critical({
      base: 'dist/',
      inline: true,
      extract: true,
      minify: true,
      width: 1920,
      height: 420,
      ignore: ['@font-face',/url\(/],
      css: 'dist/css/main-min.css'
    }))
    .pipe(gulp.dest('dist/inline'))
  .pipe(notify('Above the fold Terminado'));
});


// --------------------------------------------------------------------
// Task: CSSS Nano
// --------------------------------------------------------------------

gulp.task('nano', ['sass'], function() {
  return gulp.src('dist/css/*.css')
    .pipe(cssnano())
    .pipe(rename(function (path) {
      path.basename += "-min";
      path.extname = ".css";
      return path;
    }))
    .pipe(gulp.dest('dist/inline/css'))
  .pipe(notify('CSS Minificado'));
});


// --------------------------------------------------------------------
// Task: REV
// --------------------------------------------------------------------

gulp.task('rev', function(){
  return gulp
  .src(build.sass)
  .pipe(sass({outputStyle: 'compressed'}))

  .pipe(rename({
    basename: "main",
    suffix: "-min",
    extname: ".css"
  }))

  .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
  }))

  .pipe(rev())
  .pipe(gulp.dest(dist.css))
  .pipe(rev.manifest('./manifest/rev-manifest.json', {
     merge: true
   }))
  .pipe(gulp.dest(dist.css))

  .pipe(notify('CSS revisionado'));
});


// --------------------------------------------------------------------
// Task: REV Replace
// --------------------------------------------------------------------

function replaceIfMap(filename) {
  if (filename.indexOf('.map') > -3) {
      return filename.replace('/', '');
  }
  return filename;
}

gulp.task("replace", function(){
  var manifest = gulp.src("dist/css/manifest/rev-manifest.json");

  return gulp.src("dist/*.html")
  .pipe(revReplace({
    manifest: manifest,
    modifyUnreved: replaceIfMap,
    modifyReved: replaceIfMap
  }))
  .pipe(gulp.dest("dist"))
  .pipe(notify('CSS reemplazado en HTMLs'));
});


// --------------------------------------------------------------------
// Task: BUILD
// --------------------------------------------------------------------

gulp.task('build', gulpSequence('rev', 'replace'));