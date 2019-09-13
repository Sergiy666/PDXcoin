const Crowdsale = artifacts.require("Crowdsale");
const TokenV0 = artifacts.require("TokenV0");
const TokenProxy = artifacts.require("TokenProxy");
const catchRevert = require("../test-util/exceptions.js").catchRevert;
const BN = require("bn.js");

const params = require("../common-params");

contract("Crowdsale test", async accounts => {
    var crowdsale;
    var token;
    before(async function() {
        crowdsale = await Crowdsale.deployed();
        let proxy = await TokenProxy.deployed();
        token = await TokenV0.at(proxy.address);
        await token.transfer(crowdsale.address, new BN(params.tokenSupply).div(new BN(2)));;
    });

    it("should set initial rate to " + params.initialRate, async () => {
        let rate = await crowdsale.rate();
        assert.equal(rate.toString(), params.initialRate);
    });

    it("should not approve KYC for any addresses by default", async () => {
        let isApproved0 = await crowdsale.isKYCApproved(accounts[0]);
        let isApproved1 = await crowdsale.isKYCApproved(accounts[1]);
        assert.equal(isApproved0, false);
        assert.equal(isApproved1, false);
    });

    it("shouldn't allow token purchase from address that is not KYC-approved", async () => {
        await catchRevert(crowdsale.send(web3.utils.toWei("1")));
    });

    it("should add an address to the KYC whitelist correctly", async () => {
        await crowdsale.approveKYC(accounts[1]);
        let isApproved1 = await crowdsale.isKYCApproved(accounts[1]);
        assert.equal(isApproved1, true);
    });

    it("shouldn't process token purchase with too few wei provided", async () => {
        // accounts[1] was added to KYC whitelist in previous step
        let weiSum = (new BN(params.initialRate)).sub(new BN(1));
        await catchRevert(crowdsale.send(weiSum, {from: accounts[1]}));
    });

    it("should process purchase of 1 token unit correctly", async () => {
        let weiSum = new BN(params.initialRate);
        await crowdsale.send(weiSum, {from: accounts[1]});
        let newBalance1 = await token.balanceOf(accounts[1]);
        assert.equal(newBalance1.toString(), "1");
    });
});