const { expect } = require("chai");

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => Number(ethers.utils.formatEther(num));

describe("Marketplace", () => {
  const retrieveAccounts = async () => {
    const [deployerAccount, account1, account2] = await ethers.getSigners();

    return {
      deployerAccount,
      account1,
      account2,
    };
  };

  const prepareNFTCollection = async () => {
    const NftContractFactory = await ethers.getContractFactory("NFT");
    const NftContract = await NftContractFactory.deploy();
    const { deployerAccount, account1, account2 } = await retrieveAccounts();

    return {
      NftContract,
      deployerAccount,
      account1,
      account2,
    };
  };

  const prepareMarketplace = async () => {
    const MarketplaceContractFactory = await ethers.getContractFactory(
      "Marketplace"
    );
    const marketPlaceFeePercent = 1;
    const MarketplaceContract = await MarketplaceContractFactory.deploy(
      marketPlaceFeePercent
    );
    const { deployerAccount, account1, account2 } = await retrieveAccounts();

    return {
      MarketplaceContract,
      deployerAccount,
      marketPlaceFeePercent,
      account1,
      account2,
    };
  };

  it("tracks name of the NFT collection", async () => {
    const { NftContract } = await prepareNFTCollection();

    expect(await NftContract.name()).to.equal("NFT Tutorial");
  });

  it("tracks symbol of the NFT collection", async () => {
    const { NftContract } = await prepareNFTCollection();

    expect(await NftContract.symbol()).to.equal("NFT_Tutorial");
  });

  it("has correct fee account set", async () => {
    const { MarketplaceContract, deployerAccount } = await prepareMarketplace();

    expect(await MarketplaceContract.feeAccount()).to.equal(
      deployerAccount.address
    );
  });

  it("has correct fee percent set", async () => {
    const { MarketplaceContract } = await prepareMarketplace();

    expect(await MarketplaceContract.feePercent()).to.equal(1);
  });

  describe("mint", () => {
    it("tracks minted NFTs to owners", async () => {
      const { NftContract, account1, account2 } = await prepareNFTCollection();

      await NftContract.connect(account1).mint("https://ipfs.123.com");

      expect(await NftContract.tokenCount()).to.equal(1);
      expect(await NftContract.balanceOf(account1.address)).to.equal(1);
      expect(await NftContract.tokenURI(1)).to.equal("https://ipfs.123.com");

      await NftContract.connect(account2).mint("https://ipfs.456.com");

      expect(await NftContract.tokenCount()).to.equal(2);
      expect(await NftContract.balanceOf(account2.address)).to.equal(1);
      expect(await NftContract.tokenURI(2)).to.equal("https://ipfs.456.com");
    });
  });

  const prepareForSale = async () => {
    const { MarketplaceContract, marketPlaceFeePercent } =
      await prepareMarketplace();
    const { NftContract, account1, account2, deployerAccount } =
      await prepareNFTCollection();

    await NftContract.connect(account1).mint("https://ipfs.123.com");
    await NftContract.connect(account1).setApprovalForAll(
      MarketplaceContract.address,
      true
    );

    return {
      MarketplaceContract,
      NftContract,
      account1,
      deployerAccount,
      account2,
      marketPlaceFeePercent,
    };
  };

  describe("making markeplace items", () => {
    it("tracks newly created item, transfer NFT from seller to marketplace and emit Offered event", async () => {
      const { MarketplaceContract, NftContract, account1 } =
        await prepareForSale();

      const result = MarketplaceContract.connect(account1).makeItem(
        NftContract.address,
        1,
        toWei(1)
      );

      await expect(result)
        .to.emit(MarketplaceContract, "Offered")
        .withArgs(1, NftContract.address, 1, toWei(1), account1.address);

      expect(await NftContract.ownerOf(1)).to.equal(
        MarketplaceContract.address
      );

      expect(await MarketplaceContract.itemCount()).to.equal(1);

      const item = await MarketplaceContract.items(1);
      expect(item.itemId).to.equal(1);
      expect(item.nft).to.equal(NftContract.address);
      expect(item.tokenId).to.equal(1);
      expect(item.price).to.equal(toWei(1));
      expect(item.sold).to.equal(false);
    });

    it("fails if price is set to zero", async () => {
      const { MarketplaceContract, NftContract, account1 } =
        await prepareForSale();

      const result = MarketplaceContract.connect(account1).makeItem(
        NftContract.address,
        1,
        0
      );

      await expect(result).to.be.revertedWith(
        "Price must be greater than zero"
      );
    });
  });

  describe("Purchasing marketplace items", () => {
    const preparePurchase = async () => {
      const {
        MarketplaceContract,
        marketPlaceFeePercent,
        NftContract,
        account1,
        account2,
        deployerAccount,
      } = await prepareForSale();

      await MarketplaceContract.connect(account1).makeItem(
        NftContract.address,
        1,
        toWei(2)
      );
      const totalPriceInWei = await MarketplaceContract.getTotalPrice(1);

      return {
        MarketplaceContract,
        marketPlaceFeePercent,
        NftContract,
        account1,
        account2,
        deployerAccount,
        totalPriceInWei,
        performPurchase: async (id = 1, value = totalPriceInWei) =>
          await MarketplaceContract.connect(account2).purchaseItem(id, {
            value,
          }),
      };
    };

    it("moves ownership to buyer", async () => {
      const { NftContract, account2, performPurchase } =
        await preparePurchase();

      await performPurchase();

      expect(await NftContract.ownerOf(1)).to.equal(account2.address);
    });

    it("removes ownership from seller", async () => {
      const { NftContract, account1, performPurchase } =
        await preparePurchase();

      await performPurchase();

      expect(await NftContract.ownerOf(1)).not.to.equal(account1.address);
    });

    it("updates seller balance by the sold price", async () => {
      const { performPurchase, account1 } = await preparePurchase();

      const sellerInitialEthBalance = await account1.getBalance();
      await performPurchase();
      const sellerFinalEthBalance = await account1.getBalance();

      expect(fromWei(sellerFinalEthBalance)).to.equal(
        2 + fromWei(sellerInitialEthBalance)
      );
    });

    it("updates feeAccount (deployerAccount) balance by the sold price multiplied by the feePercent", async () => {
      const { deployerAccount, performPurchase } = await preparePurchase();
      const feeAccountInitialEthBalance = await deployerAccount.getBalance();

      await performPurchase();

      const feeAccountFinalEthBalance = await deployerAccount.getBalance();

      expect(fromWei(feeAccountFinalEthBalance)).to.equal(
        0.02 + fromWei(feeAccountInitialEthBalance)
      );
    });

    it("sets marketplace item as sold", async () => {
      const { MarketplaceContract, performPurchase } = await preparePurchase();

      await performPurchase();

      expect((await MarketplaceContract.items(1)).sold).to.equal(true);
    });

    it("emits Bought event", async () => {
      const {
        MarketplaceContract,
        NftContract,
        account1,
        account2,
        performPurchase,
      } = await preparePurchase();

      const purchaseResult = await performPurchase();

      await expect(purchaseResult)
        .to.emit(MarketplaceContract, "Bought")
        .withArgs(
          1,
          NftContract.address,
          1,
          toWei(2),
          account1.address,
          account2.address
        );
    });

    it("fails if an invalid id is passed", async () => {
      const { performPurchase } = await preparePurchase();

      await expect(performPurchase(101)).to.be.revertedWith(
        "Item doesn't exist"
      );
    });

    it("fails if not enough ether is paid", async () => {
      const { performPurchase } = await preparePurchase();

      await expect(performPurchase(1, 1)).to.be.revertedWith(
        "Not enough ether to cover item price and market fee"
      );
    });

    it("fails if item was already sold", async () => {
      const { performPurchase } = await preparePurchase();

      await performPurchase();

      await expect(performPurchase()).to.be.revertedWith("Item already sold");
    });
  });
});
