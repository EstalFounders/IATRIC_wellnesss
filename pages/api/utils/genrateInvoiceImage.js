import styles from '../css/GenerateInvoiceImageCss.Module.css';    

export const generateInvoiceImage = (appointment) => {
    const {
        patientName,
        address,
        phone,
        invoiceNo,
        date,
        items,
        subtotal,
        gst,
        discount,
        freight,
        tax,
        total,
      } = data;
    
      return (
        <div className={styles.invoiceContainer}>
          <div className={styles.header}>
            <div className={styles.logoArea}>
              <img src="/images/FinalLetterhead.png" alt="Logo" />
            </div>
            <div className={styles.headerText}>
              <h1>INVOICE</h1>
            </div>
          </div>
    
          <div className={styles.addressBlock}>
            <div>
              <strong>BILL TO:</strong>
              <p><b>Name:</b> {patientName}</p>
              <p><b>Address:</b> {address}</p>
              <p><b>Contact:</b> {phone}</p>
            </div>
            <div>
              <strong>FROM:</strong>
              <p>HEALTHPATH</p>
              <p>F-33 RIGROSS COMPLEX</p>
              <p>C, BLOCK SECTOR 57</p>
              <p>GURGAON, HARYANA</p>
              <p>CONTACT: +91 84485 59925</p>
              <p>GSTIN: XXXXXXXXXXXXX</p>
            </div>
            <div>
              <p><strong>Invoice No:</strong> {invoiceNo}</p>
              <p><strong>Date:</strong> {date}</p>
            </div>
          </div>
    
          <table className={styles.itemTable}>
            <thead>
              <tr>
                <th>S.NO.</th>
                <th>Description</th>
                <th>HSN</th>
                <th>QTY</th>
                <th>DISCOUNT</th>
                <th>PRICE</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{item.description}</td>
                  <td>{item.hsn}</td>
                  <td>{item.qty}</td>
                  <td>{item.discount}</td>
                  <td>₹ {item.price}</td>
                  <td>₹ {item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
    
          <div className={styles.summary}>
            <div>
              <p>Subtotal: ₹ {subtotal}</p>
              <p>GST: ₹ {gst}</p>
              <p>Discount: ₹ {discount}</p>
              <p>Freight: ₹ {freight}</p>
              <p>Tax: ₹ {tax}</p>
            </div>
            <div className={styles.totalLine}>
              <strong>TOTAL: ₹ {total}</strong>
            </div>
          </div>
    
          <div className={styles.terms}>
            <p><strong>TOTAL IN WORDS:</strong> One Hundred Only</p>
            <ul>
              <li>INTEREST 18% P.A. WILL BE CHARGED IF PAYMENT IS NOT MADE WITHIN STIPULATED TIME.</li>
              <li>ALL DISPUTES SUBJECTED TO GURGAON JURISDICTION ONLY.</li>
              <li>THIS IS A COMPUTER GENERATED INVOICE. NO SIGNATURE REQUIRED.</li>
            </ul>
          </div>
    
          <div className={styles.footer}>
            <p><strong>Thank you!</strong><br />TTANSHE HEALTH PATH PVT. LTD</p>
            <p>
              <strong>Contact:</strong> +91 84485 59925<br />
              <strong>www.healthpath.co.in</strong><br />
              <strong>customercare@healthpath.co.in</strong>
            </p>
          </div>
        </div>
      );  
}