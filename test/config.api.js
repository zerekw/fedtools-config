/*jshint mocha:true, expr:true*/
/*global expect,config*/

describe('config#fedtoolsRc', function () {

  config.verbose = false;

  it('should delete a key/value pair from a .fedtoolsrc file', function () {
    var res;

    config.deleteKey(config.FEDTOOLSRCKEYS.mocha1, true);
    res = config.getKey(config.FEDTOOLSRCKEYS.mocha1);
    expect(res).to.be.undefined;

    config.deleteKey(config.FEDTOOLSRCKEYS.mocha2, true);
    res = config.getKey(config.FEDTOOLSRCKEYS.mocha2);
    expect(res).to.be.undefined;

    config.deleteKey(config.FEDTOOLSRCKEYS.mocha3, true);
    res = config.getKey(config.FEDTOOLSRCKEYS.mocha3);
    expect(res).to.be.undefined;
  });

  it('should set/get a key/value pair to/from a .fedtoolsrc file', function () {
    var res;

    config.setKey(config.FEDTOOLSRCKEYS.mocha1, '123', true);
    res = config.getKey(config.FEDTOOLSRCKEYS.mocha1);
    expect(res).to.equal('123');

    config.setKey(config.FEDTOOLSRCKEYS.mocha1, '456', true);
    res = config.getKey(config.FEDTOOLSRCKEYS.mocha1);
    expect(res).to.equal('456');

    var obj = {};
    obj[config.FEDTOOLSRCKEYS.mocha1] = '666';
    obj[config.FEDTOOLSRCKEYS.mocha2] = '777';
    config.setKey(obj);
    res = config.getKey(config.FEDTOOLSRCKEYS.mocha1);
    expect(res).to.equal('456'); // cannot set private keys in bulk
    res = config.getKey(config.FEDTOOLSRCKEYS.mocha2);
    expect(res).to.not.equal('777'); // cannot set private keys in bulk

    config.deleteKey(config.FEDTOOLSRCKEYS.mocha1, true);
    res = config.getKey(config.FEDTOOLSRCKEYS.mocha1);
    expect(res).to.be.undefined;

    config.deleteKey(config.FEDTOOLSRCKEYS.mocha2, true);
    res = config.getKey(config.FEDTOOLSRCKEYS.mocha2);
    expect(res).to.be.undefined;

    config.deleteKey(config.FEDTOOLSRCKEYS.mocha3, true);
    res = config.getKey(config.FEDTOOLSRCKEYS.mocha3);
    expect(res).to.be.undefined;
  });

});
