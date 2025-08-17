import Image from "next/image";

const Preloader = () => {
  return (
    <div id="loader-wrapper">
      <div id="loader">
        {/* <div className="loader-inner"></div> */}
        <Image src="/images/loader.gif" alt="Loading..." width={250} height={200} />
      </div>
    </div>
  );
};

export default Preloader;
