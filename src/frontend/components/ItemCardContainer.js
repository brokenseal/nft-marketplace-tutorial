import { Row } from "react-bootstrap";

export const ItemCardContainer = ({ children }) => {
  return (
    <div className="px-5 container">
      <Row xs={1} md={4} lg={4} className="g-4 py-5">
        {children}
      </Row>
    </div>
  );
};
