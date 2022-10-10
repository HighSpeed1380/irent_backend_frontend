const crypto = require('crypto');

const key = Buffer.from('nQw7y6QejwGFh/SNrul20Q==', 'base64');  

module.exports = class Encrypt {

    encrypt(text) {
        //const ivCiphertext = Buffer.from(text, 'hex');
        //const iv = ivCiphertext.slice(0, 16);
        const iv = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv( 
            'AES-128-CBC', key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([iv, encrypted, cipher.final()]); 
        return encrypted.toString('hex');
    }

    decryptText(text) {
        try {
            const ivCiphertext = Buffer.from(text, 'hex');
            const iv = ivCiphertext.slice(0, 16);
            const ciphertext = ivCiphertext.slice(16);
            var decipher = crypto.createDecipheriv('AES-128-CBC', key, iv);
            var value = 
                decipher.update(ciphertext, '', 'utf8') +
                decipher.final('utf8');
            return value;
        } catch (err) {
            console.log(err);
        }
    }
};