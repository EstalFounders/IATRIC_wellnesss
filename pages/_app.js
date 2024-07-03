import Head from "next/head";
import { Fragment, useEffect, useState } from "react";
import Preloader from "../src/components/Preloader";
import { animation } from "../src/utils";
import "../styles/globals.css";
import { NoSsr } from "@mui/material";
import { Chat } from 'stream-chat-react';
import { ChatProvider, VideoProvider } from '@stream-io/video-react-sdk';
import 'stream-chat-react/dist/css/index.css';
import '../pages/meeting/meetingStyles.css'


function MyApp({ Component, pageProps }) {
  const [loader, setLoader] = useState(true);
  // const [clientReady, setClientReady] = useState(false);

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
        <title>Iatric Healthcare</title>
        <link
          rel="shortcut icon"
          href="images/favicon.ico"
          type="image/x-icon"
        />
        <link rel="icon" href="images/favicon.ico" type="image/x-icon"></link>
      </Head>
      {loader && <Preloader />}
      <NoSsr>
        <Component {...pageProps} />
      </NoSsr>
    </Fragment>
  );
}

export default MyApp;
