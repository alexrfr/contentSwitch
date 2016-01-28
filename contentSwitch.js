var chokidar  = require('chokidar');
var fs        = require('fs');
var path      = require('path');

var folderEntry = './inbox';
var folderSend  = './finish/';

// Create required folders if not exists
function createFolder(path, mask, callback) {
  if (typeof mask == 'function') {
    callback = mask;
    mask = 0777;
  }

  fs.mkdir(path, mask, function(err) {
    if (err) {
      if (err.code == 'EEXIST') callback(null);
      else callback(err);
    } else callback(null);
  });
}

//createFolder(__dirname + '/temp', function(err) {
createFolder(folderEntry, function(err) {
  if (err) {
    console.error(err);
  }
});

//createFolder(__dirname + '/files', function(err) {
createFolder(folderSend, function(err) {
  if (err) {
    console.error(err);
  }
});

// =====================================
// WATCHER ================================
// =====================================
// Está a la escucha de nuevos documentos.
var watcher = chokidar.watch(folderEntry, {
  //ignored: /[\/\\]\./,
  //Ignoramos los ficheros que empiezan por '.' y los que terminan en *.md5
  ignored: [/[\/\\]\./,/^.*.pdf$/,],
  persistent: true
});

watcher.on('add', function(file, stats) {
  console.log('************* NUEVO FICHERO: [' + file + ']');
  fs.stat(file, function(err, stat) {
    if (err) {
      return console.log(err);
    }
    //Esperamos unos segundos a que el documento se haya cargado y ejecutamos el checkfile
    setTimeout(checkFile, 1000, file, stat);
  });
});

function checkFile(file, prev) {
  fs.stat(file, function(err, stat) {
    if (err) {
      return console.log(err);
    }
    if (stat.mtime.getTime() === prev.mtime.getTime()) {
      logReader(file);
    } else {
      setTimeout(checkFile, 5000, file, stat);
    }
  });
}

// =====================================
// TXT SWITCHER ========================
// =====================================
// Lee del fichero txt
function logReader(file) {
  fs.exists(file, function(exists) {
    if (exists) {
      // Leemos el contenido
      fs.readFile(file, 'utf8', function(err, fileData) {
        if( err ){
          console.log('************* TXT SWITCHER : ERROR');
          console.log(err);
          console.log("*********************** ****************** ******************** ********************");
          return console.log(err);
        }
        else{
          var result = fileData.replace(/:/g, ';');
          fs.writeFile(file, result, 'utf8', function (err) {
            if( err ){
              console.log('************* TXT SWITCHER : ERROR al escribir el resultado');
              console.log(err);
              console.log("*********************** ****************** ******************** ********************");
              return console.log(err);
            }
            else{
              changeFolder(file, folderSend);
            }
          });
        }
      });
    } else {
      console.log('************* LOG READER : ERROR - No se ha encontrado el fichero[' + file + ']');
    }
  });
}

// =====================================
// CHANGE FOLDER =======================
// =====================================
// Lo deja en la carpeta de procesados.
// name: nombre del documento
// path: path origen + Nombre del documento
// folderPath: directorio destino
function changeFolder(pathName, folderPath){
  var fileName = path.basename(pathName);
  var newPath = folderPath + fileName;
  fs.renameSync(pathName, newPath);
  console.log('************* FICHERO MOVIDO: [' + file + ']');
}
