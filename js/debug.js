/*global require */
var gui = require('nw.gui');
var win = gui.Window.get();
var debug_activated = false;
var t_i;

var gulp = require('gulp');

gulp.task('html', function () {
    'use strict';
    if (location) {
        location.reload();
    }
});

gulp.task('js', function () {
    'use strict';
    if (location) {
        location.reload();
    }
});

gulp.task('scss', function () {
    'use strict';
    if (location) {
        location.reload();
    }
});

gulp.task('css', function () {
    'use strict';
    if (location) {
        location.reload();
    }
});

/* Check for debug purpose */
for (t_i = 0; t_i < gui.App.argv.length; t_i += 1) {
    if (gui.App.argv[t_i] === 'dev') {
        debug_activated = true;
    }
}

if (debug_activated === true) {
    win.showDevTools('', true);

    gulp.watch(['./css/*.css'], ['css']);
    gulp.watch(['./scss/*.scss'], ['scss']);
    gulp.watch(['./js/*.js'], ['js']);
    gulp.watch(['*.html'], ['html']);
}

