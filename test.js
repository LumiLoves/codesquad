
var a = "1e4"
console.log(Number(a));
console.log(typeof Number(a))
var a = "2.5e12"
console.log(Number(a));
console.log(typeof Number(a))
var a = "3.4e+4"
console.log(Number(a));
console.log(typeof Number(a))
var a = "4.56ee-100"
console.log(Number(a));
console.log(typeof Number(a))
var a = "true"
console.log(Number(a));
console.log(typeof Number(a))
var a = "6.78E-5"
console.log(Number(a));
console.log(typeof Number(a))
// 2.5e12
// 3.4e+4
// 4.56e-8
// 5.67E+10
// 6.78E-5";
var b = a.split('');
console.log(b);