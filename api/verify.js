const https = require('https');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('NO');

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false });

    // Gmail se dot ko comma mein badalna
    const safePath = email.trim().replace(/\./g, ',');

    const dbUrl = `https://movie-1e6fc-default-rtdb.firebaseio.com/premium_members/${safePath}.json`;

    https.get(dbUrl, (response) => {
        let data = '';
        response.on('data', (d) => { data += d; });
        response.on('end', () => {
            const user = JSON.parse(data);

            // Password Match Check
            if (user && String(user.password) === String(password).trim()) {
                
                // Fetch Tools
                https.get(`https://movie-1e6fc-default-rtdb.firebaseio.com/active_tools.json`, (tRes) => {
                    let tData = '';
                    tRes.on('data', (td) => { tData += td; });
                    tRes.on('end', () => {
                        const tools = JSON.parse(tData) || {};
                        let toolsHtml = '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">';
                        
                        Object.keys(tools).forEach(k => {
                            const t = tools[k];
                            toolsHtml += `
                                <div onclick="window.open('${t.link}')" style="background:#000; padding:15px; border-radius:15px; border:1px solid #00ff88; cursor:pointer;">
                                    <h4 style="margin:0; color:#00ff88;">${t.name}</h4>
                                    <small>Click to Open</small>
                                </div>`;
                        });
                        toolsHtml += '</div>';

                        return res.status(200).json({
                            success: true,
                            injectHtml: `<h2 style="color:#00ff88;">🔓 TOOLS UNLOCKED</h2>${toolsHtml}`
                        });
                    });
                });
            } else {
                return res.status(401).json({ success: false });
            }
        });
    }).on('error', () => res.status(500).json({ success: false }));
}
