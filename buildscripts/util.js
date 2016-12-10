const dateFormat = require("dateformat");
const fs = require("fs");
const makeAllDirs = require("mkdirp");
const Promise = require("promise/lib/es6-extensions");

function timelog() {
    const modargs = [dateFormat(new Date(), "[hh:MM:ss]")];
    console.log.apply(console, modargs.concat(Array.from(arguments)));
}

function getParent(s) {
    return s.substring(0, s.lastIndexOf("/"));
}

function getFileName(s) {
    return s.substring(s.lastIndexOf("/") + 1);
}

/**
 *
 * @param {string} f
 * @returns {Promise}
 */
function magicTouchFile(f) {
    const parent = getParent(f);
    // Sooooo goood!
    return new Promise(resolve => {
        makeAllDirs(parent, {}, () => {
            resolve(f);
        });
    }).then(f => {
        return new Promise((resolve, reject) => {
            fs.open(f, "w", undefined, (err, fd) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(fd);
                }
            });
        });
    }).then(fd => {
        return new Promise((resolve, reject) => {
            fs.close(fd, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(f);
                }
            });
        })
    });
}

module.exports.timelog = timelog;
module.exports.getFileName = getFileName;
module.exports.getParent = getParent;
module.exports.magicTouchFile = magicTouchFile;
