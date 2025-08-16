import Image from "next/image";

const Preloader = () => {
  return (
    <div id="loader-wrapper">
      <div id="loader">
        {/* <div className="loader-inner"></div> */}
        <Image src="/images/loader.gif" alt="Loading..." width={200} height={150} />
      </div>
    </div>
  );
};

export default Preloader;
