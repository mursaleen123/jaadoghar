const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { server_url } = require("../configs");

exports.generateQrCode = async (smdpAddress) => {
  try {
    const url = smdpAddress || "https://example.com";
    const qrCodeImage = await QRCode.toDataURL(url);


    const fileName = `qr_code_${Date.now()}.png`;

    const imagePath = server_url + `/public/qrCodes/${fileName}`;

    const imagePath2 = path.join(__dirname, "../../public/qrCodes", fileName);
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(imagePath2, base64Data, { encoding: "base64" });

    return imagePath;
  } catch (err) {
    console.error("Error generating QR code:", err);
  }
};
