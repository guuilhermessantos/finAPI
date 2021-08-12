const { request, response } = require("express");
const express = require("express")
const { v4: uuidv4} = require ("uuid")
const app  = express();

app.use(express.json())

const customers = [];

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */

/**
 * Middleware
 * Fluxo: Percorre a rota// ao entrar na rota entra no Middleware primareio
 */
function verifyIfExistsAccountCPF(request, response, next ) {
  const { cpf } = request.headers;
  const customer = customers.find((customer) => customer.cpf === cpf)

  if (!customer) { // se n tiver preenchido
    return response.status(400).json({error: "Custom not found"})

}
request.customer = customer;

return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => { //reduce()
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);
  return balance;
}


app.post("/account", (request, response) => {
  const {cpf, name} = request.body

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf //verificando no array fazendo uma busca com o .some retornando verdadeiro ou falso na verificação
    ); 

    if (customerAlreadyExists) {
      return response.status(400).json({error: "Customer already exists!"})
    }
  

  customers.push ({
    cpf,
    name,
    id: uuidv4(),
    statement: []
  })

  return response.status(201).send();

})


// app.use(verifyIfExistsAccountCPF) -- todas as rotas que estiver em baixo desse app.use passa pelo middleware chamado
app.get("/statement", verifyIfExistsAccountCPF, (request, response) => { // passando middleware como ssegundo parametro// se por na rota, so a rota usa o middleware
  const { customer } = request;
  return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const {description, amount} = request.body // utilizando body

  const {customer} = request

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).send()

})

app.post("/withdraw", verifyIfExistsAccountCPF, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;
  const balance = getBalance(customer.statement);
  if (balance < amount) {
    return response.status(400).json({ error: "Insufficient founds!" });
  }
  const statementOperation = {
    amount,
    create_at: new Date(),
    type: "debit",
  };
  customer.statement.push(statementOperation);
  return res.status(201).send();
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const {description, amount} = request.body // utilizando body

  const {customer} = request

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).send()

})

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const {description, amount} = request.body // utilizando body

  const {customer} = request

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).send()

})

app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => { 
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + " 00:00");

  // formatando data para o formato -> 10/10/2021
  const statement = customer.statement.filter(
    (statement) => 
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
    );

  return response.json(statement);
});

app.put("/account", verifyIfExistsAccountCPF, (request, response) => { // alterando dados do user
  const {name} = request.body;
  const { customer } = request;
  
  console.log(name);
  console.log(customer);

  customer.name = name
  
  return response.status(201).send()
})

app.get("/account", verifyIfExistsAccountCPF, (request, response) => {
  
  const {custumer} = request

  return response.json(customers)
})

app.delete("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  // função js splice()
  customers.splice(customer, 1) // chamando array dps função splice passando 2 parametros 1 parametro e aonde vai iniciar a remoção,2 parametro quantas posições // exemplificando 1 parametro para identificar e outro para remover mais ou apenas 1

  return response.status(200).json(customers)
})

app.get("/balance", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement);

  return response.json(balance);

})
app.listen(3333,  () => console.log("🔥 Servidor rodando!"))

