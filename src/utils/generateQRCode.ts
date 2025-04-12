import {Visitor} from "@/services/api"
import QRCode from "qrcode"

export async function generateQRCode(data:Visitor){
    const qrcode = await QRCode.toDataURL(JSON.stringify(data), {
        errorCorrectionLevel: 'H', 
        margin: 4, 
        width: 400,
        color: {
            dark: '#000000', 
            light: '#ffffff'
        }
    })
    return qrcode
}
