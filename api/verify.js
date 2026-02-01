// api/verify.js
const https = require('https');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { email, password } = req.body;
    const path = email.replace(/\./g, ',');

    // Firebase REST API URL
    const dbUrl = `https://movie-1e6fc-default-rtdb.firebaseio.com/premium_members/${path}.json`;

    https.get(dbUrl, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', async () => {
            const userData = JSON.parse(data);

            if (userData && userData.password === password) {
                const now = new Date().getTime();
                if (now > userData.expiry) {
                    return res.status(403).json({ success: false, message: "Expired" });
                }

                // Ab tools fetch karein
                https.get(`https://movie-1e6fc-default-rtdb.firebaseio.com/active_tools.json`, (tRes) => {
                    let tData = '';
                    tRes.on('data', (tc) => { tData += tc; });
                    tRes.on('end', () => {
                        const tools = JSON.parse(tData) || {};
                        let toolsHtml = '<div class="tool-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px;">';
                        
                        Object.keys(tools).forEach(key => {
                            const tool = tools[key];
                            toolsHtml += `
                                <div class="tool-card" onclick="window.open('${tool.link}', '_blank')" style="background:#000; padding:15px; border-radius:15px; border:1px solid #222; cursor:pointer;">
                                    <img src="${tool.icon}" width="35">
                                    <h4 style="color:#00ff88; margin:5px 0; font-size:12px;">${tool.name}</h4>
                                </div>`;
                        });
                        toolsHtml += '</div>';

                        res.status(200).json({
                            success: true,
                            injectHtml: `<h3 style="color:#00ff88;">🔓 DASHBOARD ACTIVE</h3>${toolsHtml}`
                        });
                    });
                });

            } else {
                res.status(401).json({ success: false, message: "Invalid Login" });
            }
        });
    }).on("error", (err) => {
        res.status(500).json({ success: false, error: err.message });
    });
}
