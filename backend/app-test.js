let mongoose = require("mongoose");
let server = require("./app");
let chai = require("chai");
const chaiHttp = require('chai-http'); // Correct for CommonJS

chai.should();
chai.use(chaiHttp);

describe("Goals API Suite", () => {
  // Before tests, ensure the database is clean
  before(async () => {
    // Ensure mongoose.connection is connected before performing any operation
    await mongoose.connection.collections.goals.drop().catch(err => {
      console.log("Error dropping goals collection: ", err); // Handle any potential errors here
    });
  });

  /**
   * Test the GET /goals route
   */
  describe("GET /goals", () => {
    it("it should fetch all goals (initially empty)", async () => {
      const res = await chai.request(server).get("/goals");
      res.should.have.status(200);
      res.body.should.have.property("goals").that.is.an("array").that.is.empty;
    });
  });

  /**
   * Test the POST /goals route
   */
  describe("POST /goals", () => {
    it("it should create a new goal", async () => {
      const goal = { text: "Learn unit testing" };
      const res = await chai.request(server).post("/goals").send(goal);
      res.should.have.status(201);
      res.body.should.have.property("goal");
      res.body.goal.should.have.property("text").eql(goal.text);
    });

    it("it should not create a goal without text", async () => {
      const goal = { text: "" };
      const res = await chai.request(server).post("/goals").send(goal);
      res.should.have.status(422);
      res.body.should.have.property("message").eql("Invalid goal text.");
    });
  });

  /**
   * Test the DELETE /goals/:id route
   */
  describe("DELETE /goals/:id", () => {
    it("it should delete a goal", async () => {
      const goal = new mongoose.model("Goal")({ text: "Goal to delete" });
      const savedGoal = await goal.save();
      const res = await chai.request(server).delete(`/goals/${savedGoal.id}`);
      res.should.have.status(200);
      res.body.should.have.property("message").eql("Deleted goal!");
    });
  });
});
