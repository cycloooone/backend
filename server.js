const express = require('express');
const cors = require('cors');
const app = express();
const vis = require('vis-network')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
app.use(cors());
app.use(express.json());

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://44.192.88.42:7687", neo4j.auth.basic("neo4j", "grinders-assaults-figures"));
const session = driver.session();


app.get('/find-node', (req, res) => {
  const { selectedNodeType, selectedLevel, title, name, sliderValue, sliderValue1 } = req.query;
  console.log('value0', sliderValue)
  console.log('value1', sliderValue1)
  // const sel = req.params

  // console.log(sel)
  // let query = "";
  if (selectedNodeType === "Movie") {
    
    if(selectedLevel === '1'){
      query = `MATCH (m:Movie) WHERE m.title = "${title}" RETURN m`;
    }
    else if(selectedLevel === '2'){
      query = `MATCH (m:Movie{title:'${title}'}), (p:Person), (p)-[r:ACTED_IN|DIRECTED]-(m) RETURN m,p,r`;
    }
    else[
      query = `MATCH (m:Movie{title:'${title}'}), (p:Person),(m1:Movie), (m1)<-[r1:ACTED_IN|DIRECTED]-(p)-[r:ACTED_IN|DIRECTED]->(m)
      RETURN m,p,r,r1,m1`
    ]
    
  } 
  else if (selectedNodeType === "Person") {
    if(selectedLevel === '1'){
      query = `MATCH (p:Person) WHERE p.name = "${name}" RETURN p`;
    }
    else if(selectedLevel === '2'){
      query = `MATCH (p:Person{name:'${name}'}), (m:Movie), (p)-[r:ACTED_IN|DIRECTED]-(m) RETURN m,p,r`;
    }
    else{
      query = `MATCH (p:Person{name:'${name}'}), (m:Movie),(p1:Person), (p)<-[r1:ACTED_IN|DIRECTED]->(m)<-[r:ACTED_IN|DIRECTED]-(p1)
      RETURN m,p,r,r1,p1`
    }
  }
  else if (selectedNodeType === "User"){
    if(selectedLevel === '1'){
      query = `MATCH (u:User) WHERE u.name = "${name}" RETURN u`;
    }
    else if(selectedLevel === '2'){
      query = `MATCH (u:User{name:'${name}'}), (m:Movie), (u)-[r:RATED]-(m) RETURN m,u,r limit 10`;
    }
  }
  else if (selectedNodeType === "Genre"){
    if(selectedLevel === '1'){
      query = `MATCH (g:Genre) WHERE g.name = "${name}" RETURN g`;
    }
    else if(selectedLevel === '2'){
      query = `MATCH (g:Genre{name:'${name}'}), (m:Movie), (g)-[r:IN_GENRE]-(m)
      where m.imdbRating > ${sliderValue1}
      RETURN m,g,r limit ${sliderValue}`;
    }
  }
  session
      .run(query)
      .then((result)=>{
        data = []
        result.records.forEach((record) => { 
            
            // data.push(record._fields[0].properties);
        });
        // console.log(result.records) 
        // console.log(req.query)

         
        res.json(result.records)
          // res.redirect('/');
      })
    .catch(error => {
      console.log(error)
      
    });
});




  app.get('/find-path', (req,res) => {
    query = ''
    const { selectedNodeType, selectedNodeType1, name, title, name1, title1 } = req.query;
    console.log(req.query)
    if(selectedNodeType === selectedNodeType1){
      if(selectedNodeType === 'Movie'){
        query = `match path = shortestPath((m:Movie{title:'${title}'})-[:ACTED_IN|DIRECTED*1..20]-(m1:Movie{title:'${title1}'}))
        return path
        ` 
      }
      else{
        query = `match path = shortestPath((p:Person{name:'${name}'})-[:ACTED_IN|DIRECTED*1..20]-(p1:Person{name:'${name1}'}))
        return path`
      }
    }
    else{
      if(selectedNodeType === 'Movie'){
        query = `match path = shortestPath((m:Movie{title:'${title}'})-[:ACTED_IN|DIRECTED*1..20]-(p1:Person{name:'${name1}'}))
        return path`
      }
      else{
        query = `match path = shortestPath((p:Person{name:'${name}'})-[:ACTED_IN|DIRECTED*1..20]-(m1:Movie{title:'${title1}'}))
        return path`
      }
    }
    

    session
    .run(query)
    .then((result)=>{
      data = []
      result.records.forEach((record) => { 
          
          
      });

       
      res.json(result.records)
        // res.redirect('/');
    })
  .catch(error => {
    console.log(error)
    
  });
    
    


  })
  app.get('/group-nodes', (req,res) => {
    console.log(req.query)
    const {selectedNodeType, sliderValue} = req.query
    console.log('type', selectedNodeType)
    console.log('value', sliderValue)
    let query = ''
    if(selectedNodeType === 'Movie'){
      query = `match(m:Movie) return m limit ${sliderValue}`
    }
    else if(selectedNodeType === 'Person' || selectedNodeType === 'Director' || selectedNodeType === 'Actor'){
      query = `match(p:${selectedNodeType}) return p limit ${sliderValue}`
    }
    else if(selectedNodeType === 'Genre'){
      query = `match(g:Genre) return g limit ${sliderValue}`
    }


    session
    .run(query)
    .then((result)=>{
      data = []
      result.records.forEach((record) => { 
          
          
      });

       
      res.json(result.records)
        // res.redirect('/');
    })
  .catch(error => {
    console.log(error)
    
  });
    
    
  })
  




  app.get('/expand-node', (req,res) => {
    query = ''
    const { title, label } = req.query
    console.log('title', title)
    console.log('label', label)
    if(title === 'Movie'){
      query = `MATCH (m:Movie{title:"${label}"}), (p:Person), (p)-[r:ACTED_IN|DIRECTED]-(m) RETURN m,p,r`;
    }
    else if(title === 'Person' || title === 'Actor' || title === 'Director'){
      query = `MATCH (p:Person{name:"${label}"}), (m:Movie), (p)-[r:ACTED_IN|DIRECTED]-(m) RETURN m,p,r`
    } 
    else if (title === 'Genre'){
      query = `match(g:Genre{name:"${label}"}), (m:Movie), (m)-[r:IN_GENRE]-(g) return m,g,r limit 30`
    }


    session
    .run(query)
    .then(result => {
      res.json(result.records)
    })
    .catch(error => {
      console.log(error)
    })
  })
  
  // Route to get all users
  app.get('/users', (req, res) => {
    res.json(users);
  });
  
  // Route to update the role of a user
  app.put('/users/:id/role', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    user.role = req.body.role;
    res.json(user);
  });






  

  

