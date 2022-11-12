//2 - Invocamos a MySQL y realizamos la conexion
//se establecen los paramentros para conectar a la base de datos en mysql
const mysql = require('mysql');
const connection = mysql.createConnection({
    //Con variables de entorno
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
});
//se establece la conexion
connection.connect((error)=>{
    if (error) {
      console.error('El error de conexión es: ' + error);
      return;
    }
    console.log('¡Conectado a la Base de Datos!');
  });

  module.exports = connection;