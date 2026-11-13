import Head from "next/head";
import { Fragment, useEffect, useMemo, useState } from "react";
import Preloader from "../src/components/Preloader";
import { animation, scrollPageToTop } from "../src/utils";
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
import GoogleAnalytics from "../src/components/Common/GoogleAnalytics";
import ClientErrorReporter from "../src/components/Common/ClientErrorReporter";
import ErrorBoundary from "../src/components/Common/ErrorBoundary";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// TT Ramillas is the only brand typeface. This theme makes every MUI component
// (Dialogs, TextFields, Buttons, MenuItems, ...) inherit it instead of Roboto.
const brandTheme = createTheme({
  typography: { fontFamily: '"TT Ramillas", serif' },
});

function MyApp({ Component, pageProps, router, ...rest }) {
  const [loader, setLoader] = useState(true);
  // `useWrappedStore` reads the page props off the object it is given; it used to
  // receive `...rest`, from which `pageProps` had already been destructured away.
  // The result was that `props.pageProps` was always undefined, so every page got
  // *no* props - including `pages/_error.js`, which could not read its statusCode.
  const { store, props } = wrapper.useWrappedStore({ ...rest, pageProps });
  // persistStore() registers listeners and starts rehydrating: running it on every
  // render created one persistor per state change (and leaked the old ones).
  const persistor = useMemo(() => persistStore(store), [store]);

  // The meeting room is a standalone, full-screen call UI. Its control bar sits in
  // the bottom-right corner on phones - exactly where the floating widget (fixed,
  // right/bottom 10px) renders - so the widget would intercept the taps meant for
  // the last controls ("Record", "End Call"). The room has no header/footer, so the
  // language + support widget is dropped there entirely.
  const isMeetingRoom =
    typeof router?.pathname === "string" && router.pathname.startsWith("/meeting/");

  // Used to run after *every* render (the effect had no dependency list), so each
  // state change cleared and re-armed the 1s timer - the preloader only ever
  // disappeared once nothing else re-rendered. Both calls are one-shot boot work.
  useEffect(() => {
    animation();
    const timer = setTimeout(() => {
      setLoader(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // A client-side navigation must start at the top of the new page. Next.js does
  // that for us with window.scrollTo(), which is a no-op on phones because there
  // <body> is the page scroller (see scrollPageToTop) - so without this the next
  // page kept the previous scroll offset. Links that carry a #hash are skipped:
  // those are deep links and the target page scrolls the anchor into view itself.
  useEffect(() => {
    const handleRouteChangeComplete = (url) => {
      if (typeof url !== "string" || url.includes("#")) return;
      scrollPageToTop();
    };
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () =>
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
  }, [router.events]);

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
      {/* GA4 (gtag.js). Kept outside <NoSsr> like the tags above so the loader
          starts with the page instead of waiting for hydration. */}
      <GoogleAnalytics />
      {/* Window `error` / `unhandledrejection` / Next's `routeChangeError`. Renders
          nothing; mounted here so a crash on any page is reported. */}
      <ClientErrorReporter />
      {loader && <Preloader />}
      <NoSsr>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <LanguageProvider>
              <ThemeProvider theme={brandTheme}>
                {/* A boundary keeps the app shell alive when one page throws, and
                    the `key` remounts it on navigation so the next page still
                    has a chance to render. */}
                <ErrorBoundary key={router.pathname}>
                  <Component {...props.pageProps} />
                </ErrorBoundary>
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
