export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Not Allowed');

    const { email, password } = req.body;

    // Asli Logic aur Tool ka code yahan chupa hua hai
    if (email === "admin@ziddi.com" && password === "ziddi786") {
        return res.status(200).json({
            success: true,
            // Ye HTML tabhi user ko dikhega jab login sahi hoga
            injectHtml: `
                <div style="background:#1c2126; padding:20px; border-radius:20px; border:1px solid #00ff88;">
                    <h2 style="color:#00ff88;">🔓 ZIDDI PREMIUM UNLOCKED</h2>
                    <p>Welcome to Private Dashboard</p>
                    <div style="display:flex; justify-content:space-around; margin:20px 0;">
                        <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" width="50" onclick="alert('TikTok Link Generated')">
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="50" onclick="alert('Instagram Link Generated')">
                    </div>
                </div>`
        });
    } else {
        return res.status(401).json({ success: false, message: "Invalid Access" });
    }
}
