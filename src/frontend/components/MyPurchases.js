import { useCallback, useEffect, useState } from "react";
import { createItem } from "./item-utils";
import { ItemCard } from "./ItemCard";
import { ItemCardContainer } from "./ItemCardContainer";

const MyPurchases = ({ marketplace, nft, account }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const loadPurchasedItems = useCallback(async () => {
    const filter = marketplace.filters.Bought(
      null,
      null,
      null,
      null,
      null,
      account
    );
    const results = await marketplace.queryFilter(filter);

    const purchases = await Promise.all(
      results.map(async (result) => {
        const { itemId } = result.args;
        const marketplaceItem = await marketplace.items(itemId);

        return await createItem(marketplace, nft, marketplaceItem);
      })
    );

    setLoading(false);
    setItems(purchases);
  }, [marketplace, nft, account]);

  useEffect(() => {
    loadPurchasedItems();
  }, [loadPurchasedItems]);

  return (
    <div>
      <h2>My Purchases</h2>
      {loading && "Loading..."}
      {items.length === 0 && "No items found"}
      {items.length !== 0 && (
        <ItemCardContainer>
          {items.map((item) => {
            return <ItemCard key={item.itemId} item={item} account={account} />;
          })}
        </ItemCardContainer>
      )}
    </div>
  );
};

export default MyPurchases;
