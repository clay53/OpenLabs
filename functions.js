module.exports = {
    shortenNumber: function (num) {
        return (num < 1000 ?
            num.toString() :
            (num < 10000 ?
                (num/1000).toFixed(2) + "k" :
                (num < 100000 ?
                    (num/10000).toFixed(1) + "k" :
                    (num < 1000000 ?
                        Math.floor(num/1000) + "k" :
                        "err"
                    )
                )
            )
        )
    },
    htmlPage: function (header, body, headerOptions, bodyOptions) {
        return `<html><head ${headerOptions}>${header}</head><body ${bodyOptions}>${body}</body></html>`;
    },
    returnLower: function (num1, num2) {
        return num1 < num2 ? num1 : num2;
    }
}