app.listen(3000, () => {   
  console.log('Server running on port 3000');
});






//     query = `match(p:Actor{name:"Keanu Reeves"}), (m:Movie), (p1:Person),
// (p)-[r:ACTED_IN|DIRECTED]-(m), (p1)-[r1:ACTED_IN|DIRECTED]-(m)
// return p,p1,m,r,r1`
// query = `match(p:Person{name:"Keanu Reeves"}),(p1:Person{name:"Tom Hanks"})return shortestPath((p)-[*]-(p1))`
      // query = `match(par:Person{name:"Tom Hanks"}), (maf:Movie), (par)-[r:ACTED_IN|DIRECTED]-(maf) return maf,par,r`






















      app.post('/api/register', async (req, res) => {
        const email = req.body.email;
        const username = req.body.username;
        const password = bcrypt.hashSync(req.body.password, 10);
      
        // Check if the username or email is already taken
        const result = await session.run(`MATCH (c:Consumer) WHERE c.username = $username OR c.email = $email RETURN c`, { username, email });
        if (result.records.length > 0) {
          return res.status(400).json({ message: "Username or email already taken" });
        }
      
        // Create the user in the database
        await session.run(`CREATE (c:Consumer { username: $username, email: $email, password: $password, role: 'user' })`, { username, email, password });
        res.status(201).json({ message: "User created" });
      });
      
      // Login route
      app.post("/api/login", async (req, res) => {
        console.log(req.body)
        const username = req.body.username
        const password = req.body.password
      
        try {
          // Get the user's password and role from the database
          
          const result = await session.run(`MATCH (c:Consumer { username: $username }) RETURN c.password, c.role`, { username });
          if (result.records.length === 0) {
            return res.status(400).json({ message: "Invalid username or password" });
          }
          const pass = result.records[0].get("c.password");
          const role = result.records[0].get("c.role");
          console.log()
          // Check if the password is correct
          const passwordMatch = bcrypt.compareSync(password, pass);
          if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
          }
      
          // Sign the JSON web token and return it to the client
          const token = jwt.sign({ username }, "secretkey");
          console.log(token)
          return res.json({ title: "login success", token, role, username });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "An error occurred" });
        }
      });


  app.get('/admin-panel', (req, res) => {
    
    
      // admin-specific code here
      session
      .run(`MATCH (c:Consumer) return c.username, c.role`)
      .then((result) => {
        
        res.json(result.records);
      })
    
    
  })
  app.get('/make-access', (req, res) => {
    session
      .run(`MATCH (c:Consumer) set c.role = 'superuser'`)
      .then((result) => {
        
        res.json(result.records);
      })
  })