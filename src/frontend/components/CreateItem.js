import { Buffer } from "buffer";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useCallback, useState } from "react";
import { Button, Form, Row } from "react-bootstrap";

const projectId = "2QFYNzfL84MfCtlFINwsyzRB1d8";
const projectSecret = "307844b97c59dc33ef3f2f7f4e2f69c2";
const ipfsAuthToken =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const ipfsClient = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: { authorization: ipfsAuthToken },
});

const CreateItem = ({ marketplace, nft }) => {
  const [itemState, setItemState] = useState({
    image: "",
    price: undefined,
    name: "",
    description: "",
  });
  const [success, setSuccess] = useState(false);

  const uploadToIpfs = useCallback(async (event) => {
    event.preventDefault();
    const file = event.target.files[0];

    if (!!file) {
      try {
        // const result = await ipfsClient.add(file);
        // console.log(result);
        const result = {
          path: "Qmd2t9dzcrfAjch14WQNk3yyBzQXUikAFxQgvtC5c9RFPq",
        };

        setItemState((currentState) => ({
          ...currentState,
          image: `https://marketplace-tutorial.infura-ipfs.io/ipfs/${result.path}`,
        }));
      } catch (error) {
        console.error("IPFS image upload error", error);
      }
    }
  }, []);

  const mintThenList = useCallback(
    async (result) => {
      const uri = `https://marketplace-tutorial.infura-ipfs.io/ipfs/${result.path}`;
      const mintTransaction = await nft.mint(uri);
      console.log("Mint transaction: ", mintTransaction);
      const rc = await mintTransaction.wait();
      console.log("Mint transaction confirmed: ", rc);
      const event = rc.events.find((event) => event.event === "Transfer");
      if (!event) {
        console.error("Fatal error: no transfer event found!");
        console.log("RC:", rc);
        return;
      }
      const [, , id] = event.args;

      // very brittle logic
      // const id = await nft.tokenCount();

      const approvalTransaction = await nft.setApprovalForAll(
        marketplace.address,
        true
      );
      await approvalTransaction.wait();

      const listingPrice = ethers.utils.parseEther(itemState.price.toString());
      const makeItemTransaction = await marketplace.makeItem(
        nft.address,
        id,
        listingPrice
        // parseFloat(listingPrice.toString())
        // listingPrice.toString()
      );
      await makeItemTransaction.wait();

      setSuccess(true);
    },
    [marketplace, nft, itemState.price]
  );

  const submitDisabled =
    !itemState.description ||
    !itemState.name ||
    !itemState.price ||
    !itemState.image ||
    success;

  const createNft = async () => {
    if (submitDisabled) {
      return;
    }

    try {
      const result = await ipfsClient.add(JSON.stringify(itemState));
      mintThenList(result);
    } catch (error) {
      console.error("IPFS URI upload error", error);
    }
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <h2>Create new item</h2>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control type="file" name="file" onChange={uploadToIpfs} />
              <Form.Control
                type="text"
                size="lg"
                placeholder="Name"
                onChange={(event) =>
                  setItemState((state) => ({
                    ...state,
                    name: event.target.value,
                  }))
                }
              />
              <Form.Control
                as="textarea"
                size="lg"
                placeholder="Description"
                onChange={(event) =>
                  setItemState((state) => ({
                    ...state,
                    description: event.target.value,
                  }))
                }
              />
              <Form.Control
                type="number"
                placeholder="Price in ETH"
                size="lg"
                onChange={(event) =>
                  setItemState((state) => ({
                    ...state,
                    price: event.target.value,
                  }))
                }
              />
              <div className="d-grid px-0">
                <Button
                  onClick={createNft}
                  variant="primary"
                  size="lg"
                  disabled={submitDisabled}
                >
                  Create and list NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateItem;
