import Image from "next/image";
import { imageBlurDataUrl } from "../constant";
import { useEffect, useState } from "react";
import styles from "./Common/css/Preloader.module.css";

const Preloader = ({ show = true }) => {
  const [rendered, setRendered] = useState(show);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (show) {
      setRendered(true);
      setFading(false);
    } else {
      setFading(true);
      const t = setTimeout(() => setRendered(false), 250);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!rendered) return null;

  return (
    <div className={`${styles.overlay} ${fading ? styles.fadeOut : ""}`}>
      <Image src="/images/loader.gif" alt="Loading..." width={250} height={200} />
    </div>
  );
};

export default Preloader;
