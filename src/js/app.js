App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
    App.displayAccountInfo();
    return App.initContract();
  },

  displayAccountInfo: () => {
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        App.account = account;
        $("#account").text(account);
        web3.eth.getBalance(account, (err, balance) => {
          if (err === null) {
            $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
          }
        });
      }
    });
  },

  initContract: () => {
    $.getJSON("ChainList.json", chainListArtifact => {
      // Get the necessary contract artifact file and use it to instantiate a truffle contract abstraction.
      App.contracts.ChainList = TruffleContract(chainListArtifact);

      // Set the provider for our contract.
      App.contracts.ChainList.setProvider(App.web3Provider);

      // Listen for events
      App.listenToEvents();

      // Retrieve the article from the smart contract
      return App.reloadArticles();
    });
  },

  reloadArticles: () => {
    // avoid re-entry
    if (App.loading) {
      return;
    }
    App.loading = true;

    // refresh account information because the balance may have changed
    App.displayAccountInfo();

    var chainListInstance;

    App.contracts.ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        return chainListInstance.getArticlesForSale();
      })
      .then(articleIds => {
        // Retrieve and clear the article placeholder
        var articlesRow = $("#articlesRow");
        articlesRow.empty();

        for (var i = 0; i < articleIds.length; i++) {
          var articleId = articleIds[i];
          chainListInstance.articles(articleId.toNumber()).then(article => {
            App.displayArticle(
              article[0],
              article[1],
              article[3],
              article[4],
              article[5]
            );
          });
        }
        App.loading = false;
      })
      .catch(function(err) {
        console.log(err.message);
        App.loading = false;
      });
  },

  displayArticle: (id, seller, name, description, price) => {
    // Retrieve the article placeholder
    var articlesRow = $("#articlesRow");

    var etherPrice = web3.fromWei(price, "ether");

    // Retrieve and fill the article template
    var articleTemplate = $("#articleTemplate");
    articleTemplate.find(".panel-title").text(name);
    articleTemplate.find(".article-description").text(description);
    articleTemplate.find(".article-price").text(etherPrice + " ETH");
    articleTemplate.find(".btn-buy").attr("data-id", id);
    articleTemplate.find(".btn-buy").attr("data-value", etherPrice);

    // seller?
    if (seller == App.account) {
      articleTemplate.find(".article-seller").text("You");
      articleTemplate.find(".btn-buy").hide();
    } else {
      articleTemplate.find(".article-seller").text(seller);
      articleTemplate.find(".btn-buy").show();
    }

    // add this new article
    articlesRow.append(articleTemplate.html());
  },

  sellArticle: () => {
    // retrieve details of the article
    var _article_name = $("#article_name").val();
    var _description = $("#article_description").val();
    var _price = web3.toWei(
      parseFloat($("#article_price").val() || 0),
      "ether"
    );

    if (_article_name.trim() == "" || _price == 0) {
      // nothing to sell
      return false;
    }

    App.contracts.ChainList.deployed()
      .then(function(instance) {
        return instance.sellArticle(_article_name, _description, _price, {
          from: App.account,
          gas: 500000
        });
      })
      .then(function(result) {})
      .catch(function(err) {
        console.error(err);
      });
  },

  // Listen for events raised from the contract
  listenToEvents: () => {
    App.contracts.ChainList.deployed().then(instance => {
      instance
        .SellArticleEvent(
          {},
          {
            fromBlock: 0,
            toBlock: "latest"
          }
        )
        .watch((error, event) => {
          if (!error) {
            $("#events").append(
              '<li class="list-group-item">' +
                event.args._name +
                " is for sale" +
                "</li>"
            );
          } else {
            console.error(error);
          }
          App.reloadArticles();
        });

      instance
        .BuyArticleEvent(
          {},
          {
            fromBlock: 0,
            toBlock: "latest"
          }
        )
        .watch((error, event) => {
          if (!error) {
            $("#events").append(
              '<li class="list-group-item">' +
                event.args._buyer +
                " bought " +
                event.args._name +
                "</li>"
            );
          } else {
            console.error(error);
          }
          App.reloadArticles();
        });
    });
  },

  buyArticle: function() {
    event.preventDefault();

    // retrieve the article price
    var _articleId = $(event.target).data("id");
    var _price = parseFloat($(event.target).data("value"));

    App.contracts.ChainList.deployed()
      .then(function(instance) {
        return instance.buyArticle(_articleId, {
          from: App.account,
          value: web3.toWei(_price, "ether"),
          gas: 500000
        });
      })
      .then(function(result) {})
      .catch(function(err) {
        console.error(err);
      });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
