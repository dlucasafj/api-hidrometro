import sqlite3 from "sqlite3";

var sql =
  "CREATE TABLE hidrometro (matricula INTEGER PRIMARY KEY, regiao TEXT NOT NULL, vasao INTEGER not null, valvula INTEGER NOT NULL)";


export class DB{

  init(){

  
    this.db = new sqlite3.Database("data_hidrome.db", (err) => {
      if (err) {
        console.log(err.message);
      }
    
      console.log("Conectado ao banco data_hidrometro");
    
    
    });
  }


   querySelect(){
    var querySelect ="SELECT * FROM hidro"
    this.db.all(querySelect,async (err,data)=>{
      if(err){
        console.log(err.message)
        return err;
      }

      return data
    })
  }

  queryInsert(matricula, regiao,vasao,valvula){
    var queryInsert= `INSERT INTO hidro(matricula, regiao, vasao, valvula) VALUES (?,?,?,?)`
    this.db.run(queryInsert,[`${matricula}`,`${regiao}`,`${vasao}`,`${valvula}`],(err)=>{
        if(err){
          console.log(err.message)
        }else{
          console.log("ADdress")
        } 
    })
  }
}



// var testando = new DB();
// testando.init()
// var data = testando.querySelect()

// console.log(data)



