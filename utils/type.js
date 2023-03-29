function isObject(val) {
    return val != null && typeof val === 'object' && Array.isArray(val) === false;
};


module.exports = {
    isObject
}
