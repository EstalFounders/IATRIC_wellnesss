import Head from "next/head";
import { Fragment, useEffect, useState } from "react";
import Preloader from "../src/components/Preloader";
import { animation } from "../src/utils";
import "../styles/globals.css";
import { NoSsr } from "@mui/material";
import { wrapper } from "../src/store/store";
import { persistStore } from "redux-persist";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

function MyApp({ Component, pageProps, ...rest }) {
  const [loader, setLoader] = useState(true);
  const { store, props } = wrapper.useWrappedStore(rest);
  const persistor = persistStore(store);

  useEffect(() => {
    animation();
    const timer = setTimeout(() => {
      setLoader(false);
    }, 1000);

    // Clean up the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []); // <-- Added empty dependency array so this runs ONLY ONCE on mount

  return (
    <Fragment>
      <Head>
        <link
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Lato:400,700,900,900&display=swap"
          rel="stylesheet"
        />
        <title>Health Path</title>
        <link rel="shortcut icon" href="images/logo.png" type="image/x-icon" />
        <link rel="icon" href="images/logo.png" type="image/x-icon"></link>
      </Head>
      
      {/* 
        If Redux Persist is still loading/hydrating, we show the Preloader. 
        Once both Persist is ready AND our 1-second timer finishes, your app displays.
      */}
      <NoSsr>
        <Provider store={store}>
          <PersistGate loading={<Preloader />} persistor={persistor}>
            {loader ? <Preloader /> : <Component {...props.pageProps} />}
          </PersistGate>
        </Provider>
      </NoSsr>
    </Fragment>
  );
}

export default wrapper.withRedux(MyApp);