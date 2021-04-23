
let fs = require("fs");
let zlib = require("zlib");
let Canvas = require("canvas");

let MapUtils = require("./MapUtils");

/**
 * 初始化地图信息
 * @param {*} arrayBuffer 
 */
let initMapInfo = function (arrayBuffer) {

    let bytes = new DataView(arrayBuffer);

    let offset = 0;
    let id = bytes.getInt16(offset, true);
    offset += 2;
    let width = bytes.getInt16(offset, true);
    offset += 2;
    let height = bytes.getInt16(offset, true);
    offset += 2;
    let splitWidth = bytes.getInt16(offset, true);
    offset += 2;
    let splitHeight = bytes.getInt16(offset, true);
    offset += 2;
    let cols = width / splitWidth;
    let rows = height / splitHeight;

    let flags = new Uint8Array(arrayBuffer, offset, rows * cols);
    offset += flags.byteLength;

    MapUtils.initData(id, arrayBuffer, offset, width, height, splitWidth, splitHeight, cols, rows);
}

let _canvasInfo = {};



/**
 * 读取文件夹
 * 
 * @param {*} dir 
 */
let readDir = function (dir) {

    if (fs.statSync(dir).isFile()) {

    }

    /** 读取文件目录 */
    let files = fs.readdirSync(dir);

    for (let i = 0; i < files.length; i++) {
        let _file = files[i];
        let _dir = dir + "/" + _file;
        if (fs.statSync(_dir).isDirectory()) {
            readDir(_dir);
        } else {
            if (_file.indexOf(".bin") != -1 && _file == "info.bin") {
                let readFileBuff = fs.readFileSync(_dir);
                let buffer = zlib.inflateSync(readFileBuff).buffer;
                initMapInfo(buffer);
                let splitInfo = MapUtils.getSplitInfo();
                for (let key in splitInfo) {
                    let array = splitInfo[key];
                    let canvasKey = String(dir + "/cell" + key + ".png");
                    _canvasInfo[canvasKey] = [];
                    for (let y = 0; y < array.length; y++) {
                        for (let x = 0; x < array[y].length; x++) {
                            if (!array[y][x]) {
                                let obj = {
                                    x: (x * MapUtils.getCellWidth()),
                                    y: (y * MapUtils.getCellHeight()),
                                    w: MapUtils.getCellWidth(),
                                    h: MapUtils.getCellHeight(),
                                }
                                _canvasInfo[canvasKey].push(obj);
                            }
                        }
                    }
                }
            } else {
                fs.unlinkSync(_dir);
            }
        }
    }
}

let temp = -1;
readDir(__dirname + "/map");

/**
 * 画图
 */
let draw = function () {
    let keys = Object.keys(_canvasInfo);
    if (temp != -1) {
        clearInterval(temp)
    }
    if (keys.length > 0) {
        let tempDir = keys[0];
        if (_canvasInfo[tempDir] != null) {
            let canvas = Canvas.createCanvas(MapUtils.getSplitWidth(), MapUtils.getSplitHeight());
            let context = canvas.getContext("2d");

            let writeStream = fs.createWriteStream(tempDir);
            let pngStream = canvas.createPNGStream();

            pngStream.on("data", (chunk) => {
                writeStream.write(chunk);
            });

            pngStream.on("close", () => {
                console.log("close。" + "dir = " + tempDir);
                delete _canvasInfo[tempDir];
                temp = setInterval(() => {
                    clearInterval(temp)
                    draw();
                }, 10);
            });

            for (let i = 0; i < _canvasInfo[tempDir].length; i++) {
                let obj = _canvasInfo[tempDir][i];
                context.fillStyle = '#A00'
                context.globalAlpha = 0.3;
                context.fillRect(obj.x, obj.y, obj.w, obj.h);
            }
        }
    } else {
        return;
    }
}

draw();
