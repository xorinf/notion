const BASE_URL = 'http://localhost:6767';

async function testFlow() {
  let cookieHeader = '';

  async function req(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
    
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      cookieHeader = setCookie.split(';')[0];
    }
    
    const data = await response.json();
    return { status: response.status, data };
  }

  try {
    console.log("1. Registering user...");
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';
    
    const regRes = await req('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: email,
        password: password
      })
    });
    
    if (regRes.status !== 201) {
      throw new Error(`Register failed: ${JSON.stringify(regRes.data)}`);
    }
    console.log(`User registered: ${email}`);

    console.log("2. Logging in...");
    const loginRes = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }
    console.log("Logged in successfully. User ID:", loginRes.data.payload._id);

    console.log("3. Creating workspace...");
    const wsRes = await req('/workspace', {
      method: 'POST',
      body: JSON.stringify({
        name: 'My Workspace',
        description: 'Test Workspace',
        icon: '🚀'
      })
    });
    
    if (wsRes.status !== 201) {
      throw new Error(`Create workspace failed: ${JSON.stringify(wsRes.data)}`);
    }
    const wsId = wsRes.data.payload._id;
    console.log(`Workspace created successfully. ID: ${wsId}`);

    console.log("4. Fetching all workspaces...");
    const allWsRes = await req('/workspace');
    if (allWsRes.status !== 200) {
      throw new Error(`Fetch workspaces failed: ${JSON.stringify(allWsRes.data)}`);
    }
    console.log("Workspaces count:", allWsRes.data.payload.length);
    console.log("Workspaces:", allWsRes.data.payload.map(w => ({ id: w._id, name: w.name })));

    console.log("5. Fetching workspace by ID...");
    const singleWsRes = await req(`/workspace/${wsId}`);
    if (singleWsRes.status !== 200) {
      throw new Error(`Fetch workspace by ID failed: ${JSON.stringify(singleWsRes.data)}`);
    }
    console.log("Fetched workspace:", singleWsRes.data.payload);

    console.log("6. Fetching pages for workspace...");
    const pagesRes = await req(`/page?workspace=${wsId}`);
    if (pagesRes.status !== 200) {
      throw new Error(`Fetch pages failed: ${JSON.stringify(pagesRes.data)}`);
    }
    console.log("Pages count:", pagesRes.data.payload.length);

    console.log("7. Fetching boards for workspace...");
    const boardsRes = await req(`/board?workspace=${wsId}`);
    if (boardsRes.status !== 200) {
      throw new Error(`Fetch boards failed: ${JSON.stringify(boardsRes.data)}`);
    }
    console.log("Boards count:", boardsRes.data.payload.length);

    console.log("Test completed successfully! No errors.");
  } catch (err) {
    console.error("Test failed!");
    console.error(err.message);
  }
}

testFlow();
