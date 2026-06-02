import Image from "next/image";
import styles from "./Common/css/Preloader.module.css";

const Preloader = () => {
  return (
    <div className={styles.overlay}>
      <Image src="/images/loader.gif" alt="Loading..." width={250} height={200} />
    </div>
  );
};

export default Preloader;
