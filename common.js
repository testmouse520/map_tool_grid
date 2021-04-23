
let common = {};
module.exports = common;


/**
 * Buffer 转 ArrayBuffer
 * 
 * @param {*} bytes 
 * @returns 
 */
common.toArrayBuffer = function toArrayBuffer(bytes) {
    let raw = new Uint8Array(bytes.length);
    raw.set(bytes.slice());
    return raw.buffer;
}