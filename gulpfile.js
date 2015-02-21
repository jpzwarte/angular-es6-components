'use strict';

var babelify   = require('babelify'),
    browserify = require('browserify'),
    buffer     = require('vinyl-buffer'),
    del        = require('del'),
    gulp       = require('gulp'),
    lr         = null,
    path       = require('path'),
    source     = require('vinyl-source-stream'),
    $          = require('gulp-load-plugins')();

gulp.task('clean', function (callback) {
    del('target/dist/', callback);
});

gulp.task('js', function () {
    return browserify('./app/app.js', { debug: true })
        .transform(babelify)
        .bundle()
        .on('error', $.util.log.bind($.util, 'Browserify Error'))
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe($.sourcemaps.init({ loadMaps: true }))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('target/dist'));
});

gulp.task('connect', function () {
    var connect = require('connect'),
        http = require('http'),
        livereload = require('connect-livereload'),
        livereloadPort = 35729,
        modrewrite = require('connect-modrewrite'),
        httpProxy = require('http-proxy'),
        serveStatic = require('serve-static'),
        tinyLr = require('tiny-lr');

    var proxy = httpProxy.createProxyServer();

    proxy.on('error', function (err, req, res) {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });

        res.end('Something went wrong. And we are reporting a custom error message.');
    });

    var app = connect()
        /* Add headers */
        .use(function (req, res, next) {
            if (/^\/(dtdl|student)/.test(req.url)) {
                req.headers['VO-Method'] = '0';
                req.headers['VO-Method-Name'] = 'MathPlus';
            }
            next();
        })
        /* Configure proxies */
        .use(function (req, res, next) {
            if (/^\/dtdl/.test(req.url)) {
                proxy.web(req, res, {
                    target: 'http://localhost:9001'
                });
            } else if (/^\/student/.test(req.url)) {
                proxy.web(req, res, {
                    target: 'http://localhost:9010'
                });
            } else if (/^\/teacher\/eventbus/.test(req.url)) {
                proxy.web(req, res, {
                    target: 'http://localhost:9012'
                });
            } else if (/^\/(teacher|admin)/.test(req.url)) {
                proxy.web(req, res, {
                    target: 'http://localhost:9011'
                });
            } else {
                next();
            }
        })
        /* Rewrite URLs */
        .use(modrewrite(['!(\\.\\w+($|\\?)|\/docs) /index.html']))
        /* Livereload */
        .use(livereload({ port: livereloadPort }))
        /* Mount node_modules */
        .use('/node_modules', serveStatic('node_modules'))
        /* Mount target */
        .use(serveStatic('target/dist/'))
        /* Mount app */
        .use(serveStatic('app'));

    var server = http.createServer(app);

    server.on('upgrade', function (req, socket, head) {
        proxy.ws(req, socket, head, {
            target: 'http://localhost:9012'
        });
    });

    server.listen(9090, '0.0.0.0', function (err) {
        if (err) {
            $.util.log('Error on starting server:', $.util.colors.red(err));
        } else {
            $.util.log('Server started at', $.util.colors.green('http://0.0.0.0:9090'));

            lr = tinyLr();
            lr.listen(livereloadPort, function () {
                $.util.log('LiveReload started on port', $.util.colors.green(livereloadPort));
            });
        }
    });
});

gulp.task('watch', ['connect', 'js'], function () {
    gulp.watch([
        'app/*.html',
        'target/dist/app.js'
    ], function (event) {
        $.util.log('Reloading', $.util.colors.blue(path.relative('.', event.path)));
        lr.changed({
            body: {
                files: event.path
            }
        });
    });

    gulp.watch([
        'app/app.js',
        'app/components/**/*.js'
    ], ['js']);
});

gulp.task('open', ['watch'], function () {
    require('open')('http://localhost:9090');
});

gulp.task('serve', ['clean'], function () {
    gulp.start('open');
});

gulp.task('default', ['clean'], function () {
    gulp.start('js');
});
