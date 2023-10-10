var express=require("express");
var admin = require("firebase-admin");
var cors = require("cors");
var keys=require("./keys.json");

admin.initializeApp({
    credential:admin.credential.cert(keys)
});
var micuenta=admin.firestore();
var conexion=micuenta.collection("usuarios");

var app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
var port=process.env.PORT || 3000;
app.listen(port,()=>{
    console.log("Servidor en http://localhost:3000");
});

app.get("/mostrarUsuarios",async(req,res)=>{
    var datos=[];
    try{
        var usuarios=await conexion.get();
            usuarios.forEach(usuario => {
                var usu=usuario.data();
                usu.id=usuario.id;
                datos.push(usu)
            });
            res.status(200).json(datos);
    }
    catch(err){
        res.status(400).json("Error al mostrar los usuarios"+err);
    }
});

async function buscarPorID(id){
    var user;
    try{
        var user=(await conexion.doc(id).get()).data();
    }
    catch(err){
        console.log("Error al recuperar al usuario "+err);
    }
    return user;
}

app.get("/buscarUsuarioPorId/:id",async(req,res)=>{
    var user=await buscarPorID(req.params.id);
    if (user!=undefined){
        res.status(200).json(user);
    }
    else{
        res.status(400).json("Error al recuperar al usuario");
    }
   
});

app.post("/nuevoUsuario", async(req,res)=>{
    console.log(req.body);
    try{
        await conexion.doc().set(req.body);
        res.status(200).json("Usuario registrado correctamente");
    }
    catch(err){
        res.status(400).json("Error al registrar nuevo usuario ...... "+err);
    }
});

app.post("/editarUsuario", async(req,res)=>{
    var user=await buscarPorID(req.body.id)
    if (user!=undefined){
        try{
            await conexion.doc(req.body.id).set(req.body);
            res.status(200).json("Registro modificado correctamente");
        }
        catch(err){
            res.status(400).json("Error al modificar al usuario ...... "+err);
        }
    }
    else{
        res.status(400).json("Error al modificar al usuario (el id no existe en la BD)...... ");
    }
});

app.get("/borrarUsuario/:id", async(req,res)=>{
    var user=await buscarPorID(req.params.id)
    if (user!=undefined){
        try{
            await conexion.doc(req.params.id).delete();
            res.status(200).json("Usuario borrado correctamente");
        }
        catch(err){
            res.status(400).json("Error al borrar al usuario ...... "+err);
        }
    }
    else{
        res.status(400).json("Error al borrar al usuario (el id no existe en la BD)...... ");
    }
});