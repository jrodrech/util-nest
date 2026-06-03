// Live test for auth-service
const API_KEY = process.env.API_KEY;
const BASE = 'https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/auth-service';

async function test() {
    console.log('Using key:', API_KEY?.substring(0, 20) + '...');

    console.log('\n1. Testing Token Generation...');
    const genRes = await fetch(BASE + '/tokens/generate', {
        method: 'POST',
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: { userId: 'test_user' }, expiresIn: 60 })
    });
    const genData = await genRes.json();
    console.log('Status:', genRes.status);
    console.log('Response:', JSON.stringify(genData, null, 2));

    if (genData.token) {
        console.log('\n2. Testing Token Validation...');
        const valRes = await fetch(BASE + '/tokens/validate', {
            method: 'POST',
            headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: genData.token })
        });
        console.log('Status:', valRes.status);
        console.log('Response:', JSON.stringify(await valRes.json(), null, 2));
    }

    console.log('\n3. Testing Password Hashing...');
    const hashRes = await fetch(BASE + '/passwords/hash', {
        method: 'POST',
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'testPassword123' })
    });
    const hashData = await hashRes.json();
    console.log('Status:', hashRes.status);
    console.log('Response:', JSON.stringify(hashData, null, 2));

    if (hashData.hash) {
        console.log('\n4. Testing Password Verification (correct)...');
        const verifyRes = await fetch(BASE + '/passwords/verify', {
            method: 'POST',
            headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'testPassword123', hash: hashData.hash })
        });
        console.log('Status:', verifyRes.status);
        console.log('Response:', JSON.stringify(await verifyRes.json(), null, 2));

        console.log('\n5. Testing Password Verification (wrong password)...');
        const wrongRes = await fetch(BASE + '/passwords/verify', {
            method: 'POST',
            headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'wrongPassword', hash: hashData.hash })
        });
        console.log('Status:', wrongRes.status);
        console.log('Response:', JSON.stringify(await wrongRes.json(), null, 2));
    }

    console.log('\nAll tests complete!');
}

test().catch(console.error);
