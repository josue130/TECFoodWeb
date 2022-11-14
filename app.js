var idUser = 0;
id = 0;
cedulaA = "";
carneA = "";
nombreA = "";
primerapellidoA = "";
segundoapellidoA = '';
edadA = "";
fechaA = '';
correoA = "";

correoU = "";
nombreU = "";

cedulaC = "";
carneC = "";
nombreC = "";
primerapellidoC = "";
segundoapellidoC = '';
edadC = "";
fechaC = '';
correoC = "";
AlimentosU = "";
AlimentosFactura ="";
AlimentosTotal="";
NumeroCompra =0;
Date_ = "";
total = 0;
const express = require('express');
const app = express();
const nodemailer = require('nodemailer')
const {jsPDF} = require('jspdf');
const QRCode = require('qrcode');

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
	cedulaA = cedulaC;
	carneA = carneC;
	nombreA = nombreC;
	primerapellidoA = primerapellidoC;
	segundoapellidoA = segundoapellidoC;
	edadA = edadC;
	fechaA = fechaC;
	correoA = correoC;
	res.render('register',{cedulaA,carneA,nombreA,primerapellidoA,segundoapellidoA,edadA,fechaA,correoA});
})

app.get('/index',(req, res)=>{
    res.render('index');
})

app.get('/index2',(req, res)=>{
    res.render('index2');
})


app.get('/gestionAlimentos',(req, res)=>{
	id = idUser;
	res.render('gestionAlimentos',{id});
	res.end();
})

app.get('/gestionclientes',(req, res)=>{
	connection.query('SELECT * from pedidos where id = ?',[0],async(error,results)=> {
		if (error){
			console.log(error);
		}
		else{
			console.log(results);
			
			all = results;
			res.render('gestionclientes',{all:all, id:id });
			res.end();
		}
	})
})

app.get('/gestionTiemposComida', (req, res)=>{
	res.render('gestionTiemposComida',{
		nombre: nombreU,
		correo: correoU
	});
})


//MIo
app.get('/Compra',(req, res)=>{
	let all = [];
	connection.query('SELECT * from comida where Tipo ="PlatoPrincipal" and Tiempo = "Almuerzo" and Disponibilidad = "Si"',async(error,results)=> {
        if (error){
            console.log(error);
        }
        else{
			console.log(results);
            all = results;
			res.render('CompraAlimentos',{all:all});
			res.end();
        }
    })
	
    
})
//MIo
app.get('/Carrito',(req, res)=>{
	let all = [];
	total = 0;
	AlimentosU = "";
	connection.query('SELECT * from carrito where Correo = ?',correoC,async(error,results)=> {
        if (error){
            console.log(error);
        }
        else{
			console.log(results);
			for( const suma in results){
				total += results[suma].Precio * results[suma].Cantidad
				AlimentosU += results[suma].Nombre +","
				console.log(total);
			}

            all = results;
			res.render('Carrito',{all:all,Total:total});
			res.end();
        }
    })
	
})
//MIo
app.post('/EliminarCarrito',(req, res)=>{
	let all = [];
	total = 0;
	var id = req.body.ID;
	AlimentosU = "";
	connection.query('DELETE from carrito where id = ?',[id],async(error,results)=> {
        if (error){
            console.log(error);
        }
        else{
			connection.query('SELECT * from carrito where Correo = ?',[correoC],async(error,results)=> {
				if (error){
					console.log(error);
				}
				else{
					console.log(results);
					for( const suma in results){
						total += results[suma].Precio * results[suma].Cantidad
						AlimentosU += results[suma].Nombre +","
						console.log(total);
					}
		
					all = results;
					res.render('Carrito',{all:all,Total:total});
					res.end();
				}
			})	
        }
    })
	
})
//MIo
app.post('/Seleccion', async (req, res)=>{
	var Seleccion1 = req.body.Seleccion1;
	var Seleccion2 = req.body.Seleccion2;
	if (Seleccion1 ==0){
		Seleccion1 = "Desayuno";
	}
	if (Seleccion1 ==1){
		Seleccion1 = "Almuerzo";
	}
	if (Seleccion1 ==2){
		Seleccion1 = "Cena";
	}
	if (Seleccion2 ==0){
		Seleccion2 = "Bebida";
	}
	if (Seleccion2 ==1){
		Seleccion2 = "Postre";
	}
	if (Seleccion2 ==2){
		Seleccion2 = "PlatoPrincipal";
	}
	
	let all = [];
	console.log(Seleccion1);

	connection.query('SELECT * from comida where Tipo =? and Tiempo = ? and Disponibilidad = "Si"',[Seleccion2,Seleccion1],async(error,results)=> {
        if (error){
            console.log(error);
        }
        else{
			console.log(results);
            all = results;
			res.render('CompraAlimentos',{all:all});
			res.end();
        }
    })

	
	
})
//MIo
app.post('/Compra',async (req, res)=>{
	var ID = req.body.ID;
	var Cantidad = req.body.Cantidad;
	console.log(ID);
	console.log(Cantidad);
	connection.query('SELECT * from comida where ID=? and Disponibilidad = "Si"',[ID],async(error,results)=> {
        if (error){
            console.log(error);
        }
        else{
			var Nombre = results[0].Nombre;
			var Precio = results[0].Precio;
			connection.query('INSERT INTO carrito SET ?',{Nombre:Nombre,Precio:Precio,Cantidad:Cantidad,Correo:correoC}, async (error, results)=>{
			   if(error){
				   console.log(error);
			   }else{              
				   res.redirect('/Compra');         
			   }
		   });

        }
    })
})

