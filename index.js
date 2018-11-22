
const fs = require("fs");

(() => {
    const dirs = fs.readdirSync("public/frames", {withFileTypes: true})
        .filter((dir) => dir.isDirectory() )
        .map((dir) => dir.name)

    fs.writeFileSync("public/frames.js", `const framesUrl = ${JSON.stringify(dirs, null, 2)};`)
})();
