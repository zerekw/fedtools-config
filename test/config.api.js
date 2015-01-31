/*jshint mocha:true, expr:true*/
/*global expect,config*/

describe('config#fedtoolsRc', function () {

  it('should set/get a key/value pair to a .fedtoolsrc file', function () {
    var res;

    config.setKey(config.FEDTOOLSRCKEYS.mochaA, '123');
    res = config.getKey(config.FEDTOOLSRCKEYS.mochaA);
    expect(res).to.equal('123');

    config.setKey(config.FEDTOOLSRCKEYS.mochaA, '456');
    res = config.getKey(config.FEDTOOLSRCKEYS.mochaA);
    expect(res).to.equal('456');

    var obj = {};
    obj[config.FEDTOOLSRCKEYS.mochaB] = '666';
    obj[config.FEDTOOLSRCKEYS.mochaC] = '777';
    config.setKey(obj);
    res = config.getKey(config.FEDTOOLSRCKEYS.mochaB);
    expect(res).to.equal('666');

    config.deleteKey(config.FEDTOOLSRCKEYS.mochaA);
    res = config.getKey(config.FEDTOOLSRCKEYS.mochaA);
    expect(res).to.be.undefined;

    config.deleteKey(config.FEDTOOLSRCKEYS.mochaB);
    res = config.getKey(config.FEDTOOLSRCKEYS.mochaB);
    expect(res).to.be.undefined;

    config.deleteKey(config.FEDTOOLSRCKEYS.mochaC);
    res = config.getKey(config.FEDTOOLSRCKEYS.mochaC);
    expect(res).to.be.undefined;
  });
});