//MIo
app.post('/ComprarCarrito',async (req, res)=>{
	const tiempoTranscurrido = Date.now();
	
	const hoy = new Date(tiempoTranscurrido);
	Date_=hoy.toDateString(); 
	const NombreCompra = nombreC + " " + primerapellidoC + " " + segundoapellidoC;
	AlimentosFactura = AlimentosU;
	AlimentosTotal = total;
	total = 0;
	connection.query('INSERT INTO pedidos SET ?',{fecha:hoy.toDateString(),carne:carneC,cedula:cedulaC,nombreCompleto:NombreCompra,correo:correoC,alimentos:AlimentosU}, async (error, results)=>{
	   if(error){
		   console.log(error);
	   }else{            
		connection.query('DELETE FROM carrito WHERE correo = ?',[correoC], async (error, results)=>{
			if(error){
				console.log(error);
			}else{     
				AlimentosU = "";
				console.log(cedulaC)
				connection.query('SELECT * FROM pedidos WHERE cedula = ?',[cedulaC] , async (results)=> {
					for( const suma in results){
						NumeroCompra = results[suma].id;
						console.log(NumeroCompra);
					}
				});
				connection.query('SELECT * from carrito where Correo = ?',[correoC],async(error,results)=> {
					if (error){
						console.log(error);
					}
					else{
						console.log(results);
						for( const suma in results){
							total += results[suma].Precio * results[suma].Cantidad
							AlimentosU += results[suma].Nombre +","
							console.log(total);
						}
						all = results;
						sendPDF();
						res.render('Carrito',{all:all,Total:total});
						res.end();
					}
				})      

			}
		});
		           
	   }
   });
})


app.post('/agregar_alimento', async (req, res)=>{
    const nombre = req.body.nombre_alimento;
    const disponibilidad = req.body.disponibilidad;
    const tipo = req.body.tipo;
    const precio = req.body.precio;
    connection.query('INSERT INTO comida SET ?',{Nombre:nombre, Disponibilidad:disponibilidad, Tipo:tipo, Precio:precio}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{          
			res.render('gestionAlimentos', {
				alert: true,
				alertTitle: "Alimento Agredado",
				alertMessage: "¡Registro de Alimento Exitoso!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: 'gestionAlimentos'
			});      
        }
	});
});


app.post('/modificar_alimento', async (req, res)=>{
	const id_alimento = req.body.id_alimento;
    const nombre_alimento = req.body.nombre_alimento;
    const disponibilidad = req.body.disponibilidad;
    const tipo = req.body.tipo;
    const precio = req.body.precio;
	if (id_alimento){
		//se valida si los datos ingresados estan en la base de datos
		connection.query('SELECT * FROM comida WHERE id = ?', [id_alimento], async (error, results)=> {
			if (results.length == 0 || results[0].id != id_alimento){
				res.render('gestionAlimentos', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "ID No Existente o Incorrecto",
                    alertIcon:'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'gestionAlimentos'    
                });
			}else{
    			connection.query('UPDATE comida SET Nombre = ?, Disponibilidad = ?, Tipo = ?, Precio = ? WHERE id = ?', [nombre_alimento, disponibilidad, tipo, precio, id_alimento], async(error, results)=>{
        		if(error){
            		console.log(error);
        		}else{
					res.render('gestionAlimentos', {
						alert: true,
						alertTitle: 'Modificación de Alimento',
						alertMessage: 'Cambio Éxitoso!',
						alertIcon: 'success',
						showConfirmButton: false,
						timer: 1500,
						ruta: 'gestionAlimentos'
					});
				}
    		});
		}
		});

	}else {	
		res.render('gestionAlimentos', {
			alert: true,
        	alertTitle: 'Advertencia',
        	alertMessage: 'Por favor ingrese datos, no puede estar vacío',
        	alertIcon: 'warning',
        	showConfirmButton: true,
        	timer: false,
        	ruta: 'gestionAlimentos'
		});
	}
	
});


