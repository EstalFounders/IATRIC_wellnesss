import Head from "next/head";
import { Fragment, useEffect, useState } from "react";
import Preloader from "../src/components/Preloader";
import { animation } from "../src/utils";
import "../styles/globals.css";
import { NoSsr } from "@mui/material";
import { Chat } from "stream-chat-react";
import { ChatProvider, VideoProvider } from "@stream-io/video-react-sdk";
import "stream-chat-react/dist/css/index.css";
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
    setTimeout(() => {
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
      {loader && <Preloader />}
      <NoSsr>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Component {...props.pageProps} />
          </PersistGate>
        </Provider>
      </NoSsr>
    </Fragment>
  );
}

export default MyApp;
