var fs = require("fs");

function startMining() {
    fs.writeFile("./mine/isMining.txt", "true", (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
      });
}

startMining();