/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
require('dotenv').config()
//Create Database Connection
var dbimport = require('./dbConfig.js')
var pgp = require('pg-promise')();

const dbConfig_dev = dbimport.dbinfo();
const isProd = process.env.NODE_ENV === 'production';
const dbConfig = isProd ? process.env.DATABASE_URL : dbConfig_dev;
if (isProd) {
	app.set('trust proxy', 1)
	pgp.pg.defaults.ssl = {rejectUnauthorized: false};
}

const db = pgp(dbConfig);

//session management
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const MemoryStore = require('memorystore')(sessions);

const axios = require("axios");

const expiry = 1000*60*60*3; //three hours
app.use(sessions({
	secret:	`${process.env.sessions_secret}`,
	store: new MemoryStore({
		checkPeriod: expiry
	}),
	saveUninitialized: true,
	cookie: {maxAge: expiry, secure: isProd},
	resave: false
}));

app.use(cookieParser());

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our Resources directory

//any additional functions that are not endpoints should go here
var serverHelper = require('./serverHelpers.js');

/*Page requests*/
// login page
app.get('/', (req, res) => {
	var session = req.session;
	if (session.sessionID)
	{
		return res.redirect('/home')
	}
	res.render('pages/login',{
		local_css:"login.css",
		my_title:"Login Page",
        local_js:"login.js"
	});
});

app.post('/register', (req,res) => {
	var user_name = req.body.usrName;
	var email = req.body.usrEmail;
	var pass = req.body.psw;
	var randomID = serverHelper.rnd(32);
	var insert_statement = `INSERT INTO user_info (username, email, pass) VALUES ('${user_name}','${email}', crypt('${pass}', gen_salt('bf')));`
	var session_insert = `INSERT INTO session_ids (session_id, username) VALUES ('${randomID}','${user_name}');`
	var session = req.session;
	var create_pantry = `INSERT INTO pantrys (username, ingredients, meats, carbs, vegs, dairy, fruit) VALUES ('${user_name}', null, null, null, null, null, null);`
	var create_favorites = `INSERT INTO favorites (username, recipe_ids) VALUES ('${user_name}', null);`
	db.task('register', task => {
		return task.batch([
			task.any(insert_statement),
			task.any(session_insert),
			task.any(create_pantry),
			task.any(create_favorites),
		]);
	})
	.then( () => {
		//create session
		session.sessionID = randomID; //saves as cookie
		setTimeout(() => {
			db.any(`DELETE FROM session_ids WHERE session_id = '${randomID}';`)
		}, expiry);
		return res.redirect('/home');
	})
	.catch(err => {
		console.log('error', err);
		return res.redirect('/');
	})
});

app.post('/login', (req,res) =>{
	var user_name = req.body.user_name;
	var pass = req.body.pass;
	var auth_query = `SELECT COUNT(*) FROM user_info WHERE username = '${user_name}' AND pass = crypt('${pass}', pass);`
	var delete_q = `DELETE FROM session_ids WHERE username = '${user_name}';`
	var session = req.session;
	db.task('auth', task => {
		return task.batch([
			task.any(auth_query),
			task.any(delete_q)
		]);
	})
	.then(info => {
		if(info[0][0].count === '1') //account exists
		{
			var randomID = serverHelper.rnd(32);
			db.any(`INSERT INTO session_ids (session_id, username) VALUES ('${randomID}','${user_name}');`)
				.then( () => {
					session.sessionID = randomID;
					setTimeout(() => {
						db.any(`DELETE FROM session_ids WHERE session_id = '${randomID}';`)
					}, expiry);
					return res.redirect('/home');
				})
				.catch(err => {
					console.log(err);
					return res.redirect('/');
				})
		}
		else //account dne
		{
			return res.redirect('/');
		}
	})
	.catch(err => {
		console.log('error', err);
	})
});

