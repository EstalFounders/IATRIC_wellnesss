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
import { LanguageProvider } from "../src/i18n/LanguageContext";
import LanguageToggle from "../src/components/Common/LanguageToggle";
import SeoMetadata from "../src/marketing/components/SeoMetadata";
import PageStructuredData from "../src/components/Common/PageStructuredData";

function MyApp({ Component, pageProps, ...rest }) {
  const [loader, setLoader] = useState(true);
  const { store, props } = wrapper.useWrappedStore(rest);
  const persistor = persistStore(store);

  useEffect(() => {
    animation();
    const timer = setTimeout(() => {
      setLoader(false);
    }, 1000);
  });

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
      {/* Rendered outside <NoSsr>/<PersistGate> so the tags are in the SSR HTML */}
      <SeoMetadata metadata={pageProps?.seoMetadata} />
      {/* Same reason: JSON-LD has to be in the HTML, not added after hydration. */}
      <PageStructuredData />
      {loader && <Preloader />}
      <NoSsr>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <LanguageProvider>
              <Component {...props.pageProps} />
              <SeoMetadata metadata={pageProps?.seoMetadata} />
              <LanguageToggle />
            </LanguageProvider>
          </PersistGate>
        </Provider>
      </NoSsr>
    </Fragment>
  );
}

export default MyApp;
