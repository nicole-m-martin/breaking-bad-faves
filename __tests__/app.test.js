require('dotenv').config();

const { execSync } = require('child_process');

const request = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');
// const { characters } = require('../data/characters');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await request(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    // POST test
    test('.add a fave character post test', async() => {

      const fave = {
        char_id: 3,
        name: 'Skyler White',
        birthday: '08-11-1970',
        img: 'https://s-i.huffpost.com/gen/1317262/images/o-ANNA-GUNN-facebook.jpg',
        status: 'Alive',
        nickname: 'Sky',
        portrayed: 'Anna Gunn'
      };

      const characterFave = [{
        ...fave,
        id: 4,
        owner_id: 2
        
      }];

      const data = await request(app)
        .post('/api/characters')
        .send(fave)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(characterFave);
    });



    // GET : return characters array TEST
    // test('should respond with the characters', 
    //   async() => {
    //     const expectAllCharacters = [
    //       {
    //         char_id: 1,
    //         name: 'Walter White',
    //         birthday: '09-07-1958',
    //         img: 'https://images.amcnetworks.com/amc.com/wp-content/uploads/2015/04/cast_bb_700x1000_walter-white-lg.jpg',
    //         status: 'Deceased',
    //         nickname: 'Heisenberg',
    //         portrayed: 'Bryan Cranston'
      
    //       },
    //       {
    //         char_id: 2,
    //         name: 'Jesse Pinkman',
    //         birthday: '09-24-1984',
    //         img: 'https://vignette.wikia.nocookie.net/breakingbad/images/9/95/JesseS5.jpg/revision/latest?cb=20120620012441',
    //         status: 'Alive',
    //         nickname: 'Cap n Cook',
    //         portrayed: 'Aaron Paul'
      
    //       },
    //       {
    //         char_id: 3,
    //         name: 'Skyler White',
    //         birthday: '08-11-1970',
    //         img: 'https://s-i.huffpost.com/gen/1317262/images/o-ANNA-GUNN-facebook.jpg',
    //         status: 'Alive',
    //         nickname: 'Sky',
    //         portrayed: 'Anna Gunn'
      
    //       }];

    //     const response = await request(app)
    //       .get('/characters')
    //       .expect('Content-Type', /json/)
    //       .expect(200);

    //     expect(response.body).toEqual(expectAllCharacters);
       
    //   });

    // GET : return one character from breaking bad TEST
    test('Pull a character from the breaking bad api', async () => {
      await request(app)
        .get('/breakingbad?name=Walter')
        .expect('Content-Type', /json/)
        .expect(200);
        
    });

  });
});
