module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    ganache: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    },
    joestar: {
      host: "localhost",
      port: 8545,
      network_id: "4224",
      gas: 4700000
      // from: "0x2753e6bd2e8f0cdb912dd10ccabe29f0a6043b13" // This is second account
    }
  }
};
