const request = require('supertest')
const app = require('../app')

var token;
// Log in actual user and get zoopla results
describe('Zoopla', () => {
  beforeAll(async (done) => {
    // Log in and store JWT token
    let res = await request(app.callback())
      .post('/api/v1/login')
      .set('Authorization', 'Basic ' + Buffer.from("testagent:Password123!").toString('base64'))
    token = res.body.user.token
    // finish beforeALL and continue testing
    done();
  });
  // Get zoopla data
  it('Get zoopla data', async () => {
    let res = await request(app.callback())
      .post(`/api/v1/admin/properties/data`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        postcode: 'CV1'
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('postcode', 'CV1')
  })
});
