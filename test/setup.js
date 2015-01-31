var config = require('../index'),
  chai = require('chai');

chai.should();

global.config = config;

global.expect = chai.expect;
