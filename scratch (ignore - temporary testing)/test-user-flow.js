import axios from 'axios';

const BASE_URL = 'http://localhost:6767';

async function testFlow() {
  const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
  });
  
  // To handle cookies across requests
  let cookieHeader = '';
  client.interceptors.request.use((config) => {
    if (cookieHeader) {
      config.headers.Cookie = cookieHeader;
    }
    return config;
  });
  
  client.interceptors.response.use((response) => {
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      cookieHeader = setCookie.map(c => c.split(';')[0]).join('; ');
    }
    return response;
  });

  try {
    console.log("1. Registering user...");
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';
    
    await client.post('/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: email,
      password: password
    });
    console.log(`User registered: ${email}`);

    console.log("2. Logging in...");
    const loginRes = await client.post('/auth/login', {
      email: email,
      password: password
    });
    console.log("Logged in successfully. User ID:", loginRes.data.payload._id);

    console.log("3. Creating workspace...");
    const wsRes = await client.post('/workspace', {
      name: 'My Workspace',
      description: 'Test Workspace',
      icon: '🚀'
    });
    const wsId = wsRes.data.payload._id;
    console.log(`Workspace created successfully. ID: ${wsId}`);

    console.log("4. Fetching all workspaces...");
    const allWsRes = await client.get('/workspace');
    console.log("Workspaces count:", allWsRes.data.payload.length);
    console.log("Workspaces:", allWsRes.data.payload.map(w => ({ id: w._id, name: w.name })));

    console.log("5. Fetching workspace by ID...");
    const singleWsRes = await client.get(`/workspace/${wsId}`);
    console.log("Fetched workspace:", singleWsRes.data.payload);

    console.log("6. Fetching pages for workspace...");
    const pagesRes = await client.get(`/page?workspace=${wsId}`);
    console.log("Pages count:", pagesRes.data.payload.length);

    console.log("7. Fetching boards for workspace...");
    const boardsRes = await client.get(`/board?workspace=${wsId}`);
    console.log("Boards count:", boardsRes.data.payload.length);

    console.log("Test completed successfully! No errors.");
  } catch (err) {
    console.error("Test failed!");
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      console.error("Data:", err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testFlow();
