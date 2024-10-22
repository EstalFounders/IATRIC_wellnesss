import { useState } from "react";
import { HiOutlinePlus, HiOutlineMinus } from "react-icons/hi";
import styles from "../CSS/FAQ.module.css"; // Importing the CSS module

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.faqItem}>
      <div
        className={styles.faqQuestion}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <span>{isOpen ? <HiOutlineMinus /> : <HiOutlinePlus />}</span>
      </div>
      {isOpen && (
        <div className={styles.faqAnswer}>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const faqData = [
    {
      question: "Why should you choose Orange Health Labs over other pathology labs?",
      answer: "Orange Health Labs stands out as the fastest diagnostic lab in town...",
    },
    {
      question: "How does home collection within 60 minutes work?",
      answer: "We guarantee home pathology services within just 60 minutes...",
    },
    {
      question: "How are reports delivered?",
      answer: "You will receive your reports via WhatsApp within 6 hours...",
    },
    {
      question: "What are the modes of payment available for booking?",
      answer: "We offer UPI, Mastercard, Visa card, Debit cards, and Credit cards...",
    },
    {
      question: "Can I cancel a test booking?",
      answer: "For any queries about canceling a test booking, just chat with us...",
    },
    {
      question: "Can I reschedule a booked test?",
      answer: "If the need to reschedule a booked test arises, simply chat with us...",
    },
  ];

  return (
    <div className={styles.faqContainer}>
      <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
      {faqData.map((item, index) => (
        <FAQItem key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
};

export default FAQ;
