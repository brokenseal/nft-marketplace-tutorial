import { useCallback, useEffect, useState } from "react";
import { createItem } from "./item-utils";
import { ItemCard } from "./ItemCard";
import { ItemCardContainer } from "./ItemCardContainer";

const Home = ({ marketplace, nft, account }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMarketPlaceItems = useCallback(async () => {
    const itemCountAsBigNumber = await marketplace.itemCount();
    let itemCount = Number(itemCountAsBigNumber);
    const items = [];

    while (itemCount--) {
      const marketplaceItem = await marketplace.items(itemCount);

      if (!marketplaceItem.sold) {
        const item = await createItem(marketplace, nft, marketplaceItem);
        items.push(item);
      }
    }

    setItems(items);
    setLoading(false);
  }, [marketplace, nft]);

  const buyMarketItem = useCallback(
    async (item) => {
      try {
        const transactionResponse = await marketplace.purchaseItem(
          item.itemId,
          {
            value: item.totalPrice,
          }
        );
        await transactionResponse.wait();
      } catch (error) {
        console.error("Purchase failed with error: ", error);
      }

      loadMarketPlaceItems();
    },
    [loadMarketPlaceItems, marketplace]
  );

  useEffect(() => {
    loadMarketPlaceItems();
  }, [loadMarketPlaceItems]);

  if (loading) {
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>;
  }

  return (
    <div className="flex justify-center">
      {items.length > 0 ? (
        <ItemCardContainer>
          {items.map((item) => {
            return (
              <ItemCard
                key={item.itemId}
                buyMarketItem={
                  item.seller.toLowerCase() !== account.toLowerCase()
                    ? buyMarketItem
                    : undefined
                }
                marketplace={marketplace}
                item={item}
                account={account}
              />
            );
          })}
        </ItemCardContainer>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  );
};

export default Home;
