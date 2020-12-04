const request = require('supertest')
const app = require('../app')

var token;
describe('Users', () => {
  // Log in actual user and store token for future use
  beforeAll(async (done) => {
    let res = await request(app.callback())
      .post('/api/v1/login')
      .set('Authorization', 'Basic ' + Buffer.from("testuser:Password123!").toString('base64'))
    token = res.body.user.token;
    done();
  });

  // Signup 
  it('Create new user and send activation link', async () => {
    const res = await request(app.callback())
      .post('/api/v1/signup')
      .send({
        username: 'testuser2',
        password: 'Password123!',
        email: 'notexistingemail@test123Uniqueemail.com'
      })
    expect(res.status).toEqual(200)
  })
  // Log in previously created user
  it('Check that user needs verification', async () => {
    const res = await request(app.callback())
      .post('/api/v1/login')
      .set('Authorization', 'Basic ' + Buffer.from("testuser2:Password123!").toString('base64'))
    expect(res.status).toEqual(409) // not activated
  })
  // Access profile with JWT token
  it('Access profile', async () => {
    const res = await request(app.callback())
      .get('/api/v1/user/profile')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toEqual(200)
    expect(res.body[0]).toHaveProperty('username', 'testuser')
  })
  // Update profile
  it('Update user profile and check for status', async () => {
    const res = await request(app.callback())
      .put('/api/v1/user/updateinfo')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'testname'
      })
    expect(res.status).toEqual(201)
    expect(res.body[0]).toHaveProperty('firstname', 'testname')
  })
  // Change password for user
  it('Change user password and expect 200 as status', async () => {
    const res = await request(app.callback())
      .put('/api/v1/user/changepass')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'Password123!',
        newPassword: 'Password123!?'
      })
    expect(res.status).toEqual(200)
  })
  // Reset password
  it('Reset password and expect 200', async () => {
    const res = await request(app.callback())
      .post('/api/v1/login/reset')
      .send({
        user: 'testuser'
      })
    expect(res.status).toEqual(200)
  })
  // Verify user with reset password is disabled 
  it('Try user account is disabled after reset pass (new password from changed pass)', async () => {
    const res = await request(app.callback())
      .post('/api/v1/login')
      .set('Authorization', 'Basic ' + Buffer.from("testuser:Password123!?").toString('base64'))
    expect(res.status).toEqual(409) // not activated
  })
});





