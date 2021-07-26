var fs = require("fs");
function stopMining() {
    fs.writeFile("./mine/isMining.txt", "false", (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
      });
}

stopMining();