app.get('/home', (req, res) => {
	var sessionID = req.session.sessionID
	var username = ''
	var loggedIn = false;
	if (sessionID) {
		var session_query = `SELECT username FROM session_ids WHERE session_id = '${sessionID}';`
		/* probably better to use as subquery so as to avoid nested requests */
		db.any(session_query)
		.then(session => {
			if (session[0]){ //session exists, 
				loggedIn = true;
				username = session[0].username;
				/*do any additional queries here in the current setup, modify to follow above comment in future
				 as if client already has sessionID, then the database must as well, only case where this isn't true is if
				 client is passing in fake ids*/
				res.render('pages/home',{
					local_css:"home.css",
					my_title:"Home",
					local_js:"home.js",
					logged: loggedIn
					/*add any extra needed variables*/
				});
			}
		})
		.catch(err => {
			console.log(err)
			res.render('pages/home',{
				local_css:"home.css",
				my_title:"Home",
				local_js:"home.js",
				logged: loggedIn
				/*add any extra needed variables*/
			});
		})
	}
	else {
		//do queries when user isn't logged in 
		res.render('pages/home',{
			local_css:"home.css",
			my_title:"Home",
			local_js:"home.js",
			logged: loggedIn
			/*add any extra needed variables*/
		});
	}
});

app.get('/pantry', function(req, res){
	var sessionID = req.session.sessionID;
	if (sessionID){ //session exists locally
		var sessionQuery = `SELECT username FROM session_ids WHERE session_id = '${sessionID}';`
		db.any(sessionQuery)
		.then(session => {
			if (session[0]) return session[0].username //session exists in database
			else throw new Error('Username Not Found') //session doesn't exist in database
		}).then(username => {
			var ingrQuery = `SELECT * FROM pantrys WHERE username = '${username}';`
		    return db.any(ingrQuery)
		}).then(ingredients => {
			res.render('pages/pantry',{
				local_css:"pantry.css",
				my_title:"Pantry",
				local_js:"pantry.js",
				logged: true,
				food: ingredients[0]
			});
		}).catch(error =>{
			console.log(error)
			var loggedIn = true;
			if(error.message === 'Username Not Found') loggedIn = false;
			res.render('pages/pantry',{
				local_css:"pantry.css",
				my_title:"Pantry",
				local_js:"pantry.js",
				logged: loggedIn,
				food: ''
			});
		})
	}
	else {
		res.render('pages/pantry',{
			local_css:"pantry.css",
			my_title:"Pantry",
			local_js:"pantry.js",
			logged: false,
			food: ''
		});
	}
});

app.post('/add', (req,res) => {
	var sessionID = req.session.sessionID;
	if (sessionID){ //session exists locally
		var sessionQuery = `SELECT username FROM session_ids WHERE session_id = '${sessionID}';`
		db.any(sessionQuery)
		.then(session => {
			if (session[0]) return session[0].username //session exists in database
			else throw new Error('Username Not Found') //session doesn't exist in database
		}).then(username => {
			var queries = '';
			if (req.body['pantry add'][0]){
				queries += `UPDATE pantrys SET meats = array_append(meats, '${req.body['pantry add'][0]}') WHERE username = '${username}';`
				queries += `UPDATE pantrys SET ingredients = array_append(ingredients, '${req.body['pantry add'][0]}') WHERE username = '${username}';`
			}
			if (req.body['pantry add'][1]){
				queries += `UPDATE pantrys SET carbs = array_append(carbs, '${req.body['pantry add'][1]}') WHERE username = '${username}';`
				queries += `UPDATE pantrys SET ingredients = array_append(ingredients, '${req.body['pantry add'][1]}') WHERE username = '${username}';`
			}
			if (req.body['pantry add'][2]){
				queries += `UPDATE pantrys SET vegs = array_append(vegs, '${req.body['pantry add'][2]}') WHERE username = '${username}';`
				queries += `UPDATE pantrys SET ingredients = array_append(ingredients, '${req.body['pantry add'][2]}') WHERE username = '${username}';`
			}
			if (req.body['pantry add'][3]){
				queries += `UPDATE pantrys SET dairy = array_append(dairy, '${req.body['pantry add'][3]}') WHERE username = '${username}';`
				queries += `UPDATE pantrys SET ingredients = array_append(ingredients, '${req.body['pantry add'][3]}') WHERE username = '${username}';`
			}
			if (req.body['pantry add'][4]){
				queries += `UPDATE pantrys SET fruit = array_append(fruit, '${req.body['pantry add'][4]}') WHERE username = '${username}';`
				queries += `UPDATE pantrys SET ingredients = array_append(ingredients, '${req.body['pantry add'][4]}') WHERE username = '${username}';`
			}
		    return db.any(queries)
		}).then(()=> {
			res.redirect('/pantry')
		}).catch(error =>{
			console.log(error)
			var loggedIn = true;
			if(error.message === 'Username Not Found') loggedIn = false;
			res.render('pages/pantry',{
				local_css:"pantry.css",
				my_title:"Pantry",
				local_js:"pantry.js",
				logged: loggedIn,
				food: ''
			});
		})
	}
	else {
		res.render('pages/pantry',{
			local_css:"pantry.css",
			my_title:"Pantry",
			local_js:"pantry.js",
			logged: false,
			food: ''
		});
	}
});

