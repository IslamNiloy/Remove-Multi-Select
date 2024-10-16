require('dotenv').config();
const express = require('express');
const request = require('request-promise-native');
const NodeCache = require('node-cache');
const session = require('express-session');
// const opn = require('open');
const app = express();

const PORT = 3000;

const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    throw new Error('Missing CLIENT_ID or CLIENT_SECRET environment variable.')
}

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Scopes for this app will default to `crm.objects.contacts.read`
// To request others, set the SCOPE environment variable instead
let SCOPES = ['crm.objects.contacts.read'];
if (process.env.SCOPE) {
    SCOPES = (process.env.SCOPE.split(/ |, ?|%20/)).join(' ');
}

// On successful install, users will be redirected to /oauth-callback
const REDIRECT_URI = process.env.REDIRECT_URI;
// const logWithDetails = (level, message, req) => {
//   const portalId = req.session.portalId || 'unknown';
//   const email = req.session.email || 'unknown';
//   logger.log({ level, message, portalId, email });
// };

const authUrl =
  'https://app.hubspot.com/oauth/authorize' +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` + // app's client ID
  `&scope=${encodeURIComponent(SCOPES)}` + // scopes being requested by the app
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // where to send the user after the consent page

exports.install =  (req, res) => {
  res.redirect(authUrl);
  console.log('===> Step 2: User is being prompted for consent by HubSpot');
  // logWithDetails('info', 'Redirected user to HubSpot OAuth URL for installation', req);
};




exports.oauthCallback = async (req, res) => {
  console.log('===> Step 3: Handling the request sent by the server');
  if (req.query.code) {
    console.log('       > Received an authorization token');

    const authCodeProof = {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code: req.query.code
    };

    // Step 4
    // Exchange the authorization code for an access token and refresh token
    console.log('===> Step 4: Exchanging authorization code for an access token and refresh token');
    const token = await exchangeForTokens(req.sessionID, authCodeProof);
    if (token.message) {
      return res.redirect(`/error?msg=${token.message}`);
    }

    res.redirect(`/`);
  }
};

//==========================================//
//   Exchanging Proof for an Access Token   //
//==========================================//

const exchangeForTokens = async (userId, exchangeProof) => {
  try {
    const responseBody = await request.post('https://api.hubapi.com/oauth/v1/token', {
      form: exchangeProof
    });
    // Usually, this token data should be persisted in a database and associated with
    // a user identity.
    const tokens = JSON.parse(responseBody);
    refreshTokenStore[userId] = tokens.refresh_token;
    accessTokenCache.set(userId, tokens.access_token, Math.round(tokens.expires_in * 0.75));

    console.log('       > Received an access token and refresh token');
    return tokens.access_token;
  } catch (e) {
    console.error(`       > Error exchanging ${exchangeProof.grant_type} for access token`);
    return JSON.parse(e.response.body);
  }
};

const refreshAccessToken = async (userId) => {
  const refreshTokenProof = {
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    refresh_token: refreshTokenStore[userId]
  };
  return await exchangeForTokens(userId, refreshTokenProof);
};

exports.getAccessToken = async (userId) => {
  if (!accessTokenCache.get(userId)) {
    console.log('Refreshing expired access token');
    await refreshAccessToken(userId);
  }
  return accessTokenCache.get(userId);
};

exports.isAuthorized = (userId) => {
  return refreshTokenStore[userId] ? true : false;
};

exports.error = (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h4>Error: ${req.query.msg}</h4>`);
  res.end();
};


exports.home = async (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hubxpert App</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #f1f1f1;
        }
        header {
          background-color: #004080;
          color: white;
          text-align: center;
          padding: 20px 0;
        }
        header .logo {
          width: 200px;
          margin-bottom: 10px;
        }
        header h1 {
          margin: 0;
          font-size: 2em;
        }
        main {
          flex: 1;
          padding: 20px;
          text-align: center;
        }
        .description {
          max-width: 600px;
          margin: 0 auto;
        }
        .description h2 {
          font-size: 2em;
          color: #004080;
        }
        .description p {
          font-size: 1.2em;
          color: #333;
        }
        footer {
          background-color: #f1f1f1;
          text-align: center;
          padding: 10px 0;
        }
        footer p {
          margin: 0;
          color: #555;
        }
        footer a {
          color: #004080;
          text-decoration: none;
        }
        .success {
          background-color: #64bae2;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          margin-bottom: 20px;
        }
        .success h2 {
          color: #fff;
          margin-top: 0;
        }
        .success p {
          color: #fff;
        }
        .install-button {
          padding: 10px 20px;
          font-size: 20px;
          font-weight: bold;
          background-color: #f2750e;
          border: none;
          border-radius: 5px;
          color: #fff;
          cursor: pointer;
          transition: transform 0.2s ease;
          text-decoration: none;
        }
        .install-button:hover {
          transform: scale(1.1);
        }
      </style>
    </head>
    <body>
      <header>
        <a href="https://www.hubxpert.com/"><img src="https://static.wixstatic.com/media/2369f3_e7a786f139044881883babb752b00212~mv2.png/v1/fill/w_388,h_154,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/2369f3_e7a786f139044881883babb752b00212~mv2.png" alt="Hubxpert Logo" class="logo"></a>
        <h1>Data Formatter App By HubXpert</h1>
      </header>
      <main>
        <section class="description">
          <h2>About Our App</h2>
          <p>Welcome to the Hubxpert App, your go-to solution for seamless HubSpot integration and data formatting. Our app provides custom workflow actions to format data, making your HubSpot experience more efficient and effective.</p>
        </section>
  `);
}