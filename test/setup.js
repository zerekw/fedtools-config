var notifier = require('../index'),
  chai = require('chai');

chai.should();

global.notifier = notifier;

global.expect = chai.expect;
