const args = process.argv[2];
const {getPrivateIp} = require('./helper/privateIpGetter')
const {createFolderIfNotExists} = require('./helper/folderCreater')
const qrcode = require('qrcode-terminal');
const detectPort = require('detect-port');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000;



createFolderIfNotExists('tempuploads')
createFolderIfNotExists('AllUploadedFiles')
const upload = multer({ dest: 'tempuploads/' });



app.use(bodyParser.json());
app.use(express.static('public'));

const readDirectory = (dirPath) => {
    const result = [];
    const items = fs.readdirSync(dirPath);
    items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        try {
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                result.push({
                    name: item,
                    path: fullPath,
                    type: 'directory'
                });
            } else {
                result.push({
                    name: item,
                    path: fullPath,
                    type: 'file'
                });
            }
        } catch (err) {
            if (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'EACCES') {
                console.warn(`Skipped: ${fullPath} (Reason: ${err.message})`);
            } else {
                throw err;
            }
        }
    });
    return result;
};

app.get('/api/folder-structure', (req, res) => {
    // const relativePath = req.query.path? AllUploadedFiles+ args;
    const relativePath = args;
    const rootPath = path.resolve(relativePath);
    console.log()
    // const rootPath = process.cwd()
    try {

        const folderStructure = readDirectory(relativePath);
        res.json(folderStructure);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/download', (req, res) => {
    const filePath = req.query.path;

    // Get the file name from the path
    const fileName = path.basename(filePath);

    // Set the Content-Disposition header to force download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Create a readable stream from the file
    const fileStream = fs.createReadStream(filePath);

    // Pipe the file stream to the response stream
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on('error', (err) => {
        console.error(err);
        res.status(500).send('Failed to download file.');
    });

    res.on('close', () => {
        console.log('File download completed');
    });
});

// API to upload a file
app.post('/api/upload', upload.array('file'), (req, res) => {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // Process each uploaded file
    req.files.forEach(file => {
        // console.log(file)
        const tempPath = file.path;
        const targetPath = path.join('AllUploadedFiles/', file.originalname);

        // Move the uploaded file to the target directory
        fs.rename(tempPath, targetPath, err => {
            if (err) {
                console.error(err);
                return res.status(500).send('Failed to upload file.');
            }
        });
    });

    res.send('Files uploaded successfully.');
});


const privateIpAddress = getPrivateIp()

console.log(privateIpAddress);

const startServer = async () => {
    const port = await detectPort(DEFAULT_PORT);
    app.listen(port, () => {
        qrcode.generate(`http://${privateIpAddress}:${port}`, { small: true }, function (qrcode) {
            console.log(qrcode);
        });
    });
  };
  
startServer()

