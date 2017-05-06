'use strict';

const twitter = require('twitter');
const axios = require('axios');
const config = require('config');

function tweet(text){
  var client = twitter({
    consumer_key: config.get('twitter.consumer_key'),
    consumer_secret: config.get('twitter.consumer_secret'),
    access_token_key: config.get('twitter.access_token_key'),
    access_token_secret: config.get('twitter.access_token_secret')
  });

  client.post('statuses/update', {status: text}, function(error, tweet, response) {
    if(error){
      console.error(error);
    }
  });
}

function getTodaysLastStarredRepo(){
  let username = config.get('github.username');

  return axios.get(`https://api.github.com/users/${username}/starred`, {
    headers: {'Accept': 'application/vnd.github.v3.star+json'}
  })
    .then(response => {
      let checkTime = new Date();
      checkTime.setMinutes(checkTime.getMinutes() - 1);

      return response.data.length
        && new Date(Date.parse(response.data[0].starred_at)) > checkTime
        ? response.data[0].repo
        : null;
    })
    .catch(error => {
      console.error(error);
    });
}

module.exports.run = (event, context) => {
  getTodaysLastStarredRepo()
    .then(repo => {
      if(repo){
        tweet(`Just starred on GitHub: ${repo.full_name}\n${repo.html_url}`);
        console.log(`tweeted ${repo.full_name}`);
      }
    });
};

if(require.main === module){
  module.exports.run();
}