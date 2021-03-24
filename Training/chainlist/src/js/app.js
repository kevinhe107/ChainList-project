App = {

    contracts: {},
    account: 0X0,
    

    init() {
        //Load articles 
        var articlesRow = $('#articlesRow');
        var articleTemplate = $('#articleTemplate');;
        articleTemplate.find('.panel-title').text("article one");
        articleTemplate.find('.article-description').text("Description for this article"
        );
        articleTemplate.find('.article-price').text("10.23");
        articleTemplate.find('.article-seller').text("0x01234567890123456789012345678901"
        );
        articlesRow.append(articleTemplate.html());
        return App.initWeb3();
    },

    initWeb3() {
        if (window.ethereum) {
            // Modern dapp browsers...
            window.web3 = new Web3(ethereum);
            try {
                // Request account access if needed
                await ethereum.enable();

                App.displayAccountInfo();
                return App.initContract();
            } catch (error) {
                // User denied account access...
                console.error("Unable to retrieve your accounts! You have to approve this application on Metamask.");
            }
        } else if (window.web3) {
            // Legacy dapp browsers...
            window.web3 = new Web3(web3.currentProvider || "ws://localhost:8545");

            App.displayAccountInfo();
            return App.initContract();
        } else {
            // Non-dapp browsers...
            console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
        }
    },

    async displayAccountInfo() {
        const accounts = await web3.eth.getAccounts();
        App.account = accounts[0];
        $('#account').text(App.account);

        const balance = await web3.eth.getBalance(App.account);
        $("#accountBalance").text(web3.utils.fromWei(balance, "ether") + "ETH");
    },

    async initContract() {
        $.getJSON('ChainList.json', function (artifact) {
            const TruffleContract = window.TruffleContract;
            App.contracts.ChainList = TruffleContract(artifact);
            App.contracts.ChainList.setProvider(window.web3.currentProvider);
            // retrieve the article from the contract
            return App.reloadArticles();
        });
    },

    async reloadArticles(){
        //refresh account information because the balanc emight have changed
        App.displayAccountInfo();

        //retrieve the article placeholder and clear it
        $('#articlesRow').empty();
        try {
            const ChainListInstance = await App.contracts.ChainList.deployed();
            const article = await ChainListInstance.getArticle();
            if (article._seller == 0X0) {
                //no article
                return;
            }

            //retrieve and fill the article template
            var articleTemplate = $('#articleTemplate');
            articleTemplate.find('.panel-title').text(article._name);
            articleTemplate.find('.article-description').text(article._description);
            articleTemplate.find('.article-price').text(web3.utils.fromWei(web3.utils.toBN(article._price), "ether"));

            var seller = article._seller;
            if (seller == App.account) {
                seller = "You";
            }
            articleTemplate.find('.article-seller').text(seller);

            //add this new article
            $('#articlesRow').append(articleTemplate.html());
        } catch (error) {
            console.error(error);
        }
    },

    async sellArticle() {
        //retrive the detail of the article
        const priceNumber = parseFloat($("#article_price").val());
        const articlePrice = isNaN(priceNumber) ? "0" : priceNumber.toString();

        const _article_name = $("#article_name").val();
        const _description = $("#article_description").val();
        const _price = web3.utils.toWei(articlePrice, "ether");

        if (_article_name.trim() == "" || _price == 0) {
            //nothing to sell
            return false;
        }

        try {
            const chainListInstance = await App.contracts.ChainList.deployed();
            const receipt = await chainListInstance.sellArticle(_article_name, _description, _price, {
                from: App.account,
                gas: 500000
            }).on("transactionHash", function(hash) {
                console.log("Transaction hash: " + hash);
            });
            console.log("Transaction receipt:", receipt);
            App.reloadArticles();
        } catch (error) {
            console.error(error);
        }
    },

    // Listen to events emitted by the contract
    async listenToEvents() {
        const chainListInstance = await App.contracts.ChainList.deployed()
        App.logSellArticleEvent = chainListInstance
            .LogSellArticle({ fromBlock: "latest", toBlock: "latest" })
            .on("data", event => {
                $("#events").append(                 
                    '<li class="list-group-item">' + event.returnValues._name + " is forsale" + "</li>");
                App.reloadArticles();
            })
            .on("error", function(error) {
                console.error(error);
            });
    }

};

$(function() {
    $(window).load(function () {
        App.init();
    });
});
