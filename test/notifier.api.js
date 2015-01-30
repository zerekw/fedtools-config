/*jshint mocha:true,expr:true*/
/*global expect,notifier*/

var path = require('path');

describe('notifier#api', function () {
  it('should be a function', function () {
    expect(notifier.notify).to.be.a('function');
  });

  it('should report notifier is supported', function () {
    var n,
      req = path.join(__dirname, './mockdata/notifier-supported');
    n = notifier._tryNotifier(req);
    expect(n).to.be.an('Object');
  });

  it('should report notifier is not supported', function () {
    var n,
      req = path.join(__dirname, './mockdata/notifier-not-supported');
    n = notifier._tryNotifier(req);
    expect(n).to.be.undefined;
  });
});
