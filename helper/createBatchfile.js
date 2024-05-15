const fs = require('fs');


  const rootPath = process.cwd()
  const drive =  rootPath.split(':')[0]
  const content = `set "currentDir=%cd%"
@REM echo %currentDir%
cd /d ${drive}:
cd ${rootPath}
echo %currentDir% - %cd%

npm start "%currentDir%"`

 
  fs.writeFile('FileShare.bat', content, (err) => {
    if (err) throw err;
    console.log('File has been created and data written to it.');
  });