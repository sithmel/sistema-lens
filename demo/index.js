const { Dependency, ResourceDependency } = require("sistema");
const lens = require("../src/server");
const express = require("express");

const app = express();

a = new Dependency("a");
b = new ResourceDependency("b").dependsOn(a);
c = new ResourceDependency("c").dependsOn(a, b);
d = new Dependency("d").dependsOn(b, c);

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
