// Project imports
var fs = require("fs");
var Logger = require('../modules/Logger');
var BotPlayer = require('./BotPlayer');
var FakeSocket = require('./FakeSocket');
var PacketHandler = require('../PacketHandler');

function BotLoader(gameServer) {
    this.gameServer = gameServer;
    this.loadNames();
}

module.exports = BotLoader;

/**
 * Shuffles array in place.
 * Ref: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

BotLoader.prototype.getName = function (n) {
    if (n == null || n <= 1) {
        var name = "";
    
        // Picks a random name for the bot
        if (this.randomNames.length > 0) {
            var index = (this.randomNames.length * Math.random()) >>> 0;
            name = this.randomNames[index];
        } else {
            name = "bot" + ++this.nameIndex;
        }
    
        return name;
    } else {
        var names = [];
        if (this.randomNames.length > 0) {
           while (names.length < n) {
               var nn = this.randomNames.slice();
               shuffle(nn);
               names = names.concat(nn);
           }
           names = names.slice(0, n);
        } else {
            for (var i = 0; i < n; i++) {
                var name = "bot" + ++this.nameIndex;
                names.append(name);
            }
        }
        return names;
    }
};

BotLoader.prototype.loadNames = function () {
    this.randomNames = [];
    
    if (fs.existsSync("./botnames.txt")) {
        // Read and parse the names - filter out whitespace-only names
        this.randomNames = fs.readFileSync("./botnames.txt", "utf8").split(/[\r\n]+/).filter(function (x) {
            return x != ''; // filter empty names
        });
    }
    this.nameIndex = 0;
};

BotLoader.prototype.addBot = function (n) {
    if (n == null || n <= 1)
        n = 1;

    var names = this.getName(n);
    for (var i = 0; i < n; i++) {
        var s = new FakeSocket(this.gameServer);
        s.playerTracker = new BotPlayer(this.gameServer, s);
        s.packetHandler = new PacketHandler(this.gameServer, s);
    
        // Add to client list
        this.gameServer.clients.push(s);
    
        // Add to world
        s.packetHandler.setNickname(names[i]);
    }
};
