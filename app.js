//requiere modules
const express = require("express")
const bodyParser = require("body-parser")
const request = require("request")
const https = require ("https")

//init app
const app = express()

//static files
app.use(express.static("public"));

//body PARSER
app.use(bodyParser.urlencoded({extended: true}));

//init server on whatever port Heroku picks, or port 3000 when running locally
app.listen(process.env.PORT || 3000, function(){
  console.log("server is running on port 3000.");
})

// instructions for get request to root directory
app.get("/", function(req,res){
  res.sendFile(__dirname + "/signup.html")
})

//instructions for post request to root directory
app.post("/", function(req, res){
// lname, fname, email etc. taken from the names of the items in the HTML file
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  console.log(firstName, lastName, email); //log the data for example's sake

  const data = {
    //length of members array is only 1, because we are only inputting one member at a time
    members: [
      {
        //these fields come fromt eh mailchimp API field specification for new memebers of email lists
        email_address: email,
        status: "subscribed",
        merge_fields:
        {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  }

  //mailchimp require flat=pack JSON format
  const jsonData = JSON.stringify(data)

  //API endpoint from mailchimp, including the list-id (this endpoint was found on https://mailchimp.com/developer/guides/marketing-api-conventions/)
  //we have to manually put in 'us7' because we are using data center 7. We find this information from the end of our API key. API documentation explans that we need to do this.
  url = "https://us7.api.mailchimp.com/3.0/lists/e1f7e81349"

  //options as a JS object
  const options = {
    method: "POST",
    //mailchimp says we can use the basic HTTP authentication to send or request data, which means using our API key.
    //On the API documentation, we see the requested format of 'anystring:<YOUR_API_KEY>' for authentications, which we have done below. Info found on https://mailchimp.com/developer/guides/marketing-api-conventions/
    //"auth" comes from the HTTPS module's "option's" parameters
    auth: "harsh:0faf7df70bfe6e3e37996d738f6337b9-us7" // This key has since been disabled since it was pushed to a public GitHub repo. Shouldn't be too hard to create a new one though if you need to.
  }
  //request to send data through mailchimp API to our mailchimp account
  //using the https module
  const request = https.request(url, options, function(response){
    //check what data was returned after making this post request
    // this is also really helpful in terms of debugging
    response.on("data", function(data){
      console.log(JSON.parse(data))

      if (response.statusCode == 200) {
        res.sendFile(__dirname + '/success.html')
      } else {
        res.sendFile(__dirname + "/failure.html")
      }
    })
  })
  //finally actually send our data that was inputted into our HTML form to mailchimp
  request.write(jsonData);
  request.end();
})



// instructions for post request to failure directory (the "Try again" button)
app.post("/failure", function(req,res){
  res.redirect("/")
})




//list ID
//e1f7e81349

//api key
//0faf7df70bfe6e3e37996d738f6337b9-us7
