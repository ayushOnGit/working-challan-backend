const APIError = require("../utils/APIError");
const { saveLocalFile } = require("../utils/helper");

exports.otpReceiveWebhook = async (req, res, next) => {
    try {
        const { from, text, sentStamp, receivedStamp, sim } = req.body;
        console.log('from: ', from);
        if (from.includes("DELTRF")) {
            const otp = (text || '').match(/\d{6}/)[0];
            console.log('traffic: ',otp)
            await saveLocalFile(otp, 'otp.txt');
        }

        return res.json({
            status: 200,
            message: 'Data recorded',
        });
    } catch (error) {
        return next(error);
    }
};
