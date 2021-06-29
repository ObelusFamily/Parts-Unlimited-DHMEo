const fetch = require("node-fetch");

const fetchData =  (params = {}) => {
  const {query = ''} = params
  const url = `http://localhost:3000/${query}`;

  return fetch(url ,params)
  }

  const headers = {
    Authorization: "Bearer " + process.env.TOKEN,
    "Content-Type": "application/json",
  };
  const request = {
    method: "POST",
    query: "api/items",
    headers,
    body: JSON.stringify({
        item: { title:'test',description:'test', image:'test', tag_list:["test", "favorite", "wilco"], slug : 'this is slug' }
    })
  };
  fetchData(request).then(data=>{console.log("item", data)}).catch(err=>{console.log("err", err)})