import { ethers } from "ethers";
import { useCallback, useState } from "react";
import { Spinner } from "react-bootstrap";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CreateItem from "./CreateItem";
import Home from "./Home";
import MyListedItems from "./MyListedItems";
import MyPurchases from "./MyPurchases";
import Navigation from "./Navigation";

import MarketPlaceAddress from "../contractsData/Marketplace-address.json";
import MarketPlaceAbi from "../contractsData/Marketplace.json";
import NFTAddress from "../contractsData/NFT-address.json";
import NFTAbi from "../contractsData/NFT.json";

import { AllNfts } from "./AllNfts";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState();
  const [marketplace, setMarketPlace] = useState({});
  const [nft, setNft] = useState({});

  const web3Handler = useCallback(async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    setAccount(accounts[0]);

    const signer = provider.getSigner();

    const marketplace = new ethers.Contract(
      MarketPlaceAddress.address,
      MarketPlaceAbi.abi,
      signer
    );
    setMarketPlace(marketplace);
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    setNft(nft);
    setLoading(false);
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account} />
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "80vh",
            }}
          >
            <Spinner animation="border" style={{ display: "flex" }} />
            <p className="mx-3 my-0">Awaiting MetaMask connection...</p>
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <Home marketplace={marketplace} nft={nft} account={account} />
              }
            />
            <Route
              path="/all-nfts"
              element={<AllNfts marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/my-nfts"
              element={
                <AllNfts
                  nft={nft}
                  marketplace={marketplace}
                  account={account}
                />
              }
            />
            <Route
              path="/create"
              element={<CreateItem marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/my-listed-items"
              element={
                <MyListedItems
                  nft={nft}
                  marketplace={marketplace}
                  account={account}
                />
              }
            />
            <Route
              path="/my-purchases"
              element={
                <MyPurchases
                  marketplace={marketplace}
                  nft={nft}
                  account={account}
                />
              }
            />
          </Routes>
        )}
        {/* 
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mx-auto mt-5">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={logo} className="App-logo" alt="logo" />
                </a>
                <h1 className="mt-5">Dapp University Starter Kit</h1>
                <p>
                  Edit <code>src/frontend/components/App.js</code> and save to
                  reload.
                </p>
                <a
                  className="App-link"
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LEARN BLOCKCHAIN{" "}
                  <u>
                    <b>NOW! </b>
                  </u>
                </a>
              </div>
            </main>
          </div>
        </div> */}
      </div>
    </BrowserRouter>
  );
}

export default App;
