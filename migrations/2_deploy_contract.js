var ChainList = artifacts.require("./ChainList.sol");

module.exports = deployer => {
  deployer.deploy(ChainList);
};
