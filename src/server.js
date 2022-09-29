import net from "node:net";
import { DB } from "./database/db.js";
import sqlite3 from "sqlite3";

var hosts = [];

// Conecção do Banco de Dados
var base = new sqlite3.Database("./database/data_hidrome.db", (err) => {
  if (err) {
    console.log(err.message);
  }

  console.log("Conectado ao banco data_hidrometro");
});

var socket_server = net.createServer(async function (connection) {
  console.log(connection.address().port + "\n");

  // connection.write("Comunicação Estabelecida!\n");
  connection.on("data", async (message) => {
    var dados = message.toString();
    // recebe dados do hidrometro
    if (dados.includes("/hidrometro")) {
      // Cabeçalho da chamada
      var hidro_socket = JSON.parse(dados);
      var host_hidro = hidro_socket.require.Host;
      var method_call = hidro_socket.require.Method;
      var date_hidro = hidro_socket.require.Date;
      var server_port = hidro_socket.require.Server_port;
      console.log("Endereço: " + host_hidro);
      // Dados do hidrometro
      var hidrometro = hidro_socket.hidrometro;

      // não permite endereços duplicados
      if (hosts.indexOf(host_hidro) == -1) {
        hosts.push(host_hidro);
      }

      connection.write("HTTP 200 OK");

      if (
        method_call.split(" ")[0] == "POST" &&
        method_call.split(" ")[1] == "/hidrometro"
      ) { 
        // Salva os dados do hidrometro no Banco
        console.log(hidrometro);

        var matricula = hidrometro.matricula;
        var regiao = hidrometro.regiao;
        var valvula = hidrometro.val_controle;
        var vasao = hidrometro.vasao;
        var queryInsert = `INSERT INTO hidro(matricula, regiao, vasao, valvula,date,host,server_port) VALUES (?,?,?,?,?,?,?)`;

        base.run(
          queryInsert,
          [
            `${matricula}`,
            `${regiao}`,
            vasao,
            valvula,
            date_hidro,
            `${host_hidro}`,
            server_port,
          ],
          (err) => {
            if (err) {
              console.log(err.message);
            } else {  
              console.log("ADdress");
            }
          }
        );
      }
    } else {
      /**
       * IMPLEMENTAÇÃO DE ROTAS
       */

      // console.log(dados.split("\n"));
      var request = dados.split("\n");
      var metodo = request[0];

      var verbo_http = metodo.split(" ")[0];
      var url = metodo.split(" ")[1];

      console.log(url);

      if (url === "/") {
        // Header HTTP
        connection.write(
          "HTTP/1.1  200 OK\n" +
            "Content-Type: application/json\n" +
            "Access-Control-Allow-Origin: *\n\n"
        );
        //FAZ A BUSCA DE TODOS OS DADOS NA BASE DE DADOS
        base.all(
          "SELECT DISTINCT matricula,regiao,valvula FROM hidro GROUP by matricula",
          (err, data) => {
            if (err) {
              connection.write(err.message);
            } else {
              console.log(data);
              connection.write(JSON.stringify(data)); // envia os dados
            }
          }
        );
        connection.pipe(connection).setTimeout(1000, () => {
          console.log("closing connection");
          connection.end();
        });
      }

      if (url == "/matricula_hidro") {
        connection.write(
          "HTTP/1.1  200 OK\n" + "Content-Type: application/json\n\n"
        );
        connection.write("Todos os Hidro");

        connection.pipe(connection).setTimeout(5000, () => {
          console.log("closing connection");
          connection.end();
        });
      }

      if (url.includes("/matricula_hidro/id")) {
        var url2 = url.split("=");
        var valueID = Number.parseInt(url2[1]);

        // FAZ A BUSCA DE UM HIDROMETRO ESPECÍFICO
        var querySelectId = "SELECT * FROM hidro WHERE matricula = ?";
        var matri = valueID;

        connection.write(
          "HTTP/1.1  200 OK\n" +
            "Content-Type: application/json\n" +
            "Access-Control-Allow-Origin: *\n\n"
        );

        base.all(querySelectId, [matri], (err, rows) => {
          if (err) {
            connection.write(err.message);
          } else {
            connection.write(JSON.stringify(rows));
          }
        });

        connection.pipe(connection).setTimeout(1000, () => {
          console.log("closing connection");
          connection.end();
        });
      }

      if (url == "/altera_hidro/:id") {
        connection.write(
          "HTTP/1.1  200 OK\n" + "Content-Type: application/json\n\n"
        );
        connection.write("Alterar dados do hidrometro");
        connection.pipe(connection).setTimeout(5000, () => {
          console.log("closing connection");
          connection.end();
        });
      }
    }
  });

  connection.setTimeout(10000, () => {
    //Rever
    connection.on("end", () => {
      console.log("Disconnecting");
    });
  });
});

socket_server.listen(3001, () => {
  console.log("Server listen port 3001");
});
