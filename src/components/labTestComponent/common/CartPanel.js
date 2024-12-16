import React, { useCallback, useEffect, useState } from "react";
import styles from "../css/CartPanel.module.css"; // CSS for the side panel
import cartEventEmitter from "../../../eventEmitter/CartEventEmitter";
import { AiFillDelete } from "react-icons/ai"; // For the delete icon
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { CiDiscount1 } from "react-icons/ci";
import { MdShoppingCart } from "react-icons/md";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { calculateTotalPrice} from "./CommonMethod";
import { Container } from "react-bootstrap";
import LabTestModel from "../modal/LabTestModel";
import BookingDetailsInput from "./BookingDetailsInput";
import Preloader from "../../Preloader";
import Image from "next/image";
import { RequestOtp } from "../../../layout/Component/RequestOtp";
import { OtpScreen } from "../../../layout/Component/OtpScreen";

const CartPanel = ({ isOpen, togglePanel, onUpdateCartItemCount }) => {
  const [name, setName] = useState()
  const [mobileNumber, setMobileNumber] = useState()
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("onlinePay"); // Initialize state
  const [cartItemsIds, setCartItemsIds] = useState([]);
  const [isProceed, setIsProceed] = useState(false);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [responseSuccess, setReponseSuccess] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  // Handler to update state
  const handlePaymentChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  useEffect(() => {
    // Listen for cart update events
    cartEventEmitter.on("cartUpdate", (item) => {
      setCartItems((prevItems) => [...prevItems, item]);
      setCartItemsIds((prevIds) => [...prevIds, item["healthCheckupData"]._id]);
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

  // Calculate the total price with discount if online payment is selected
  const totalPrice =
    paymentMethod === "onlinePay"
      ? calculateTotalPrice(cartItems) * 0.95 // Apply 5% discount
      : calculateTotalPrice(cartItems);

      const handleClose = useCallback(() => {
        setIsProceed(false);
        setError();
      }, [setIsProceed, setError]);

  const hanleProceed = () => {
    setIsProceed(true);
    setOtpRequested(true)
  };

  const handleOtpRequest = ({ name, mobileNumber }) => {
    console.log('testing', name, mobileNumber)
    if (cartItemsIds.length === 0) {
      setError("Please select a test package to book");
      return;
    }
    
    if (!name) {
      setError("Please fill all the fields");
      return;
    }

    setName(name)
    setMobileNumber(mobileNumber)
    setOtpRequested(false)
  }

  const handleBookTest = async () => {
    const body = {
      name,
      mobileNumber,
      paymentMethod,
      cartItemsIds,
      totalPrice,
    };

    try {
      setLoading(true);
      const response = await fetch("/api/bookLabTest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.success) {
        console.log("Booking successful:", result.booking);
        setReponseSuccess(true);
        setError(""); // Clear any errors if successful
      } else {
        setError(result.error || "Booking failed. Please try again.");
      }
    } catch (error) {
      setError("Server error. Please try again later.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (responseSuccess) {

      // Close the modal after 2 seconds
      setTimeout(() => {
        setFadeOut(false); // reset fadeOut state for the next time
        handleClose(); // Call parent function to fully close the modal
        setReponseSuccess(false);
      }, 2000);
    }
  }, [responseSuccess, handleClose]);

  return (
    <Container>
      <div className={`${styles.cartPanel} ${isOpen ? styles.open : ""}`}>
        <div className={styles.cartPanelHeader}>
          <div onClick={togglePanel} className={styles.closeButton}>
            X
          </div>
        </div>
        <div className={styles.cartItems}>
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <div key={index} className={`row ${styles.cartItem}`}>
                <div className="col col-md-1">
                  <PiShoppingCartSimpleBold size={30} className={styles.icon} />
                </div>
                <div className="col col-md-6">
                  <div className={`row ${styles.itemTitle}`}>
                    {item.healthCheckupData.title}
                  </div>
                  <div className={`row ${styles.itemPrice}`}>
                    ₹{item.healthCheckupData.price}
                  </div>
                </div>

                {/* Delete Button */}
                <div className="col d-flex align-items-center">
                  <div
                    className={`${styles.deleteButton}`}
                    onClick={() => handleDeleteItem(index)}
                  >
                    <AiFillDelete size={24} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyCartMessage}>Your cart is empty</div>
          )}
        </div>
        <div className={styles.bottomSection}>
          <div className={`row d-flex flex-row ${styles.discount}`}>
            <div className="col col-1">
              <CiDiscount1 size={20} />
            </div>
            <div className={styles.discountText}>
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
                  ₹ {totalPrice.toFixed(2)}
                </div>
                <div className="text-muted ml-1">{cartItems.length} tests</div>
              </div>
            </div>
            <div
              className={`clickable-div ${styles.proceedBtn}`}
              onClick={hanleProceed}
            >
              Proceed
            </div>
          </div>
        </div>
        <LabTestModel isOpen={isProceed}>
          {responseSuccess ? (
            <div className={styles.successMessage}>
              <Image src={"/images/success.png"} alt="Thank you" width={100} height={100} />
              <div className={`${styles.successText} mt-3`}>Thank you!</div>
              <div className={styles.successText}>
                Your Lab Test has been Booked.
              </div>
            </div>
          ) : otpRequested ? (
            // Display component when otpRequested is true and responseSuccess is false
            <RequestOtp onClose={handleClose} handleOtpRequest={handleOtpRequest} />
          ) : (
            // Display component when both otpRequested and responseSuccess are false
            <OtpScreen onClose={handleClose} handleSubmitOtp={handleBookTest} />
          )}
          <div className="text-danger text-center mb-2">{error}</div>
        </LabTestModel>
      </div>
      {loading ? <Preloader /> : ""}
    </Container>
  );
};

export default CartPanel;
