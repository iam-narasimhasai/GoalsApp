let mongoose = require("mongoose");
let server = require("./app");
let chai = require("chai");
const chaiHttp = require('chai-http'); // Correct for CommonJS

chai.should();
chai.use(chaiHttp);

describe("Goals API Suite", () => {

  before(async () => {
    // Ensure MongoDB is connected before running tests
    console.log("Using MongoDB connection string:", process.env.MONGO_URL);
    try {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("CONNECTED TO MONGODB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error; // This will fail the test if connection fails
    }
  });

  describe("GET /goals", () => {
    it("should fetch all goals (initially empty)", async () => {
      const res = await chai.request(server).get("/goals");
      res.should.have.status(200);
      res.body.should.have.property("goals").that.is.an("array").that.is.empty;
    });
  });

  describe("POST /goals", () => {
    it("should create a new goal", async () => {
      const goal = { text: "Learn unit testing" };
      const res = await chai.request(server).post("/goals").send(goal);
      res.should.have.status(201);
      res.body.should.have.property("goal");
      res.body.goal.should.have.property("text").eql(goal.text);
    });

    it("should not create a goal without text", async () => {
      const goal = { text: "" };
      const res = await chai.request(server).post("/goals").send(goal);
      res.should.have.status(422);
      res.body.should.have.property("message").eql("Invalid goal text.");
    });
  });

  describe("DELETE /goals/:id", () => {
    it("should delete a goal", async () => {
      const goal = new mongoose.model("Goal")({ text: "Goal to delete" });
      const savedGoal = await goal.save();
      const res = await chai.request(server).delete(`/goals/${savedGoal.id}`);
      res.should.have.status(200);
      res.body.should.have.property("message").eql("Deleted goal!");
    });
  });
});
