import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import market from "./market.png";

const Navigation = ({ web3Handler, account }) => {
  return (
    <Navbar expand="lg" bg="secondary" variant="dark">
      <Container>
        <Navbar.Brand>
          <img
            src={market}
            width="40"
            height="40"
            alt="NFT Marketplace"
            title="NFT Marketplace"
          />
          &nbsp; DApp NFT Marketplace
        </Navbar.Brand>
        <Nav>
          {account ? (
            <Nav.Link
              href={`https://etherscan.io/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
              className="button nav-button btn-sm mx-4"
            >
              <Button variant="outline-light">
                {`${account.slice(0, 5)}...${account.slice(38)}`}
              </Button>
            </Nav.Link>
          ) : (
            <Button onClick={web3Handler} variant="outline-light">
              Connect wallet
            </Button>
          )}
        </Nav>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/all-nfts">
              All NFTs
            </Nav.Link>
            <Nav.Link as={Link} to="/my-nfts">
              My NFTs
            </Nav.Link>
            <Nav.Link as={Link} to="/create">
              Create
            </Nav.Link>
            <Nav.Link as={Link} to="/my-listed-items">
              My Listed Items
            </Nav.Link>
            <Nav.Link as={Link} to="/my-purchases">
              My Purchases
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
