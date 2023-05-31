import { useCallback, useEffect, useState } from "react";
import { ItemCard } from "./ItemCard";
import { ItemCardContainer } from "./ItemCardContainer";

const MyListedItems = ({ nft, marketplace, account }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);

  const loadListedItems = useCallback(async () => {
    const items = [];
    const soldItems = [];
    let itemCount = await marketplace.itemCount();

    while (itemCount--) {
      const item = await marketplace.items(itemCount);

      if (item.seller.toLowerCase() !== account) {
        continue;
      }
      const uri = await nft.tokenURI(item.itemId);
      const response = await fetch(uri);
      const metadata = await response.json();
      const totalPrice = await marketplace.getTotalPrice(item.itemId);

      const marketplaceItem = {
        totalPrice,
        ...metadata,
        ...item,
      };

      if (item.sold) {
        soldItems.push(marketplaceItem);
      } else {
        items.push(marketplaceItem);
      }
    }

    setItems(items);
    setSoldItems(soldItems);
    setLoading(false);
  }, [nft, marketplace, account]);

  useEffect(() => {
    loadListedItems();
  }, [loadListedItems]);

  return (
    <div>
      <h2>My listed items</h2>
      {loading && "Loading..."}
      {items.length === 0 && "No items found"}
      {items.length !== 0 && (
        <>
          <h2>Listed items</h2>
          <ItemCardContainer>
            {items.map((item) => {
              return (
                <ItemCard
                  key={item.itemId}
                  marketplace={marketplace}
                  item={item}
                  account={account}
                />
              );
            })}
          </ItemCardContainer>
        </>
      )}
      {soldItems.length !== 0 && (
        <>
          <h2>Sold items</h2>
          <ItemCardContainer>
            {soldItems.map((item) => {
              return (
                <ItemCard
                  key={item.itemId}
                  marketplace={marketplace}
                  item={item}
                  account={account}
                />
              );
            })}
          </ItemCardContainer>
        </>
      )}
    </div>
  );
};

export default MyListedItems;
