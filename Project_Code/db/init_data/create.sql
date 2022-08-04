CREATE EXTENSION pgcrypto;

/* user info table written by Will and Jason*/
CREATE TABLE IF NOT EXISTS user_info (
  username text NOT NULL,    /* username of user */                 
  email text NOT NULL,                    /* email of user */
  pass text NOT NULL,           /* user password consisting of capital letter, number, symbol, min 12 char*/
  PRIMARY KEY(username)
);

/* HOW TO FIND USER:
 * SELECT * FROM user_info WHERE user_name = 'test' AND pass = crypt('TestPass12345.', pass);  
 */
 /*test user*/
INSERT INTO user_info (username, email, pass)
VALUES ('test','testusr@testmail.com',
  crypt('TestPass12345.', gen_salt('bf'))
);

/* 
 * Session table
 */
 CREATE TABLE IF NOT EXISTS session_ids (
   session_id text PRIMARY KEY,
   username text NOT NULL
 );

CREATE TABLE IF NOT EXISTS pantrys (
   ingredients TEXT[],
   meats TEXT[],
   carbs TEXT[], 
   vegs TEXT[],
   dairy TEXT[],
   fruit TEXT[],
   username TEXT PRIMARY KEY
 );

 CREATE TABLE IF NOT EXISTS favorites (
   recipe_ids INTEGER[],
   username TEXT PRIMARY KEY
 );

INSERT INTO pantrys (username, ingredients, meats)
VALUES ('test', '{meatballs}' ,'{meatballs}');
INSERT INTO favorites (username, recipe_ids)
VALUES ('test', '{715538}');

