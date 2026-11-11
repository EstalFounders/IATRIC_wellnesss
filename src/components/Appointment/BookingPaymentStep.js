import React from "react";
import { CircularProgress } from "@mui/material";
import { useLanguage } from "../../i18n/LanguageContext";
import { ConsultationButton } from "../Common/commonUi";
import PaymentModal from "./PaymentModal";
import styles from "./css/AppointmentModel.module.css";

/**
 * Step 4 of the booking sequence: secure payment.
 *
 * The appointment has already been created (PENDING) by the time this step
 * opens - `pendingPayment` carries the id/amount the backend answered with, so
 * nothing here changes the API contract. `PaymentModal` keeps owning the
 * Cashfree order + verification.
 *
 * The booking summary is deliberately not shown here: the patient reviews the
 * confirmed appointment details on the success screen (`/payment/thankyou`)
 * after the payment, together with the amount actually paid.
 */
const BookingPaymentStep = ({
  appointmentState,
  pendingPayment,
  isLoading,
  onPaymentDone,
  onBack,
  onBookAgain,
}) => {
  const { t } = useLanguage();

  // Only a fallback for the verify-only entry point, where the created
  // appointment's consultation type is not part of `pendingPayment`.
  const { consultationType } = appointmentState;

  return (
    <div>
      {pendingPayment ? (
        <PaymentModal
          appointmentId={pendingPayment.appointmentId}
          amount={pendingPayment.amount}
          consultationType={pendingPayment.consultationType || consultationType}
          autoVerifyOrderId={pendingPayment.autoVerifyOrderId || null}
          initialStatus={pendingPayment.initialStatus || null}
          payLabel={t("af.paySecurely")}
          onPaymentDone={onPaymentDone}
          onClose={onBookAgain}
        />
      ) : (
        // Booking is still in flight (POST /api/consultation) - the step is shown
        // right away so the patient sees progress instead of a frozen modal.
        <div className={styles.summaryHint} style={{ padding: "1.25rem 0" }}>
          <CircularProgress size={26} />
          <p className="mb-0 mt-2">{t("af.preparingPayment")}</p>
        </div>
      )}

      <p className={styles.summaryHint} style={{ marginTop: "1rem" }}>
        {t("af.detailsAfterPayment")}
      </p>

      <div className={styles.stepActions}>
        <ConsultationButton
          variant="outline"
          onClick={() => {
            if (!isLoading) onBack();
          }}
        >
          {t("af.back")}
        </ConsultationButton>
      </div>
    </div>
  );
};

export default BookingPaymentStep;
