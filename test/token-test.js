const TokenV0 = artifacts.require("TokenV0");
const TokenProxy = artifacts.require("TokenProxy");
const catchRevert = require("../test-util/exceptions.js").catchRevert;
const BN = require("bn.js");

const params = require("../common-params");
const tokenSymbol = params.tokenSymbol;
const tokenName = params.tokenName;
const tokenSupply = new BN(params.tokenSupply);
const tokenDecimals = params.tokenDecimals;
const transferAmount = new BN(100);

contract("Token test", async accounts => {
    var proxyImpl;
    var token;
    before(async function() {
        proxyImpl = await TokenProxy.deployed();
        token = await TokenV0.at(proxyImpl.address);
    });

    it("should set tokenSymbol to " + tokenSymbol, async () => {
        let symbol = await token.symbol();
        assert.equal(symbol, tokenSymbol);
    });

    it("should set tokenName to " + tokenName, async () => {
        let name = await token.name();
        assert.equal(name, tokenName);
    });

    it("should set decimals to " + tokenDecimals, async () => {
        let decimals = (await token.decimals()).toNumber();
        assert.equal(decimals, tokenDecimals);
    });

    it("should put " + tokenSupply + " tokens (ignoring decimals) in the first account", async () => {
        let firstAccBalance = await token.balanceOf(accounts[0]);
        assert.equal(firstAccBalance.toString(), tokenSupply.toString());
    });

    it("should set totalSupply equal to the balance of the first account", async () => {
        let totalSupply = await token.totalSupply();
        assert.equal(totalSupply.toString(), tokenSupply.toString());
    });

    it("should transfer tokens correctly", async () => {
        let oldBalance0 = await token.balanceOf(accounts[0]);
        let oldBalance1 = await token.balanceOf(accounts[1]);

        await token.transfer(accounts[1], transferAmount);
        
        let newBalance0 = await token.balanceOf(accounts[0]);
        let newBalance1 = await token.balanceOf(accounts[1]);

        assert.equal(oldBalance0.toString(), newBalance0.add(transferAmount).toString());
        assert.equal(oldBalance1.toString(), newBalance1.sub(transferAmount).toString());
    });

    it("shouldn't allow transferFrom without approval", async () => {
        await catchRevert(token.transferFrom(accounts[1], accounts[0], transferAmount));
    });

    it("should transferFrom correctly after approval", async () => {
        let oldBalance0 = await token.balanceOf(accounts[0]);
        let oldBalance1 = await token.balanceOf(accounts[1]);

        await token.approve(accounts[1], transferAmount);
        await token.transferFrom(accounts[0], accounts[1], transferAmount, {from: accounts[1]});
        
        let newBalance0 = await token.balanceOf(accounts[0]);
        let newBalance1 = await token.balanceOf(accounts[1]);

        assert.equal(oldBalance0.toString(), newBalance0.add(transferAmount).toString());
        assert.equal(oldBalance1.toString(), newBalance1.sub(transferAmount).toString());
    });

    it("shouldn't allow transfer bigger than balance", async () => {
        let balance = await token.balanceOf(accounts[0]);
        await catchRevert(token.transfer(accounts[1], balance.add(new BN(1))));
    });

    it("shouldn't allow minting", async () => {
        await catchRevert(token.mint(accounts[0], transferAmount));
    });

    it("shouldn't allow proxy upgrade by non-owner", async () => {
        let newTokenImpl = await TokenV0.new();
        await catchRevert(token.upgradeTo("v0.2", newTokenImpl.address, {from: accounts[1]}));
    });

    it("shouldn't allow tokens minting at logic contract", async () => {
        let tokenImpl = await TokenV0.deployed();
        await catchRevert(tokenImpl.mint(accounts[0], transferAmount));
    });

    it("should set new admin correctly", async () => {
        await token.setNewAdmin(accounts[1]);
        let newAdmin = await token.admin();
        assert.equal(accounts[1], newAdmin);
    });
});