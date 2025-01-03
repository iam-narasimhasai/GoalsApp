let mongoose = require("mongoose");
let chai = require("chai");
let chaiHttp = require("chai-http");
const http = require("http");
const app = require("./app"); // Import the app
const Goal = require("./models/goal"); // Import the Goal model

chai.should();
chai.use(chaiHttp);

describe("Goals API Suite", () => {
  let server;

  // Start an HTTP server before running tests
  before((done) => {
    server = http.createServer(app); // Wrap the app in an HTTP server
    server.listen(0, () => { // Use an available random port
      console.log("Test server running...");
      done();
    });
  });

  // Close the server after all tests
  after((done) => {
    server.close(() => {
      console.log("Test server stopped.");
      done();
    });
  });

  // Before each test, ensure the database is clean
  beforeEach((done) => {
    mongoose.connection.collections.goals.drop(() => {
      done();
    });
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
  // describe("DELETE /goals/:id", () => {
  //   it("it should delete a goal", (done) => {
  //     const goal = new Goal({ text: "Goal to delete" });
  //     goal.save((err, savedGoal) => {
  //       chai
  //         .request(server)
  //         .delete(`/goals/${savedGoal.id}`)
  //         .end((err, res) => {
  //           res.should.have.status(200);
  //           res.body.should.have.property("message").eql("Deleted goal!");
  //           done();
  //         });
  //     });
  //   });

    // it("it should return 404 when trying to delete a non-existing goal", (done) => {
    //   const nonExistentId = new mongoose.Types.ObjectId();
    //   chai
    //     .request(server)
    //     .delete(`/goals/${nonExistentId}`)
    //     .end((err, res) => {
    //       res.should.have.status(404);
    //       res.body.should.have.property("message").eql("Goal not found.");
    //       done();
    //     });
    // });
  });

  /**
   * Test error handling
   */
//   describe("Error Handling", () => {
//     it("it should handle a database error gracefully", (done) => {
//       // Simulate a database error by closing the mongoose connection
//       mongoose.connection.close(() => {
//         chai
//           .request(server)
//           .get("/goals")
//           .end((err, res) => {
//             res.should.have.status(500);
//             res.body.should.have.property("message").eql("Failed to load goals.");
//             done();

//             // Reopen the mongoose connection for subsequent tests
//             mongoose.connect(process.env.MONGO_URL, {
//               useNewUrlParser: true,
//               useUnifiedTopology: true,
//             });
//           });
//       });
//     });
//   });
});
