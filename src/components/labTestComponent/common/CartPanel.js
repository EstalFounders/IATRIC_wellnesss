import React, { useEffect, useState } from "react";
import styles from "../css/CartPanel.module.css"; // CSS for the side panel
import cartEventEmitter from "../../../eventEmitter/CartEventEmitter";
import { AiFillDelete } from "react-icons/ai"; // For the delete icon
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { CiDiscount1 } from "react-icons/ci";
import { MdShoppingCart } from "react-icons/md";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { calculateTotalPrice } from "./CommonMethod";

const CartPanel = ({ isOpen, togglePanel, onUpdateCartItemCount }) => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("onlinePay"); // Initialize state

  // Handler to update state
  const handlePaymentChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  useEffect(() => {
    // Listen for cart update events
    cartEventEmitter.on("cartUpdate", (item) => {
      setCartItems((prevItems) => [...prevItems, item]);
    });
    // Update parent with the cart item count
    if (onUpdateCartItemCount) {
      onUpdateCartItemCount(cartItems.length);
    }

    // Clean up event listener
    return () => {
      cartEventEmitter.removeAllListeners("cartUpdate");
    };
  }, [cartItems, onUpdateCartItemCount]);


  // Function to handle deleting an item
  const handleDeleteItem = (indexToDelete) => {
    const updatedCartItems = cartItems.filter(
      (_, index) => index !== indexToDelete
    );
    setCartItems(updatedCartItems); // Update the state with the new array

    // Notify parent about cart item count update
    if (onUpdateCartItemCount) {
      onUpdateCartItemCount(updatedCartItems.length);
    }
  };

  return (
    <div className={`${styles.cartPanel} ${isOpen ? styles.open : ""}`}>
      <div className={styles.cartPanelHeader}>
        <button onClick={togglePanel} className={styles.closeButton}>
          X
        </button>
      </div>
      <div className={styles.cartItems}>
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <div key={index} className={`row ${styles.cartItem}`}>
              <div className="col col-md-1">
                <PiShoppingCartSimpleBold size={30} className={styles.icon} />
              </div>
               {console.log(item, 'item in cart panel')} 
              <div className="col col-md-6">
                <div className={`row ${styles.itemTitle}`}>{item.healthCheckupData.title}</div>
                <div className={`row ${styles.itemPrice}`}>
                  ₹{item.healthCheckupData.price}
                </div>
              </div>

              {/* Delete Button */}
              <div className="col d-flex align-items-center">
                <button
                  className={`${styles.deleteButton}`}
                  onClick={() => handleDeleteItem(index)}
                >
                  <AiFillDelete size={24} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={`${styles.emptyCartMessage}`}>Your cart is empty</div>
        )}
      </div>
      <div className={styles.bottomSection}>
        <div className={`row ${styles.discount}`}>
          <div className="col col-1">
            <CiDiscount1 size={20} />
          </div>
          <div className={`col ${styles.discountText}`}>
            Get 5% OFF on Online Payment
          </div>
        </div>
        <div className="col-12 mb-3 mt-4">
          <label className="d-flex align-items-center justify-content-between p-3 border rounded">
            <span>Online Pay</span>
            <input
              type="radio"
              name="paymentMethod"
              value="onlinePay"
              checked={paymentMethod === "onlinePay"}
              onChange={handlePaymentChange}
            />
          </label>
        </div>

        {/* Pay Later Option */}
        <div className="col-12 mb-3">
          <label className="d-flex align-items-center justify-content-between p-3 border rounded">
            <span>Pay Later</span>
            <input
              type="radio"
              name="paymentMethod"
              value="payLater"
              checked={paymentMethod === "payLater"}
              onChange={handlePaymentChange}
            />
          </label>
        </div>
        <div className="row align-items-center justify-content-between mx-1">
          <div className="col-auto d-flex align-items-center">
            <div className={`p-2 rounded mr-2 ${styles.cartIcon}`}>
              <HiOutlineShoppingCart />
            </div>
            <div className="ms-3">
              <div className="fw-bold text-success">
                ₹ {calculateTotalPrice(cartItems)}
              </div>
              <div className="text-muted ml-1">{cartItems.length} tests</div>
            </div>
          </div>
          <div className={`button ${styles.proceedBtn}`}>Proceed</div>
        </div>
      </div>
    </div>
  );
};

export default CartPanel;
