// Imports the server.js file to be tested.
const server = require("../server");
// Assertion (Test Driven Development) and Should,  Expect(Behaviour driven 
// development) library
const chai = require("chai");
// Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require("chai-http");
// Assertion
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

describe("Server!", () => {
    it("Should be able to get the home page", function(done) {
        chai
          .request(server)
          .get("/home")
          .end((err, res) => {
            res.text.should.be.a("string");
            res.text.should.contain("<title>Home</title>");
            done();
       });
    });
    it("Should be able to get the pantry page", function(done) {
      chai
        .request(server)
        .get("/pantry")
        .end((err, res) => {
          res.text.should.contain("<title>Pantry</title>");
          done();
      });
    });
    it("get profile page", function(done) {
      chai
        .request(server)
        .get("/profile")
        .end((err, res) => {
          res.text.should.contain("<title>Profile</title>");
          done();
     });
  });
});