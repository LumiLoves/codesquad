/**
 * run
 */

import './unit/utility/helpers.test.js';
import './unit/component/ui/AutoCompleteSearcher.test.js';

mocha.checkLeaks();
mocha.run();
