import gulp from 'gulp'
import browserSync from 'browser-sync'
import injectSVG from 'gulp-inject-svg'
import concat from 'gulp-concat'
import del from 'del'
import imagemin from 'gulp-imagemin'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import webp from 'gulp-webp'
import imageResize from 'gulp-image-resize'
import rename from 'gulp-rename'
import htmlMin from 'gulp-htmlmin'
import autoprefixes from 'gulp-autoprefixer'
import cleanCSS from 'gulp-clean-css'
import sourcemaps from 'gulp-sourcemaps'
import realFavicon from 'gulp-real-favicon'
import fs from 'fs'

const FAVICON_DATA_FILE = 'src/faviconData.json'
const src = gulp.src
const dest = gulp.dest
const watch = gulp.watch
const series = gulp.series
const sass = gulpSass(dartSass)
browserSync.create()

function clean() {
  return del(['dist', 'src/css/*.css', FAVICON_DATA_FILE])
}

function fonts() {
  return src('src/fonts/**').pipe(dest('dist/fonts'))
}

function vendor() {
  return src('src/vendor/**').pipe(dest('dist'))
}

function imgCopyResized() {
  return src('src/img/*.{jpg,jpeg,png,webp}')
    .pipe(imageResize({ percentage: 50 }))
    .pipe(dest('dist/img'))
}

function imgClean() {
  return del('dist/img')
}

function imgCopy() {
  return src('src/img/*.{jpg,jpeg,png}')
    .pipe(rename({ suffix: '@2x' }))
    .pipe(dest('dist/img'))
}

function imgMin() {
  return src('dist/img/*.{jpg,jpeg,png}')
    .pipe(imagemin())
    .pipe(dest('dist/img'))
}

function imgToWebp() {
  return src('dist/img/*.{jpg,jpeg,png}').pipe(webp()).pipe(dest('dist/img'))
}

function scss() {
  return src('src/css/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(dest('src/css'))
}

function css() {
  return src('src/css/**/*.css')
    .pipe(sourcemaps.init())
    .pipe(concat('main.css'))
    .pipe(
      autoprefixes({
        cascade: false,
      })
    )
    .pipe(
      cleanCSS({
        level: 2,
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

function js() {
  return src('src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write())
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

function favicons(done) {
  realFavicon.generateFavicon(
    {
      masterPicture: 'src/favicon.svg',
      dest: 'dist',
      iconsPath: '/',
      design: {
        ios: {
          pictureAspect: 'backgroundAndMargin',
          backgroundColor: '#ffffff',
          margin: '18%',
          assets: {
            ios6AndPriorIcons: false,
            ios7AndLaterIcons: false,
            precomposedIcons: false,
            declareOnlyDefaultIcon: true,
          },
        },
        desktopBrowser: {
          design: 'raw',
        },
        windows: {
          pictureAspect: 'whiteSilhouette',
          backgroundColor: '#da532c',
          onConflict: 'override',
          assets: {
            windows80Ie10Tile: false,
            windows10Ie11EdgeTiles: {
              small: false,
              medium: true,
              big: false,
              rectangle: false,
            },
          },
        },
        androidChrome: {
          pictureAspect: 'shadow',
          themeColor: '#ffffff',
          manifest: {
            name: 'High pass',
            display: 'standalone',
            orientation: 'notSet',
            onConflict: 'override',
            declared: true,
          },
          assets: {
            legacyIcon: false,
            lowResolutionIcons: false,
          },
        },
        safariPinnedTab: {
          pictureAspect: 'silhouette',
          themeColor: '#ff6e30',
        },
      },
      settings: {
        scalingAlgorithm: 'Mitchell',
        errorOnImageTooSmall: false,
        readmeFile: false,
        htmlCodeFile: false,
        usePathAsIs: false,
      },
      markupFile: FAVICON_DATA_FILE,
    },
    function () {
      done()
    }
  )
}

function html() {
  return src('src/*.html')
    .pipe(htmlMin({ collapseWhitespace: true }))
    .pipe(injectSVG({ base: 'src/' }))
    .pipe(
      realFavicon.injectFaviconMarkups(
        JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code
      )
    )
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

function watchFiles() {
  browserSync.init({
    server: {
      baseDir: 'dist',
    },
  })
}

watch(['src/*.html', 'src/img/inline/*.svg'], html)
watch('src/fonts/**', fonts)
watch('src/vendor/**', vendor)
watch('src/js/**/*.js', js)
watch('src/css/**/*.scss', series(scss, css))
watch('src/img/*', series(imgClean, imgCopyResized, imgCopy, imgToWebp, imgMin))

const build = series(
  clean,
  fonts,
  vendor,
  imgCopyResized,
  imgCopy,
  imgToWebp,
  imgMin,
  favicons,
  html,
  scss,
  css,
  js
)

export { clean, build }
export default series(build, watchFiles)
