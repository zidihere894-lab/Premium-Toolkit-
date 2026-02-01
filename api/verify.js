// api/verify.js
const fetch = require('node-fetch');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Not Allowed');

    const { email, password } = req.body;
    const path = email.replace(/\./g, ',');

    try {
        // Seedha Firebase REST API use karein (Ye mobile/Vercel par fail nahi hota)
        const dbUrl = `https://movie-1e6fc-default-rtdb.firebaseio.com/premium_members/${path}.json`;
        const userRes = await fetch(dbUrl);
        const userData = await userRes.json();

        if (userData && userData.password === password) {
            const now = new Date().getTime();
            if (now > userData.expiry) {
                return res.status(403).json({ success: false, message: "Expired" });
            }

            // Tools fetch karein
            const toolsUrl = `https://movie-1e6fc-default-rtdb.firebaseio.com/active_tools.json`;
            const toolsRes = await fetch(toolsUrl);
            const toolsData = await toolsRes.json() || {};

            let toolsHtml = '<div class="tool-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px;">';
            Object.keys(toolsData).forEach(key => {
                const tool = toolsData[key];
                toolsHtml += `
                    <div class="tool-card" onclick="window.open('${tool.link}', '_blank')" style="background:#000; padding:15px; border-radius:15px; border:1px solid #222;">
                        <img src="${tool.icon}" width="40">
                        <h4 style="color:#00ff88; margin:5px 0;">${tool.name}</h4>
                    </div>`;
            });
            toolsHtml += '</div>';

            return res.status(200).json({
                success: true,
                injectHtml: `<h3 style="color:#00ff88;">🔓 ACCESS GRANTED</h3>${toolsHtml}`
            });
        } else {
            return res.status(401).json({ success: false });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
