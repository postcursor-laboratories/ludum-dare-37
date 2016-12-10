"use strict";

const browserify = require("browserify");
const gulp = require("gulp");
const connect = require("gulp-connect");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");
const watch = require("gulp-watch");
const fs = require("fs");
const mkdirp = require("mkdirp");
const merge = require("merge");
const path = require("path");
const env = require("process").env;

const utilities = require("./buildscripts/util");
const timelog = utilities.timelog;
const magicTouchFile = utilities.magicTouchFile;

const BASE_URL = env.BASE_URL || "http://localhost:1337";

// Ensure bin exists
mkdirp.sync("./bin/");
const pages = ["main"].map(function (page) {
        return page + ".js";
    }),
    inputs = pages.map(function (page) {
        return "./src/" + page;
    }),
    outputs = pages.map(function (page) {
        return "./bin/" + page;
    });

function commonTransform(customOpts, watch) {
    const defaults = {
        debug: true
    };
    let opts = merge(defaults, customOpts);
    if (watch) {
        console.log("Enabling watchify");
        opts = merge({
            cache: {},
            packageCache: {},
            plugin: [["watchify", {
                poll: true
            }]]
        }, opts);
    }
    console.log("Using options", JSON.stringify(opts, null, 4));
    let b = browserify(inputs, opts);
    console.log("Applying babelify");
    b = b.transform("babelify", {"plugins": [
        ["replace-property",
            {
                "replacements": {
                    "BASE_URL": BASE_URL
                }
            }
        ]
    ]});
    console.log("Applying browserify-shim");
    b = b.transform("browserify-shim");
    const doBundle = function doBundle() {
        timelog("Bundling again!");
        return magicTouchFile("bin/game.js").then(f => {
            return b.bundle(
                function err(err) {
                    if (!err) {
                        return;
                    }
                    timelog("An error occurred:");
                    console.error(err.toString());
                    if (err["codeFrame"]) {
                        console.error(err["codeFrame"]);
                    }
                    console.error(err.stack);
                })
            //.pipe(showProgress(process.stdout))
                .pipe(fs.createWriteStream(f))
                .on("finish", function () {
                    timelog("done bundling");
                });
        });
    };
    b["on"]("update", doBundle);
    b["on"]("log", function log(msg) {
        timelog(msg);
    });
    b["on"]("error", function (err) {
        timelog("Browserify error", err.message);
        this.emit("end");
    });
    b["on"]("transform", function (tr, file) {
        timelog("Applying " + tr.constructor.name + " to " + file);
    });
    return doBundle();
}

gulp.task("transform", function () {
    return commonTransform({}, false);
});
gulp.task("transform-on-my-watch", function () {
    return commonTransform({}, true);
});
// setup gulp.copy
gulp.copy = function (src, dest, doWatch) {
    let stream = gulp.src(src);
    if (doWatch) {
        stream = stream.pipe(watch(src)).pipe(plumber());
    }
    return stream.pipe(gulp.dest(dest));
};
gulp.task("copy-static", function () {
    return gulp.copy(["static/**"], "bin", false);
});
gulp.task("copy-static-on-my-watch", function () {
    gulp.copy(["static/**"], "bin", true);
});
gulp.task("site", ["transform", "copy-static"]);
gulp.task("dev-server", ["transform-on-my-watch", "copy-static-on-my-watch"], function () {
    connect.server({
        root: "bin",
        port: 1337,
        livereload: true
    });
});
