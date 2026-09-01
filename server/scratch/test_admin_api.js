require('dotenv').config();
const axios = require('axios');

const testApi = async () => {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'balisaikumar9491@gmail.com',
      password: '123456'
    });
    const token = loginRes.data.token;
    console.log('Login successful, token retrieved.');

    const headers = { Authorization: `Bearer ${token}` };

    const [statsRes, outpassesRes, visitsRes] = await Promise.all([
      axios.get('http://localhost:5000/api/admin/dashboard', { headers }),
      axios.get('http://localhost:5000/api/admin/outpasses?status=PENDING', { headers }),
      axios.get('http://localhost:5000/api/admin/visit-passes?status=PENDING', { headers })
    ]);

    console.log('API calls successful.');
    console.log('Stats charts:', statsRes.data.charts);
    console.log('Outpasses length:', outpassesRes.data.length);
    console.log('Visits length:', visitsRes.data.length);
    if (outpassesRes.data.length > 0) {
      console.log('First outpass structure:', Object.keys(outpassesRes.data[0]));
    }
    process.exit(0);
  } catch (error) {
    console.error('API test failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
};

testApi();
