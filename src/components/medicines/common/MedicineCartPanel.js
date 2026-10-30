import React, { useCallback, useEffect, useState } from "react";
import styles from "../../labTestComponent/css/CartPanel.module.css"; // CSS for the side panel
import cartEventEmitter from "../../../eventEmitter/CartEventEmitter";
import { AiFillDelete } from "react-icons/ai"; // For the delete icon
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { CiDiscount1 } from "react-icons/ci";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { Container } from "react-bootstrap";
import Preloader from "../../Preloader";
import Image from "next/image";
import { RequestOtp } from "../../../layout/Component/RequestOtp";
import { OtpScreen } from "../../../layout/Component/OtpScreen";
import {
  discount,
  eventEmitter,
  medicine_discount,
  price_symbol,
  imageBlurDataUrl
} from "../../../constant";
import LabTestModel from "../../labTestComponent/modal/LabTestModel";
import {
  calculateTotalPrice,
  getMedicineCartItems,
  setMedicineCartItems,
} from "./CommonMethod";
import { useDispatch, useSelector } from "react-redux";

const MedicineCartPanel = ({
  isOpen,
  togglePanel,
  cartItem,
  onUpdateCartItemCount,
}) => {
  const [name, setName] = useState();
  const [mobileNumber, setMobileNumber] = useState();
  const [cartItems, setCartItems] = useState(cartItem);
  const [paymentMethod, setPaymentMethod] = useState("onlinePay"); // Initialize state
  const [cartItemsIds, setCartItemsIds] = useState([]);
  const [isProceed, setIsProceed] = useState(false);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [responseSuccess, setReponseSuccess] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const dispatch = useDispatch();

  // Handler to update state
  const handlePaymentChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  useEffect(() => {
    const handler = (item) => {
      const medicine = item.medicine;

      setCartItems((prevItems) => {
        const updatedItems = [...prevItems, medicine];
        setMedicineCartItems(updatedItems); // ✅ Store in localStorage
        return updatedItems;
      });

      setCartItemsIds((prevIds) => [...prevIds, medicine._id]);

      if (onUpdateCartItemCount) {
        onUpdateCartItemCount((prev) => prev + 1);
      }
    };

    cartEventEmitter.on(eventEmitter.medicineCartEventEmitter, handler);

    return () => {
      cartEventEmitter.off(eventEmitter.medicineCartEventEmitter, handler);
    };
  }, []);

  // Function to handle deleting an item
  const handleDeleteItem = (indexToDelete) => {
    const updatedCartItems = cartItems.filter(
      (_, index) => index !== indexToDelete
    );
    setCartItems(updatedCartItems);
    setMedicineCartItems(updatedCartItems); // ✅ Update localStorage too

    if (onUpdateCartItemCount) {
      onUpdateCartItemCount(updatedCartItems.length);
    }
  };

  // Calculate the total price with discount if online payment is selected
  const totalPrice =
    paymentMethod === "onlinePay"
      ? calculateTotalPrice(cartItems) * { medicine_discount } // Apply 5% discount
      : calculateTotalPrice(cartItems);

  const handleClose = useCallback(() => {
    setIsProceed(false);
    setError();
  }, [setIsProceed, setError]);

  const hanleProceed = () => {
    setIsProceed(true);
    setOtpRequested(true);
  };

  const handleOtpRequest = ({ name, mobileNumber }) => {
    console.log("testing", name, mobileNumber);
    if (cartItemsIds.length === 0) {
      setError("Please select a test package to book");
      return;
    }

    if (!name) {
      setError("Please fill all the fields");
      return;
    }

    setName(name);
    setMobileNumber(mobileNumber);
    setOtpRequested(false);
  };

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
        setCartItems([]);
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
        handleClose(); // Call parent function to fully close the modal
        setReponseSuccess(false);
      }, 8000);
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
                  <div className={`row ${styles.itemTitle}`}>{item.title}</div>
                  <div className={`row ${styles.itemPrice}`}>
                    {price_symbol}
                    {item.price}
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
                  {price_symbol} {totalPrice}
                </div>
                <div className="text-muted ml-1">{cartItems.length} tests</div>
              </div>
            </div>
            <div
              className={`clickable-div labtest-btn mr-2 px-4 py-2`}
              onClick={hanleProceed}
            >
              Proceed
            </div>
          </div>
        </div>
        <LabTestModel isOpen={isProceed}>
          {responseSuccess ? (
            <div className={styles.successMessage}>
              <Image
                placeholder="blur"
                blurDataURL={imageBlurDataUrl}
                src={"/images/success.png"}
                alt="Thank you"
                width={100}
                height={100}
              />
              <div className={`${styles.successText} mt-3`}>Thank you!</div>
              <div className={styles.successText}>
                Your Lab Test has been Booked.
              </div>
            </div>
          ) : otpRequested ? (
            // Display component when otpRequested is true and responseSuccess is false
            <RequestOtp
              onClose={handleClose}
              handleOtpRequest={handleOtpRequest}
            />
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

export default MedicineCartPanel;
