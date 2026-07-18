const testUrls = async () => {
    const urls = [
        'https://connect-vendor.onrender.com/',
        'https://connect-admin-backend.onrender.com/',
        'https://connect-admin-backend.onrender.com/api/admin/categories'
    ];
    
    for (const url of urls) {
        try {
            console.log(`Testing ${url}...`);
            const start = Date.now();
            const res = await fetch(url);
            console.log(`Status: ${res.status}, Time: ${Date.now() - start}ms`);
            if (res.ok) {
                const data = await res.json();
                console.log('Response sample:', JSON.stringify(data).substring(0, 150));
            }
        } catch (err) {
            console.error(`Failed to reach ${url}:`, err.message);
        }
    }
};

testUrls();
