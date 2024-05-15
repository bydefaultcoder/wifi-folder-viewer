const os = require('os');
const networkInterfaces = os.networkInterfaces();
// console.log(networkInterfaces)

let privateIpAddress
export function getPrivateIp(){
    networkInterfaces['Wi-Fi'];
    networkInterfaces['Wi-Fi'].forEach(element => {
        if( element['family']== 'IPv4'){
           privateIpAddress = element['address'];
        }
    });
    return privateIpAddress;
}