/**
 * setup
 */

// test framework
import './lib/mocha@4.0.1.js';

// test library
import './lib/chai@4.1.2.js'; // assertion
// import 'https://unpkg.com/istanbul@0.4.5/index.js'; // test coverage report generator
// 이스탄불 사용법 http://blog.jeonghwan.net/2016/07/28/istanbul.html

mocha.setup('bdd'); // test interface 설정