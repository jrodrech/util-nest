
const API_KEY = process.env.API_KEY;
const BASE = 'https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/youtube';
const VIDEO = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll

async function test() {
    console.log('Using Key:', API_KEY);

    try {
        console.log('\n--- 1. Info ---');
        const info = await fetch(BASE + '/info?url=' + VIDEO, { headers: { 'x-api-key': API_KEY } });
        console.log('Status:', info.status);
        if (info.ok) {
            const data = await info.json();
            console.log('Title:', data.title);
        } else {
            console.log(await info.text());
        }

        console.log('\n--- 2. Transcript ---');
        const trans = await fetch(BASE + '/transcript?url=' + VIDEO, { headers: { 'x-api-key': API_KEY } });
        console.log('Status:', trans.status);
        if (trans.ok) {
            const data = await trans.json();
            console.log('Captions Found:', data.captions?.length);
        } else {
            // Expected for many videos due to IP blocks
            console.log('Error:', (await trans.text()).substring(0, 100));
        }

        console.log('\n--- 3. Audio Redirect ---');
        const audio = await fetch(BASE + '/audio?url=' + VIDEO, {
            headers: { 'x-api-key': API_KEY },
            redirect: 'manual'
        });
        console.log('Status:', audio.status);
        if (audio.status === 302) {
            console.log('Redirect Location:', audio.headers.get('location')?.substring(0, 60) + '...');
        } else {
            console.log('Error:', await audio.text());
        }

    } catch (e) {
        console.error(e);
    }
}
test();
