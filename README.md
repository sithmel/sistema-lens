# sistema-lens

This package visualise the dependency graph of a sistema registry.
It helps understanding the code in a visual way.

![graph](https://user-images.githubusercontent.com/460811/37313595-dda352c0-2647-11e8-86fd-da7f6055ebf5.png)

## How to use it

The dependency graph is a self contained interactive HTML file that is returned by `lens`.
Here's an example on how to use it with express:

```js
const express = require("express");
const lens = require("sistema-lens");

const app = express();

app.get("/", (req, res) => {
  res.send(
    lens(
      d.getAdjacencyList(),
      new Map([
        [a, "Info about a"],
        [b, "Info about b"],
        [c, "Info about c"],
        [d, "Info about d"],
      ]),
      { title: "Test Lens" }
    )
  );
});

app.listen(3000, () => console.log("Listening at: http://localhost:3000"));
```

The HTML displays an interactive representation of the dependency graph.
**lens** takes 3 arguments:

- an adjacency list as returned by the getAdjacencyList function or methods in [sistema](https://github.com/sithmel/sistema)
- a map of dependencies and strings to enrich the graph of information
- an option object that allows to set the title of the page

![graph2](https://user-images.githubusercontent.com/460811/37313680-339d43b6-2648-11e8-987a-6f14c26809a6.png)

## Different usages

getAdjacencyList in sistema allows to list:

- all dependencies required for returning a specific one (getAdjacencyList as a dependency method)
- all graph of dependencies belonging to a context (getAdjacencyList as a context method)
- any combination of dependencies using the getAdjacencyList function
