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
import { ThemeProvider, createTheme } from "@mui/material/styles";

// TT Ramillas is the only brand typeface. This theme makes every MUI component
// (Dialogs, TextFields, Buttons, MenuItems, ...) inherit it instead of Roboto.
const brandTheme = createTheme({
  typography: { fontFamily: '"TT Ramillas", serif' },
});

function MyApp({ Component, pageProps, router, ...rest }) {
  const [loader, setLoader] = useState(true);
  const { store, props } = wrapper.useWrappedStore(rest);
  const persistor = persistStore(store);

  // The meeting room is a standalone, full-screen call UI. Its control bar sits in
  // the bottom-right corner on phones - exactly where the floating widget (fixed,
  // right/bottom 10px) renders - so the widget would intercept the taps meant for
  // the last controls ("Record", "End Call"). The room has no header/footer, so the
  // language + support widget is dropped there entirely.
  const isMeetingRoom =
    typeof router?.pathname === "string" && router.pathname.startsWith("/meeting/");

  useEffect(() => {
    animation();
    const timer = setTimeout(() => {
      setLoader(false);
    }, 1000);
  });

  return (
    <Fragment>
      <Head>
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
              <ThemeProvider theme={brandTheme}>
                <Component {...props.pageProps} />
                <SeoMetadata metadata={pageProps?.seoMetadata} />
                {!isMeetingRoom && <LanguageToggle />}
              </ThemeProvider>
            </LanguageProvider>
          </PersistGate>
        </Provider>
      </NoSsr>
    </Fragment>
  );
}

export default MyApp;
