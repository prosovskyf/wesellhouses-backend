const request = require('supertest')
const app = require('../app');

var tokenAgent;
var tokenUser;
var propertyId;
var categoryId;
var thread;
// PROPERTY
// Log in actual user and test property functions
describe('Property', () => {
  // run before testing
  beforeAll(async (done) => {
    // Log in and store JWT token for agent
    let resAgent = await request(app.callback())
      .post('/api/v1/login')
      .set('Authorization', 'Basic ' + Buffer.from("testagent:Password123!").toString('base64'))
    tokenAgent = resAgent.body.user.token
    // Log in and store JWT token for user
    let resUser = await request(app.callback())
      .post('/api/v1/login')
      .set('Authorization', 'Basic ' + Buffer.from("testuser3:Password123!").toString('base64'))
    tokenUser = resUser.body.user.token
    // Create category and store ID to variable
    let cat = await request(app.callback())
      .post('/api/v1/category')
      .set('Authorization', `Bearer ${tokenAgent}`)
      .send({
        name: 'testCategoryProperty'
      })
    categoryId = cat.body[0].id
    expect(cat.status).toEqual(201)
    // finish beforeALL and continue testing
    done();
  });

  // Create property
  it('Create property', async () => {
    let res = await request(app.callback())
      .post(`/api/v1/admin/properties/`)
      .set('Authorization', `Bearer ${tokenAgent}`)
      .send({
        title: 'newProperty',
        description: 'test property description',
        price: 1000,
        category_id: categoryId,
        published: true
      })
    propertyId = res.body[0].id
    expect(res.status).toEqual(201)
    expect(res.body[0]).toHaveProperty('title', 'newProperty')
  })
  // Get all properties
  it('Get all properties', async () => {
    let res = await request(app.callback())
      .get('/api/v1/properties')
    expect(res.status).toEqual(200)
  })
  // Get property by id
  it('Get property by id', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/admin/properties/${propertyId}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
    expect(res.status).toEqual(200)
    expect(res.body[0]).toHaveProperty('title', 'newProperty')
  })
  // Update property
  it('Update property', async () => {
    let res = await request(app.callback())
      .put(`/api/v1/admin/properties/${propertyId}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
      .send({
        title: 'newProperty2',
        description: 'test property description2',
        price: 2000,
      })
    expect(res.status).toEqual(201)
  })
  // check updated property
  it('Check updated property', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/admin/properties/${propertyId}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
    expect(res.status).toEqual(200)
    expect(res.body[0]).toHaveProperty('title', 'newProperty2')
  })
});

// FEATURES
describe('Features', () => {
  // Create features
  it('Create features', async () => {
    let res = await request(app.callback())
      .post(`/api/v1/features/${propertyId}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
      .send({
        feature: ['test', 'test1'],
      })
    expect(res.status).toEqual(201)
  })
  // Get property with created features
  it('Get features for created property', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/admin/properties/${propertyId}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
    expect(res.status).toEqual(200)
    expect(res.body[0]).toHaveProperty('features', ['test', 'test1'])
  })
  // Delete all features
  it('Delete all features for created property', async () => {
    let res = await request(app.callback())
      .delete(`/api/v1/features/all/${propertyId}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
    expect(res.status).toEqual(201)
  })
  // Verify features were deleted
  it('Verify features were deleted for property', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/admin/properties/${propertyId}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
    expect(res.status).toEqual(200)
    expect(res.body[0]).toHaveProperty('features', [null])
  })
});

// MESSAGES
describe('Messages', () => {
  // Send first message
  it('Send first message as user to agent about created property', async () => {
    let res = await request(app.callback())
      .post(`/api/v1/messages`)
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        message: 'Hello',
        property_id: propertyId
      })
    expect(res.status).toEqual(201)
  })
  // Get threads
  it('Get threads for agent', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/messages`)
      .set('Authorization', `Bearer ${tokenAgent}`)
    thread = res.body[0].id
    expect(res.status).toEqual(200)
    expect(res.body[0]).toHaveProperty('property_id', propertyId)
  })
  // Get messages
  it('Get message from thread', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/messages/${thread}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
    expect(res.status).toEqual(200)
    expect(res.body.messages[0]).toHaveProperty('message', 'Hello')
  })
  // Send reply from agent
  it('Send reply message', async () => {
    let res = await request(app.callback())
      .post(`/api/v1/messages/${thread}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
      .send({
        message: 'Hello2',
      })
    expect(res.status).toEqual(201)
  })
  // Verify agent's message was sent
  it('Get message agent sent before', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/messages/${thread}`)
      .set('Authorization', `Bearer ${tokenUser}`)
    expect(res.status).toEqual(200)
    expect(res.body.messages[1]).toHaveProperty('message', 'Hello2')
  })
  // Archive thread
  it('Archive message thread', async () => {
    let res = await request(app.callback())
      .put(`/api/v1/messages/${thread}/archive`)
      .set('Authorization', `Bearer ${tokenAgent}`)
    expect(res.status).toEqual(200)
  })
  // Verify thread is archived
  it('Verify thread is archived for agent', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/messages/archive/${thread}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
    expect(res.status).toEqual(200)
    expect(res.body.messages[0]).toHaveProperty('message', 'Hello')
    expect(res.body.messages[1]).toHaveProperty('message', 'Hello2')
  })
  // Delete thread for agent
  it('Delete thread for agent', async () => {
    let res = await request(app.callback())
      .delete(`/api/v1/messages/${thread}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
    expect(res.status).toEqual(200)
  })
  // Verify thread is deleted for agent (on non-archived path)
  it('Verify thread is deleted for agent', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/messages/${thread}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
    expect(res.status).toEqual(404)
  })
  // Verify thread is deleted for agent (archived path)
  it('Verify thread is deleted for agent (archive)', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/messages/archive/${thread}`)
      .set('Authorization', `Bearer ${tokenAgent}`)
    expect(res.status).toEqual(404)
  })
  // Verify thread exists for user
  it('Verify thread exists for user', async () => {
    let res = await request(app.callback())
      .get(`/api/v1/messages/${thread}`)
      .set('Authorization', `Bearer ${tokenUser}`)
    expect(res.status).toEqual(200)
    expect(res.body.messages[0]).toHaveProperty('message', 'Hello')
    expect(res.body.messages[1]).toHaveProperty('message', 'Hello2')
  })
});