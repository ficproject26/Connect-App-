const printRaw = async () => {
    const urls = [
        'https://connect-admin-backend.onrender.com/',
        'https://connect-vendor.onrender.com/'
    ];
    for (const url of urls) {
        try {
            console.log(`URL: ${url}`);
            const res = await fetch(url);
            const text = await res.text();
            console.log('Status:', res.status);
            console.log('Response body:', text);
            console.log('-------------------------------');
        } catch (e) {
            console.error(e);
        }
    }
};
printRaw();
