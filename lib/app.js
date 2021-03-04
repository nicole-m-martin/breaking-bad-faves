const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const request = require('superagent');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

// GET all characters route
app.get('/breakingbad', async(req, res) => {
  try {
    const breakingbad = await request.get(`https://www.breakingbadapi.com/api/characters?name=${req.query.name}`);
    // console.log(breakingbad.body);
    res.json(breakingbad.body);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// GET protected route to fave characters
app.get('/api/characters', async(req, res) => {
  try {
    const data = await client.query(
      'SELECT * from characters where owner_id=$1', 
      [req.userId],
    );
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


// POST protected route to fave character list
app.post('/api/characters', async(req, res) => {
  try {

  
    const data = await client.query(`
    INSERT INTO characters (
      char_id, 
      name, 
      birthday, 
      img, 
      status, 
      nickname, 
      portrayed,
      owner_id )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
`,
    [req.body.char_id, 
      req.body.name, 
      req.body.birthday, 
      req.body.img, 
      req.body.status, 
      req.body.nickname, 
      req.body.portrayed,
      req.userId
    ]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// DELETE protected route to remove a fave character
app.delete('/api/characters/:id', async(req, res) => {
  try {
    const data = await client.query(
      'DELETE from characters where owner_id=$1 AND id=$2', 
      [req.userId, req.params.id],
    );
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});



app.use(require('./middleware/error'));

module.exports = app;
