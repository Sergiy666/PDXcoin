const TokenV0 = artifacts.require("TokenV0");
const TokenProxy = artifacts.require("TokenProxy");
const SafeMath = artifacts.require("SafeMath");

const params = require("../common-params");

module.exports = function(deployer) {
    deployer.deploy(SafeMath);
    deployer.link(SafeMath, TokenV0);
    var token;
    var proxyAddress;
    var defaultAddress;
    deployer.deploy(TokenV0).then(function(tokenInstance) {
        token = tokenInstance;
        return deployer.deploy(TokenProxy, params.tokenName, params.tokenSymbol, params.tokenDecimals);
    }).then(function(proxyInstance) {
        proxyAddress = proxyInstance.address;
        return proxyInstance.upgradeTo(params.tokenVersion, token.address);
    }).then(function() {
        return web3.eth.getAccounts();
    }).then(function(accs) {
        defaultAddress = accs[0];
    }).then(function() {
        return TokenV0.at(proxyAddress);
    }).then(function(tok) {
        return tok.mint(params.tokenHolder, params.tokenSupply);
    });
}