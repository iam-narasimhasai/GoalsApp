let mongoose = require("mongoose");
let server = require("./app");
let chai = require("chai");
const chaiHttp = require('chai-http'); // Correct for CommonJS

chai.should();
chai.use(chaiHttp);

describe("Goals API Suite", () => {
  // Before tests, ensure the database is clean
  before(async () => {
    if (mongoose.connection.collections.goals) {
      await mongoose.connection.collections.goals.drop().catch(err => {
        console.log("Error dropping goals collection: ", err); // Handle any potential errors here
      });
    }
  });

  /**
   * Test the GET /goals route
   */
  describe("GET /goals", () => {
    it("it should fetch all goals (initially empty)", (done) => {
      chai
        .request(server)
        .get("/goals")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("goals").that.is.an("array").that.is.empty;
          done();
        });
    });
  });

  /**
   * Test the POST /goals route
   */
  describe("POST /goals", () => {
    it("it should create a new goal", (done) => {
      const goal = { text: "Learn unit testing" };
      chai
        .request(server)
        .post("/goals")
        .send(goal)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property("goal");
          res.body.goal.should.have.property("text").eql(goal.text);
          done();
        });
    });

    it("it should not create a goal without text", (done) => {
      const goal = { text: "" };
      chai
        .request(server)
        .post("/goals")
        .send(goal)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property("message").eql("Invalid goal text.");
          done();
        });
    });
  });

  /**
   * Test the DELETE /goals/:id route
   */
  describe("DELETE /goals/:id", () => {
    it("it should delete a goal", async () => {
      const Goal = mongoose.model("Goal");
      const goal = new Goal({ text: "Goal to delete" });
      const savedGoal = await goal.save();
      const res = await chai.request(server).delete(`/goals/${savedGoal.id}`);
      res.should.have.status(200);
      res.body.should.have.property("message").eql("Deleted goal!");
    });
  });
});