app.post('/eliminar_alimento', async (req, res)=>{
	const id_alimento = req.body.id;
	if (id_alimento){
		//se valida si los datos ingresados estan en la base de datos
		connection.query('SELECT * FROM comida WHERE id = ?', [id_alimento], async (error, results)=> {
			if (results.length == 0 || results[0].id != id_alimento){
				res.render('gestionAlimentos', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "ID No Existente o Incorrecto",
                    alertIcon:'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'gestionAlimentos'    
                });
			}else{
				connection.query("DELETE FROM comida WHERE id = ?",[id_alimento]);
				if(error){
					console.log(error);
				}else{            
					res.render('gestionAlimentos', {
						alert: true,
						alertTitle: "Eliminación Alimento",
						alertMessage: "Alimento Eliminado con Éxito!",
						alertIcon:'success',
						showConfirmButton: false,
						timer: 1500,
						ruta: 'gestionAlimentos'
					});
						
				}
			}
		});
	}else {	
		res.render('gestionAlimentos', {
			alert: true,
        	alertTitle: 'Advertencia',
        	alertMessage: 'Por favor ingrese un ID',
        	alertIcon: 'warning',
        	showConfirmButton: true,
        	timer: false,
        	ruta: 'gestionAlimentos'
		});
	}
});


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
app.post('/historialCliente', async (req, res)=>{
	let all = [];
	const idcliente = req.body.id;
	console.log(idcliente)
	if (idcliente){
		//se valida si los datos ingresados estan en la base de datos
		connection.query('SELECT * FROM pedidos WHERE cedula = ?', [idcliente], async (error, results)=> {
			if (results.length == 0 || results[0].cedula != idcliente){
				res.render('gestionclientes', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Cedula No Existente o Incorrecto",
                    alertIcon:'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'gestionclientes'    
                });
			}else{
				if(error){
					console.log(error);
				}else{
				     
					all = results;
					res.render('gestionclientes',{all:all});
					res.end();       
						
				}
			}
		});
	}else {	
		res.render('gestionclientes', {
			alert: true,
        	alertTitle: 'Advertencia',
        	alertMessage: 'Por favor ingrese una Cedula',
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
			const a = correoC;
			console.log (correoU, a)
			var mailRegistro = {
				from: 'tecfoodweb@gmail.com',
				to: correo,
				subject: 'Registro de Bienvenida',
				text: 'Gracias por registrarse en nuestra plataforma \nCedula: ' +cedula+ '\nCarne: ' +carne+ '\nNombre: ' +nombre+ '\nPrimer Apellido: ' +primerapellido+
				'\nSegundo Apellido: ' +segundoapellido+ '\nEdad: ' +edad+
				'\nFecha Nacimiento: ' +fechanacimiento+ '\nCorreo: ' +correo+ '\n\nAtt: TecFood Web'	
			}
			//se envia el comprobante de la transferencia
			transporter.sendMail(mailRegistro, function(error, info){
				if (error) {
					console.log(error);
				} else {
						console.log('Correo enviado: ' + info.response);
					}
			});            
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
	correoU = correo;
	nombreU = req.body.nombre;
	let passwordHash = await bcrypt.hash(pass, 8);    
	if (correo && pass) {
		if (correo == "admin@itcr.cr" && pass == "admin123"){
			
			res.render('login', {
				alert: true,
				alertTitle: 'Inicio Sesión',
				alertMessage: '¡Inicio de Sesión Éxitoso!',
				alertIcon: 'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: 'index'
			
			});

		}else{
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
					nombreC = results[0].nombre;
					correoC = results[0].correo.toString();
					cedulaC = results[0].cedula;
					carneC = results[0].carne;
					
					primerapellidoC = results[0].primerapellido;
					segundoapellidoC = results[0].segundoapellido;
					edadC = results[0].edad;
					fechaC = results[0].fechanacimiento;
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

		}
		
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
		res.render('index2',{
			login: true,
			nombre: nombreU,
			correo: correoU	
		});		
	} else {
		res.render('index2',{
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

var transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	auth: {
	  user: 'tecfoodweb@gmail.com',
	  pass: 'hnqagnceljerjump'
	}
  });
  const sendPDF = async() =>{
	let pdfOutput = await cretePDF();
	transporter.sendMail({
		from: 'tecfoodweb@gmail.com',
		to: correoC,
		subject: 'Factura de compra',
		text : "Gracias por su compra",
		attachments : [{path:pdfOutput}]

	});
  }

  const pdf = new jsPDF({
	orientation: "portrait",
	unit: "cm",
	format: "a4",

  });
  const cretePDF = async() =>{
	let qrCode = await QRCode.toDataURL("Su numero de compra:"+NumeroCompra+"\n" + "Fecha:"+Date_ + "\n" + "Carné:" + carneC);
	pdf.setTextColor(0,0,0);
	pdf.setFontSize(20);
	pdf.text("FACTURA DE COMPRA \n\nCompañia TECFood \n\nItems comprados: " + "\n" + AlimentosFactura +"\n"+ "El monto total pagado:" + AlimentosTotal + "\n\nGracias por su compra",1.5,3.5);
	pdf.addImage(qrCode,"JPEG",14,1,5,5);
	pdf.save("Test1.pdf");
	const pdfOutput = pdf.output("datauristring");
	return pdfOutput;


  };

app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
});

