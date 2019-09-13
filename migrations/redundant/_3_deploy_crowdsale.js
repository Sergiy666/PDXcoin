const TokenProxy = artifacts.require("TokenProxy");
const SafeMath = artifacts.require("SafeMath");
const Crowdsale = artifacts.require("Crowdsale");

const params = require("../common-params");

module.exports = function(deployer) {
    deployer.link(SafeMath, Crowdsale);
    var accounts;
    deployer.then(function() {
        return web3.eth.getAccounts();
    }).then(function(accs) {
        accounts = accs;
        return TokenProxy.deployed();
    }).then(function(proxyInstance) {
        return deployer.deploy(Crowdsale, params.initialRate, accounts[0], proxyInstance.address);
    });
}