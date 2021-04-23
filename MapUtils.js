
let MapUtils = {};
module.exports = MapUtils;

let g_offset = 2;

/** 地图ID */
let _mapId;
/** 地图数据 */
let _mapData;
/** 地图宽 */
let _mapWidth;
/** 地图高 */
let _mapHeight;

/** 格子宽 */
let _cellWidth;
/** 格子高 */
let _cellHeight;

let _cellHalfWidth;
let _cellHalfHeight;

let _rows;
let _cols;

/** 切块宽 */
let _splitWidth;
/** 切块高 */
let _splitHeight;

let _splitCols;
let _splitRows;

/**
 * 格子宽
 * 
 * @returns 
 */
MapUtils.getCellWidth = function () {
    return _cellWidth;
}

/**
 * 格子高
 * 
 * @returns 
 */
MapUtils.getCellHeight = function () {
    return _cellHeight;
}

/**
 * 切块宽
 * 
 * @returns 
 */
MapUtils.getSplitWidth = function () {
    return _splitWidth;
}

/**
 * 格子高
 * 
 * @returns 
 */
MapUtils.getSplitHeight = function () {
    return _splitHeight;
}

/**
 * 初始化地图数据
 * 
 * @param {*} id 
 * @param {*} buffer 
 * @param {*} byteOffset 
 * @param {*} width 
 * @param {*} height 
 * @param {*} splitWidth 
 * @param {*} splitHeight 
 * @param {*} splitCols 
 * @param {*} splitRows 
 */
MapUtils.initData = function (id, buffer, byteOffset, width, height, splitWidth, splitHeight, splitCols, splitRows) {

    _mapData = new Uint8Array(buffer, byteOffset + g_offset);
    let bytes = new DataView(buffer, byteOffset);
    let offset = 0;

    _mapId = id;
    _mapWidth = width;
    _mapHeight = height;

    _splitWidth = splitWidth;
    _splitHeight = splitHeight;

    _splitCols = splitCols;
    _splitRows = splitRows;

    _cellWidth = bytes.getUint8(offset++);
    _cellHeight = bytes.getUint8(offset++);

    _cellHalfWidth = _cellWidth >> 1;
    _cellHalfHeight = _cellHeight >> 1;

    _cols = _mapWidth / _cellWidth;
    _rows = _mapHeight / _cellHeight;
}

/**
 * 是否可移动
 * 
 * @param {*} x 
 * @param {*} y 
 * @param {*} motion 
 * @param {*} auth 
 * @returns 
 */
let _isCanMove = function (x, y, motion = 5, auth = 0) {
    if (x >= _cols || x < 0) {
        return false;
    }

    if (y >= _rows || y < 0) {
        return false;
    }

    let value = _mapData[_cols * y + x];
    return ((value & 0x70) >> 4) <= motion && (value & 0x0F) <= auth;
}

/**
 * 获取格子信息
 * 
 * @returns 
 */
let _getCellInfo = function () {
    let cellInfo = [];

    for (let k = 0; k < _rows; k++) {
        let temp = [];
        for (let i = 0; i < _cols; i++) {
            temp.push(_isCanMove(i, k));
        }
        cellInfo.push(temp)
    }

    return cellInfo;
}

/**
 * 获取切块信息
 * 
 * @returns 
 */
MapUtils.getSplitInfo = function () {
    let cellInfo = _getCellInfo();

    let splitInfo = {};

    let cellCols = _splitWidth / _cellWidth;
    let cellRows = _splitHeight / _cellHeight;

    for (let k = 0; k < _splitCols; k++) {
        for (let i = 0; i < _splitRows; i++) {

            splitInfo[i + "_" + k] = [];

            let startX = k * cellCols;
            let endedX = startX + cellCols;

            let startY = i * cellRows;
            let endedY = startY + cellRows;

            for (let cellY = startY; cellY < endedY; cellY++) {
                let temp = []
                for (let cellX = startX; cellX < endedX; cellX++) {
                    temp.push(cellInfo[cellY][cellX])
                }
                splitInfo[i + "_" + k].push(temp);
            }
        }
    }

    return splitInfo;
}