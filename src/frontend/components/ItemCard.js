import { ethers } from "ethers";
import { useMemo } from "react";
import { Button, Card, Col } from "react-bootstrap";

export const ItemCard = ({ item, buyMarketItem, account }) => {
  const buyMarketItemHandler = useMemo(() => {
    if (buyMarketItem) {
      return () => buyMarketItem(item);
    }

    return undefined;
  }, [item, buyMarketItem]);

  return (
    <Col key={item.itemId} className="overflow-hidden">
      <Card>
        <Card.Img variant="top" src={item.image} />
        <Card.Body color="secondary">
          <Card.Title>Name: {item.name}</Card.Title>
          <Card.Text>Description: {item.description}</Card.Text>
          {account && account.toLowerCase() === item.seller.toLowerCase() && (
            <Card.Text>Owner</Card.Text>
          )}
        </Card.Body>
        <Card.Footer>
          <div className="d-grid">
            {buyMarketItemHandler && (
              <Button
                onClick={buyMarketItemHandler}
                variant="primary"
                size="lg"
              >
                Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
              </Button>
            )}
          </div>
        </Card.Footer>
      </Card>
    </Col>
  );
};