app.post('/remove', (req,res) => {
	var sessionID = req.session.sessionID;
	if (sessionID){ //session exists locally
		var sessionQuery = `SELECT username FROM session_ids WHERE session_id = '${sessionID}';`
		db.any(sessionQuery)
		.then(session => {
			if (session[0]) return session[0].username //session exists in database
			else throw new Error('Username Not Found') //session doesn't exist in database
		}).then(username => {
			var queries = '';
			if (req.body['pantry add'][0]){
				queries += `UPDATE pantrys SET meats = array_remove(meats, '${req.body['pantry add'][0]}') WHERE username = '${username}';`
				queries += `UPDATE pantrys SET ingredients = array_remove(ingredients, '${req.body['pantry add'][0]}') WHERE username = '${username}';`
			}
			if (req.body['pantry add'][1]){
				queries += `UPDATE pantrys SET carbs = array_remove(carbs, '${req.body['pantry add'][1]}') WHERE username = '${username}';`
				queries += `UPDATE pantrys SET ingredients = array_remove(ingredients, '${req.body['pantry add'][1]}') WHERE username = '${username}';`
			}
			if (req.body['pantry add'][2]){
				queries += `UPDATE pantrys SET vegs = array_remove(vegs, '${req.body['pantry add'][2]}') WHERE username = '${username}';`
				queries += `UPDATE pantrys SET ingredients = array_remove(ingredients, '${req.body['pantry add'][2]}') WHERE username = '${username}';`
			}
			if (req.body['pantry add'][3]){
				queries += `UPDATE pantrys SET dairy = array_remove(dairy, '${req.body['pantry add'][3]}') WHERE username = '${username}';`
				queries += `UPDATE pantrys SET ingredients = array_remove(ingredients, '${req.body['pantry add'][3]}') WHERE username = '${username}';`
			}
			if (req.body['pantry add'][4]){
				queries += `UPDATE pantrys SET fruit = array_remove(fruit, '${req.body['pantry add'][4]}') WHERE username = '${username}';`
				queries += `UPDATE pantrys SET ingredients = array_remove(ingredients, '${req.body['pantry add'][4]}') WHERE username = '${username}';`
			}
			return db.any(queries)
		}).then(() => {
			res.redirect('/pantry')
		}).catch(error =>{
			console.log(error)
			var loggedIn = true;
			if(error.message === 'Username Not Found') loggedIn = false;
			res.render('pages/pantry',{
				local_css:"pantry.css",
				my_title:"Pantry",
				local_js:"pantry.js",
				logged: loggedIn,
				food: ''
			});
		})
	}
	else {
		res.render('pages/pantry',{
			local_css:"pantry.css",
			my_title:"Pantry",
			local_js:"pantry.js",
			logged: false,
			food: ''
		});
	}
});

app.get('/profile', (req, res) => {
	var sessionID = req.session.sessionID
	var name = ''
	if(sessionID)
	{
		var sessionQuery = `SELECT username FROM session_ids WHERE session_id = '${sessionID}';`
		db.any(sessionQuery)
		.then(session => {
			if (session[0]) return session[0].username //session exists in database
			else throw new Error('Username Not Found') //session doesn't exist in database
		}).then(username => {
			name = username
			var queries = `SELECT email FROM user_info WHERE username = '${username}';`
			return db.any(queries)
		}).then(email => {
			res.render('pages/profile',{
				local_css:"profile.css",
				my_title:"Profile",
				local_js:"profile.js",
				logged: true,
				username: name,
				email: email[0].email,
				favorites : ''
			});
		}).catch(error =>{
			console.log(error)
			var loggedIn = true;
			if(error.message === 'Username Not Found') loggedIn = false;
			res.render('pages/profile',{
				local_css:"profile.css",
				my_title:"Profile",
				local_js:"profile.js",
				logged: loggedIn,
				username: name,
				email: '',
				favorites : ''
			});
		})
	}
	else {
		res.render('pages/profile',{
			local_css:"profile.css",
			my_title:"Profile",
			local_js:"profile.js",
			logged: false,
			username: name,
			email: '',
			favorites : ''
		});
	}
});

