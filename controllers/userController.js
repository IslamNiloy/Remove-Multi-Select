const {getAccessToken,isAuthorized} = require('./hubspotController')
const request = require('request-promise-native');
exports.get_all_contact =  async (req, res) => {
    if (isAuthorized(req.sessionID)) {
      const accessToken = await getAccessToken(req.sessionID);
      try {
        const headers = {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        };
        const result = await request.get('https://api.hubapi.com/contacts/v1/lists/all/contacts/all?count=1', {
          headers: headers
        });
        res.json(result)
      } catch (e) {
        console.error('  > Unable to retrieve contact:');
        res.json(e.response);
      }
    } else {
      return 0;
    }
  };


