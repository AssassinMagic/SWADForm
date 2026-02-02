const { OAuth2Client } = require('google-auth-library');
const http = require('http');
const url = require('url');
const destroyer = require('server-destroy');

// Load environment variables
require('dotenv').config({ path: '.env' });

const keys = {
  client_id: process.env.EMAIL_CLIENTID ? process.env.EMAIL_CLIENTID.trim() : '',
  client_secret: process.env.EMAIL_SECRET ? process.env.EMAIL_SECRET.trim() : '',
  redirect_uris: ['http://localhost:3000/oauth2callback'], 
};

console.log(`Using Client ID: ${keys.client_id}`);
console.log(`Using Client Secret (first 5 chars): ${keys.client_secret.substring(0, 5)}...`); 

if (!keys.client_id || !keys.client_secret) {
  console.error("Error: EMAIL_CLIENTID and EMAIL_SECRET must be set in your .env file.");
  process.exit(1);
}

const client = new OAuth2Client(
  keys.client_id,
  keys.client_secret,
  keys.redirect_uris[0]
);

const main = async () => {
  // Configured to use dynamic import for ES module compatibility
  let open;
  try {
      open = (await import('open')).default;
  } catch (e) {
      console.log('Open package not available, please manually open the url.');
  }

  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://mail.google.com/',
  });

  const server = http
    .createServer(async (req, res) => {
      try {
        if (req.url.indexOf('/oauth2callback') > -1) {
          const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
          res.end('Authentication successful! Please return to the console.');
          server.destroy();
          const { tokens } = await client.getToken(qs.get('code'));

          
          console.log('\n\nSUCCESS! Use this Refresh Token in your .env file:');
          console.log('====================================================');
          console.log(`EMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
          console.log('====================================================\n');
        }
      } catch (e) {
        console.error(e);
        res.end(e.toString());
        server.destroy();
      }
    })
    .listen(3000, () => {
      console.log(`\nopen the following url in your browser : \n\n${authorizeUrl}\n`);
      if (open) {
          open(authorizeUrl);
      }
    });

  destroyer(server);
};

main().catch(console.error);
