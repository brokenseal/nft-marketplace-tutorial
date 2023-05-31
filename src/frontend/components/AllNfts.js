import { useCallback, useEffect, useState } from "react";
import { createItem } from "./item-utils";
import { ItemCard } from "./ItemCard";
import { ItemCardContainer } from "./ItemCardContainer";

export const AllNfts = ({ marketplace, nft, account }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const loadItems = useCallback(async () => {
    const tokenCount = await nft.tokenCount();
    let tokenCountAsNumber = Number(tokenCount);
    let items = [];

    while (tokenCountAsNumber--) {
      if (!!account) {
        const owner = await nft.ownerOf(tokenCountAsNumber);

        if (account.toLowerCase() !== owner.toLowerCase()) {
          continue;
        }
      }

      try {
        const marketplaceItem = await marketplace.items(tokenCountAsNumber);
        const item = await createItem(marketplace, nft, marketplaceItem);

        items.push(item);
      } catch (error) {
        console.error(
          `Unable to retrieve URI for NFT with token id ${tokenCountAsNumber}`,
          error
        );
      }
    }

    setItems(items);
    setLoading(false);
  }, [nft, account, marketplace]);

  useEffect(() => loadItems(), [loadItems]);

  return (
    <div>
      {!account && <h2>All NFTs</h2>}
      {!!account && <h2>My NFTs</h2>}
      {loading && "Loading..."}
      {items.length === 0 && "No items found"}
      {items.length !== 0 && (
        <ItemCardContainer>
          {items.map((item) => (
            <ItemCard key={item.itemId} item={item} account={account} />
          ))}
        </ItemCardContainer>
      )}
    </div>
  );
};
