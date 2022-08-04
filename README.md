# Team 0101

### Project Description
The general purpose of the website is to be a hub for all things cooking related that makes it easy to find recipes online. Our website consists of 6 main pages the first being the login page, followed by the home page, the pantry page, the search recipes page, the favorite recipe page, and the profile page. The website uses 4 tables stored in our psql database. The login page utilizes two of those tables the first of which stores user information like email, username, and password. The other table utilized stores session ids in order to keep track of users currently logged in. The pantry page allows you to add or remove items from your pantry. It utilizes a table that stores all of the users’ ingredients in an array to make calls to the api and also separates those ingredients into the 5 major food groups in order to fill the pantry page with information. The search recipes page utilizes axios to access the spoonacular api through the rapid api website in order to find recipes for the user based off of different search criteria. The favorite recipes page shows the recipes that have been marked favorite by the user
and stores them in one of the database tables. The profile page shows some of the user information.


### Architecture
<img src="./images/Architecture Plan.drawio (1).png">

### How to Get Cooking

### Run Recipeat Locally 
(Otherwise, view the website through heroku go to https://csci3308-recipeat.herokuapp.com/)

If you want to run this locally, you will have to clone this repository as well as download and install docker. In addition, you will have to sign up for the [RapidApi Spoonacular api](https://rapidapi.com/spoonacular/api/recipe-food-nutrition), and obtain an api. We have not tested this application with the regular Spoonacular api, however it may work just as fine. After opening up a terminal and navigating to the repository, you must add some environment variables and a javascript script that will configure the postgre sql database. In the parent directory you will add a file named .env that will contain the following:
```
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="pwd"
POSTGRES_DB="recipeat_db"
spoonacular_key=xxx
sessions_secret=xxx \\some long random string
```
Note that the spoonacular key (labeled xxx above) is dependent on your spoonacular api key. Be cautious of having limited api calls and possibly additional charges (our key's quota limit was reached multiple times although we were never charged having chosen the free plan). Also, you will need to add a file called dbConfig.js in the src directory which will contain the following:
```javascript
const dbConfig = {
	host: 'db',
	port: 5432,
	database: process.env.POSTGRES_DB,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD
};

exports.dbinfo = function() {
    return dbConfig;
}
```
This configures our database with the enviornment variables and prepares it for storing user information, pantry items, etc. You will also need to configure the heroku enviornment variable or api key if you want to run the website on your own heroku server. In order to host the website on heroku, you will need to access the api key on [heroku](https://id.heroku.com/login). If you only want to run it locally, you will still need the variable/key defined, so create a .env file in the heroku file with the following (the value does not matter if running locally):
```
HEROKU_API_KEY=xxx 
```

After setting enviornment variables, you can run the command 
```
docker-compose build
docker-compose up
```

to start a docker image that will run the website and tests. In order to view this website, go to [localhost port 3000](http://localhost:3000/). When you want to stop running the website, use the command

```
docker-compose down
```

To view the website through heroku go to https://csci3308-recipeat.herokuapp.com/
