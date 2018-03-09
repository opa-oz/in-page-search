var run = require('./index');

(function () {
    var tries = 100;
    var times = [];

    runnerMy();

    function runnerMy() {
        var now = Date.now();
        run('ISBN', true).then(function (entries) {
            console.log(entries);
            times.push(Date.now() - now - 100);

            if (--tries) {
                runnerMy();
            } else {
                console.log('Algorithm:', times.reduce(function (sum, v) {
                    return sum + v;
                }, 0) / times.length);
            }
        });
    }
})();

(function () {
    var tries = 100;
    var times = [];

    runnerRegex();

    function runnerRegex() {
        var now = Date.now();

        console.log(document.body.innerText.match(new RegExp('ISBN', 'i')));
        times.push(Date.now() - now);

        if (--tries) {
            runnerRegex();
        } else {
            console.log('Regex:', times.reduce(function (sum, v) {
                return sum + v;
            }, 0) / times.length);
        }
    }
})();
