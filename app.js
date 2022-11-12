var idUser = 0;
id = 0;
cedula = "";
carne = "";
nombreU = "";
primerapellido = "";
segundoapellido = '';
edad = "";
fecha = '';
correoU = "";

const express = require('express');
const app = express();

//2 - Para poder capturar los datos del formulario (sin urlencoded nos devuelve "undefined")
app.use(express.urlencoded({extended:false}));
app.use(express.json());//además le decimos a express que vamos a usar json

//3- Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env'});

//4 -seteamos el directorio de assets
app.use('/resources',express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

//5 - Establecemos el motor de plantillas
app.set('view engine','ejs');

const connection = require('./database/db');

//6 -Invocamos a bcrypt
const bcrypt = require('bcryptjs');

//7- variables de session
const session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

//9 - establecemos las rutas
app.get('/login',(req, res)=>{
    res.render('login');
})

app.get('/register',(req, res)=>{
    res.render('register');
})

app.get('/index',(req, res)=>{
    res.render('index');
})

app.get('/gestionclientes',(req, res)=>{
	id = idUser;
	res.render('gestionclientes',{id});
	res.end();
})

//metodo para modificar datos del cliente
app.post('/modificarCliente', async (req, res)=>{
	const idu = req.body.id;
	const cedulaN = req.body.cedula;
    const carneN = req.body.carne;
    const nombreN = req.body.nombre;
    const primerapellidoN = req.body.primerapellido;
    const segundoapellidoN = req.body.segundoapellido;
    const edadN = req.body.edad;
    const fechanacimientoN = req.body.fechanacimiento;
	const correoN = req.body.correo;
	const contraseñaN = req.body.contraseña;
	if (idu){
		//se valida si los datos ingresados estan en la base de datos
		connection.query('SELECT * FROM clientes WHERE id = ?', [idu], async (error, results)=> {
			if (results.length == 0 || results[0].id != idu){
				res.render('gestionclientes', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "ID No Existente o Incorrecto",
                    alertIcon:'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'gestionclientes'    
                });
			}else{
    			connection.query('UPDATE clientes SET cedula = ?, carne = ?, nombre = ?, primerapellido = ?, segundoapellido = ?, edad = ?, fechanacimiento = ?, correo = ?, contraseña = ? WHERE id = ?', [cedulaN, carneN, nombreN, primerapellidoN, segundoapellidoN, edadN, fechanacimientoN, correoN, contraseñaN, idu], async(error, results)=>{
        		if(error){
            		console.log(error);
        		}else{
					res.render('gestionclientes', {
						alert: true,
						alertTitle: 'Modificación de Cliente',
						alertMessage: 'Cambio Éxitoso!',
						alertIcon: 'success',
						showConfirmButton: false,
						timer: 1500,
						ruta: ''
					});
				}
    		});
		}
		});

	}else {	
		res.render('gestionclientes', {
			alert: true,
        	alertTitle: 'Advertencia',
        	alertMessage: 'Por favor ingrese datos, no puede estar vacío',
        	alertIcon: 'warning',
        	showConfirmButton: true,
        	timer: false,
        	ruta: 'gestionclientes'
		});
	}
	
});

//metodo para eliminar clientes
app.post('/eliminarCliente', async (req, res)=>{
	const idcliente = req.body.id;
	if (idcliente){
		//se valida si los datos ingresados estan en la base de datos
		connection.query('SELECT * FROM clientes WHERE id = ?', [idcliente], async (error, results)=> {
			if (results.length == 0 || results[0].id != idcliente){
				res.render('gestionclientes', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "ID No Existente o Incorrecto",
                    alertIcon:'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'gestionclientes'    
                });
			}else{
				connection.query("DELETE FROM clientes WHERE id = ?",[idcliente]);
				if(error){
					console.log(error);
				}else{            
					res.render('gestionclientes', {
						alert: true,
						alertTitle: "Eliminación Cliente",
						alertMessage: "¡Cliente Eliminado con Éxito!",
						alertIcon:'success',
						showConfirmButton: false,
						timer: 1500,
						ruta: 'gestionclientes'
					});
						
				}
			}
		});
	}else {	
		res.render('gestionclientes', {
			alert: true,
        	alertTitle: 'Advertencia',
        	alertMessage: 'Por favor ingrese un ID',
        	alertIcon: 'warning',
        	showConfirmButton: true,
        	timer: false,
        	ruta: 'gestionclientes'
		});
	}
});

//10 - Método para la REGISTRACIÓN
app.post('/register', async (req, res)=>{
    const cedula = req.body.cedula;
    const carne = req.body.carne;
    const nombre = req.body.nombre;
    const primerapellido = req.body.primerapellido;
    const segundoapellido = req.body.segundoapellido;
    const edad = req.body.edad;
    const fechanacimiento = req.body.fechanacimiento;
	const correo = req.body.correo;
	const pass = req.body.pass;
	let passwordHash = await bcrypt.hash(pass, 8);
    connection.query('INSERT INTO clientes SET ?',{cedula:cedula, carne:carne, nombre:nombre, primerapellido:primerapellido, segundoapellido:segundoapellido,
         edad:edad, fechanacimiento:fechanacimiento, correo:correo, contraseña:pass}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{            
			res.render('register', {
				alert: true,
				alertTitle: "Registro",
				alertMessage: "¡Registro Éxitoso!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: 'login'
			});
            //res.redirect('/');         
        }
	});
})





//11 - Metodo para la autenticacion
app.post('/auth', async (req, res)=> {
	const correo = req.body.correo;
	const pass = req.body.contraseña;
	let passwordHash = await bcrypt.hash(pass, 8);    
	if (correo && pass) {
		connection.query('SELECT * FROM clientes WHERE correo = ?', [correo], async (error, results, fields)=> {
			if( results.length == 0 || results[0].contraseña != pass) {    
				res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "USUARIO y/o PASSWORD incorrectas",
                    alertIcon:'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'    
                });				
			} else {         
				//creamos una var de session y le asignamos true si INICIO SESSION       
				req.session.loggedin = true;
				req.session.id = results[0].id;
				idUser= results[0].id;                
				req.session.nombre = results[0].nombre;
				nombreU = results[0].nombre;
				correoU = results[0].correo.toString();
				res.render('login', {
					alert: true,
                    alertTitle: 'Inicio Sesión',
                    alertMessage: '¡Inicio de Sesión Éxitoso!',
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: ''
				
				});        			
			}			
		});
		
	} else {	
		res.render('login', {
			alert: true,
        	alertTitle: 'Advertencia',
        	alertMessage: 'Por favor ingrese un Usuario y/o Password',
        	alertIcon: 'warning',
        	showConfirmButton: true,
        	timer: false,
        	ruta: 'login'
		});
	}
});

//12 - Método para controlar que está auth en todas las páginas
app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			nombre: nombreU,
			correo: correoU	
		});		
	} else {
		res.render('index',{
			login:false,
			nombre:'Debe iniciar sesión',			
		});				
	}
});


//función para limpiar la caché luego del logout
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

 //Logout
//Destruye la sesión.
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
});


app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
});

