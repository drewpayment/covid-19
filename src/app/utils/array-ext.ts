
// SO: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
// gist: https://gist.github.com/robmathers/1830ce09695f759bf2c4df15c29dd22d
// Array.prototype.groupBy = function(key, key2, delimiter = ',') {
//     // tslint:disable-next-line: only-arrow-functions
//     return this.reduce(function(rv, x) {
//         if (key2)
//             (rv[x[key] + delimiter + x[key2]] = rv[x[key] + delimiter + x[key2]] || []).push(x);
//         else 
//             (rv[x[key]] = rv[x[key]] || []).push(x);
//         return rv;
//     }, {});
// };