app.get('/recipes_cooking',  (req, res) => {
	var sessionID = req.session.sessionID
	var favRecipes = null;
	var ingredients = null;
	if (sessionID){ //session exists locally
		var sessionQuery = `SELECT username FROM session_ids WHERE session_id = '${sessionID}';`
		db.any(sessionQuery)
		.then(session => {
			if (session[0]) return session[0].username //session exists in database
			else throw new Error('Username Not Found') //session doesn't exist in database
		}).then(username => {
			var favQuery = `SELECT recipe_ids FROM favorites WHERE username = '${username}';` 
			var ingrQuery = `SELECT ingredients FROM pantrys WHERE username = '${username}';`
			return db.task('recipe_query', task => {
				return task.batch([
					task.any(favQuery),
					task.any(ingrQuery)
				]);
			})
		}).then(info => {
			if (info[0]) favRecipes = info[0][0].recipe_ids;
			if (info[1]) ingredients = info[1][0].ingredients;
			var endpoints = []
			if (favRecipes) {endpoints.push({
				method: 'GET',
				url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk',
				params: {ids: `${favRecipes}`},
				headers: {
					'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
					'X-RapidAPI-Key': `${process.env.spoonacular_key}`
				}
			})}
			return Promise.all(endpoints.map((endpoint) => axios.request(endpoint)))
		}).then(axios.spread((...responses) => {
			var favoritesInfo = null;
			if(favRecipes) favoritesInfo= responses[0].data 
			res.render('pages/recipes_cooking',{
				local_css:"recipes_cooking.css",
				my_title:"Your Recipes",
				local_js:"recipes_cooking.js",
				favorites: favoritesInfo,
				user_ingredients: ingredients,
				logged: true
			});
		})).catch( err => {
			console.log(err)
			var loggedIn = err === 'Username Not Found' ? false : true;
			res.render('pages/recipes_cooking',{
				local_css:"recipes_cooking.css",
				my_title:"Your Recipes",
				local_js:"recipes_cooking.js",
				favorites: favRecipes,
				user_ingredients: ingredients,
				logged: loggedIn
			});
		})
	}
	else {
		res.render('pages/recipes_cooking',{
			local_css:"recipes_cooking.css",
			my_title:"Your Recipes",
			local_js:"recipes_cooking.js",
			favorites: favRecipes,
			user_ingredients: ingredients,
			logged: false
		});
	}
});

app.get('/search_recipe', (req, res) => {
	var sessionID = req.session.sessionID
	var recipes = null;
	if (sessionID){ //session exists locally
		var sessionQuery = `SELECT username FROM session_ids WHERE session_id = '${sessionID}';`
		db.any(sessionQuery)
		.then(session => {
			if (session[0]) return session[0].username //session exists in database
			else throw new Error('Username Not Found') //session doesn't exist in database
		}).then(username => {
			var loggedIn = false;
			if(username){
				loggedIn = true;
			}
			res.render('pages/search_recipe',{
				local_css:"search_recipe.css",
				my_title:"Discover",
				local_js:"search_recipe.js",
				recipes: recipes,
				logged: loggedIn
			});
		}).catch( err => {
			console.log(err)
			var loggedIn = err === 'Username Not Found' ? false : true;
			res.render('pages/search_recipe',{
				local_css:"search_recipe.css",
				my_title:"Discover",
				local_js:"search_recipe.js",
				recipes: recipes,
				logged: loggedIn
			});
		})
	}
	else {
		res.render('pages/search_recipe',{
			local_css:"search_recipe.css",
			my_title:"Discover",
			local_js:"search_recipe.js",
			recipes: recipes,
			logged: false
		});
	}
});


