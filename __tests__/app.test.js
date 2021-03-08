require('dotenv').config();

const { execSync } = require('child_process');
const request = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');
// const { characters } = require('../data/characters');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async (done) => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await request(app).post('/auth/signup').send({
        email: 'jon@user.com',
        password: '1234',
      });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll((done) => {
      return client.end(done);
    });

    // POST test
    test('POST a character to users fave test', async () => {
      const fave = {
        char_id: 3,
        name: 'Skyler White',
        birthday: '08-11-1970',
        img:
          'https://s-i.huffpost.com/gen/1317262/images/o-ANNA-GUNN-facebook.jpg',
        status: 'Alive',
        nickname: 'Sky',
        portrayed: 'Anna Gunn',
      };

      const characterFave = [
        {
          ...fave,
          id: 4,
          owner_id: 2,
        },
      ];

      const data = await request(app)
        .post('/api/characters')
        .send(fave)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(characterFave);
    });

    // GET : return one character from breaking bad TEST
    test('GET a character from the breaking bad api', async () => {
      await request(app)
        .get('/breakingbad?name=Walter')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    test('GET one fave character from users favorites', async () => {
      const expectation = {
        char_id: 3,
        name: 'Skyler White',
        birthday: '08-11-1970',
        img:
          'https://s-i.huffpost.com/gen/1317262/images/o-ANNA-GUNN-facebook.jpg',
        status: 'Alive',
        nickname: 'Sky',
        portrayed: 'Anna Gunn',
        id: 4,
        owner_id: 2,
      };

      const data = await request(app)
        .get('/api/characters')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(expectation);
    });
  });
});
