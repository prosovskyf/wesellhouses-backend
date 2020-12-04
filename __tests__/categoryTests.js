const request = require('supertest')
const app = require('../app')

var token;
var id;
// Log in actual user and create category to store ID into variable
describe('Category', () => {
  beforeAll(async (done) => {
    // Log in and store JWT token
    let res = await request(app.callback())
      .post('/api/v1/login')
      .set('Authorization', 'Basic ' + Buffer.from("testagent:Password123!").toString('base64'))
    token = res.body.user.token
    // Create category and store ID to variable
    let cat = await request(app.callback())
      .post('/api/v1/category')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'testCategory'
      })
    id = cat.body[0].id
    expect(cat.status).toEqual(201)
    // finish beforeALL and continue testing
    done();
  });
  // Get created category
  it('Get created category by stored ID', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/category/${id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toEqual(200)
    expect(res.body[0]).toHaveProperty('name', 'testCategory')
  })
  // Get all categories
  it('Get all categories', async () => {
    let res = await request(app.callback())
      .get('/api/v1/category')
    expect(res.status).toEqual(200)
  })
  // Update category
  it('Update created category', async () => {
    let res = await request(app.callback())
      .put(`/api/v1/category/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'updatedCategory'
      })
    expect(res.status).toEqual(201)
  })
  // Test updated category
  it('Test updated category', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/category/${id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toEqual(200)
    expect(res.body[0]).toHaveProperty('name', 'updatedCategory')
  })
  // Delete category
  it('Delete category', async () => {
    let res = await request(app.callback())
      .delete(`/api/v1/category/${id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toEqual(201)
  })
  // Check category was deleted
  it('Test category was deleted', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/category/${id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toEqual(404)
  })
});