app.post('/search_complete',  (req, res) => {
	var sessionID = req.session.sessionID;
	var search = String(req.body.search);
	var diet = String(req.body.diet_filter);
	if (diet === 'Select Data Type') {
		diet = null;
	}
	
	var include = Boolean(req.body.include_ingrediants);
	if (include){
		include = true;
	}else{
		include = false;
	}
	var ingredients = null;
	var intolerances = null;
	var type = null;

	var recipes = null;
	if (sessionID) { //session exists locally
		var sessionQuery = `SELECT username FROM session_ids WHERE session_id = '${sessionID}';`
		db.any(sessionQuery)
		.then(session => {
			if (session[0]) return session[0].username //session exists in database
			else throw new Error('Username Not Found') //session doesn't exist in database
		}).then(username => {
			var ingrQuery = `SELECT ingredients FROM pantrys WHERE username = '${username}';`
			return db.task('recipe_query', task => {
				return task.batch([
					task.any(ingrQuery)
				]);
			})
		}).then(info => {
			if (info[0] && include) ingredients = info[0][0].ingredients;
			ingredients = String(ingredients);
			
			var endpoints = []
			if (ingredients) {endpoints.push({
				method: 'GET',
				url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch',
				params: {
					query: search,
					includeIngredients: ingredients,
					diet: diet,
					instructionsRequired: 'true',
					fillIngredients: 'true',
					addRecipeInformation: 'true',
					number: 10
				},
				headers: {
					'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
					'X-RapidAPI-Key': `${process.env.spoonacular_key}`
				}
			})}
			return Promise.all(endpoints.map((endpoint) => axios.request(endpoint)))
		}).then(axios.spread((...responses) => {
			if(ingredients) recipes = responses[0].data 
			res.render('pages/search_recipe',{
				local_css:"search_recipe.css",
				my_title:"Discover",
				local_js:"search_recipe.js",
				recipes: recipes,
				logged: true
			});
		})).catch( err => {
			console.log(err)
			var loggedIn = err === 'Username Not Found' ? false : true;
			res.render('pages/search_recipe',{
				local_css:"search_recipe.css",
				my_title:"Discover",
				local_js:"search_recipe.js",
				recipes: recipes,
				logged: loggedIn
			});
		})
	}
	else {
		const no_user_search = {
			method: 'GET',
			url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch',
			params: {
				query: search,
				diet: diet,
				instructionsRequired: 'true',
				fillIngredients: 'true',
				addRecipeInformation: 'true',
				number: 10
			},
			headers: {
			  'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
			  'X-RapidAPI-Key': '89765daf39msh18621cac397b13cp1dcac6jsnc085f89d2e27'
			}
		  };

		axios.request(no_user_search).then(function (response) {
			recipes = response.data;
			res.render('pages/search_recipe',{
				local_css:"search_recipe.css",
				my_title:"Discover",
				local_js:"search_recipe.js",
				recipes: recipes,
				logged: false
			});
		}).catch(function (error) {
			console.error(error);
		});
	}
});

app.get('/remove_favorite:id', (req, res) => {
	var sessionID = req.session.sessionID;
	var recipe_id = parseInt(req.params.id);
	if (sessionID) { //session exists locally
		var sessionQuery = `SELECT username FROM session_ids WHERE session_id = '${sessionID}';`
		db.any(sessionQuery)
		.then(session => {
			if (session[0]) return session[0].username //session exists in database
			else throw new Error('Username Not Found') //session doesn't exist in database
		}).then(username => {
			var removeFavorite = `UPDATE favorites SET recipe_ids = array_remove(recipe_ids, '${recipe_id}') WHERE username = '${username}';`
			return db.any(removeFavorite)
		}).then(() => {
			return res.send({success: true})
		}).catch(err => {
			console.log(err)
			res.send({success: false})
		})
	}
})

app.get('/add_favorite:id', (req, res) => {
	var sessionID = req.session.sessionID;
	var recipe_id = parseInt(req.params.id);
	if (sessionID) { //session exists locally
		var sessionQuery = `SELECT username FROM session_ids WHERE session_id = '${sessionID}';`
		db.any(sessionQuery)
		.then(session => {
			if (session[0]) return session[0].username //session exists in database
			else throw new Error('Username Not Found') //session doesn't exist in database
		}).then(username => {
			var addFavorite = `UPDATE favorites SET recipe_ids = array_append(recipe_ids, '${recipe_id}') WHERE username = '${username}';`
			return db.any(addFavorite)
		}).then(() => {
			return res.send({success: true})
		}).catch(err => {
			console.log(err)
			res.send({success: false})
		})
	}
})

app.get('/logout', (req, res) => {
	var session= req.session;
	var sessionID = session.sessionID
	if (!sessionID) {res.redirect('/')}
	var delete_q = `DELETE FROM session_ids WHERE session_id = '${sessionID}';`
	req.session.destroy();
	db.any(delete_q)
		.then( () => {
			return res.redirect('/')
		})
		.catch(err => {
			console.log(err)
			return res.redirect('/')
		})
});

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

module.exports = server;
