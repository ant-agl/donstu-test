"use strict";

var gulp = require("gulp"),
  prefixer = require("autoprefixer"),
  sourcemaps = require("gulp-sourcemaps"),
  rigger = require("gulp-rigger"),
  imagemin = require("gulp-imagemin"),
  pngquant = require("imagemin-pngquant"),
  rimraf = require("rimraf"),
  browserSync = require("browser-sync"),
  reload = browserSync.reload,
  webpack = require("webpack-stream"),
  postcss = require("gulp-postcss"),
  sass = require("gulp-sass")(require("sass"));

var path = {
  build: {
    html: "build/",
    js: "build/js/",
    css: "build/css/",
    img: "build/img/",
    fonts: "build/fonts/",
    files: "build/files/",
  },
  src: {
    html: "src/*.html",
    js: "src/js/main.js",
    css: "src/css/main.scss",
    img: "src/img/**/*.*",
    fonts: "src/fonts/**/*.*",
    files: "src/files/**/*.*",
  },
  watch: {
    html: "src/**/*.html",
    js: "src/js/**/*.js",
    css: "src/css/**/*.scss",
    img: "src/img/**/*.*",
    fonts: "src/fonts/**/*.*",
    files: "src/files/**/*.*",
  },
  clean: "./build",
};

function htmlBuild() {
  return gulp
    .src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({ stream: true }));
}

function jsBuild() {
  return gulp
    .src(path.src.js)
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({ stream: true }));
}

function cssBuild() {
  return gulp
    .src(path.src.css)
    .pipe(rigger())
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(postcss([prefixer()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({ stream: true }));
}

function imgBuild() {
  return gulp
    .src(path.src.img)
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngquant()],
        interlaced: true,
      })
    )
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({ stream: true }));
}

function fontsBuild() {
  return gulp.src(path.src.fonts).pipe(gulp.dest(path.build.fonts));
}

function filesCopy() {
  return gulp.src(path.src.files).pipe(gulp.dest(path.build.files));
}

function vendorJS() {
  const modules = [
    "node_modules/swiper/swiper-bundle.min.js",
    "node_modules/swiper/swiper-bundle.min.js.map",
    "node_modules/dot/doT.min.js",
    "node_modules/air-datepicker/air-datepicker.js",
  ];

  return gulp.src(modules).pipe(gulp.dest(path.build.js));
}

function vendorCSS() {
  const modules = [
    "node_modules/swiper/swiper-bundle.min.css",
    "node_modules/air-datepicker/air-datepicker.css",
  ];

  return gulp.src(modules).pipe(gulp.dest(path.build.css));
}

exports.build = gulp.parallel(
  vendorJS,
  vendorCSS,
  htmlBuild,
  jsBuild,
  cssBuild,
  fontsBuild,
  imgBuild,
  filesCopy
);

function watch(done) {
  gulp.watch(path.watch.html, htmlBuild);
  gulp.watch(path.watch.js, jsBuild);
  gulp.watch(path.watch.css, cssBuild);
  gulp.watch(path.watch.fonts, fontsBuild);
  gulp.watch(path.watch.img, imgBuild);
  gulp.watch(path.watch.files, filesCopy);
  done();
}
exports.watch = gulp.series(watch);

function clean(cb) {
  rimraf(path.clean, cb);
}
exports.clean = gulp.series(clean);

var config = {
  server: {
    baseDir: "./build",
  },
  tunnel: true,
  host: "localhost",
  port: 9000,
  logPrefix: "front",
};

function webserver(done) {
  browserSync(config);
  done();
}

exports.default = gulp.series(clean, exports.build, webserver, watch);
