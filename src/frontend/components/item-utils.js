export const createItem = async (marketplace, nft, item) => {
  const uri = await nft.tokenURI(item.itemId);
  const response = await fetch(uri);
  const metadata = await response.json();
  const totalPrice = await marketplace.getTotalPrice(item.itemId);

  return {
    ...item,
    ...metadata,
    totalPrice,
    uri,
  };
};
