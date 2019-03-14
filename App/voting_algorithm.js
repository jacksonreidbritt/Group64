// Author : Ian Smith/ Group64

// function to create different transformations of the sigmoid function
// @params: a, value between 0 and 1 that decides how quickly function approaches b as x-> inf or 0 as x->-inf
//          b, value that function approaches as x -> inf
// @return: function from x to b*sigmoid(a*x)
function create_sig(a, b, c = 0){
  if(b < 0) { // restricted to non-negative values
    throw "Invalid b-value. Must be non-negative.";
  } else if (a < 0 || a > 1) { // also restricted to values in [0,1]
    throw "Invalid a-value. Must be between 0 and 1.";
  } else if (c < 0) {
    throw "Invalid c-value. Must be non-negative.";
  } else {
    return (x) => (x===null)?(b/2+c):(b/(1+Math.exp((-1)*a*x))) + c;
  }
}

// creates an object of sigmoid functions with appropriate params for each attribute type
sigmoids = {
  "Danceability" : create_sig(0.3, 1), // 10 votes to reach 0.731
  "Energy": create_sig(0.3,0.85,0.15),
  // Speechiness: + 5 to reach 0.374; -5 to reach 0.18
  // (above 0.66 is entirely spokent word)
  "Speechiness": create_sig(0.35,0.6),
  "Acousticness": create_sig(0.2, 1), // +10 votes to reach 0.92 (high confidence that track is acoustic)
  "Valence": create_sig(0.35, 0.85,0.15), // + 5 votes to reach 0.82
  "Tempo": create_sig(0.2,130,50) // nothing less than 50, nothing greater than 180, + 5 -> 138 bpm, -5 -> 92 bpm
}

// takes a dictionary of attributes and corresponding +1/-1 votes and calculates appropriate attribute value
function calc_attributes(attr_dict) {
  keys = ["Danceability","Energy","Speechiness", "Acousticness", "Valence", "Tempo"];
  attributes = {};
  for(var i = 0; i < keys.length; i++){
    // console.log(keys[i]);
    attributes[keys[i]] = sigmoids[keys[i]](attr_dict[keys[i]]);
   }
  //  console.log(attributes);
   return attributes;
}

if (!module.parent) {
  // this is main module
  // console.log(sigmoids.Danceability(10));
  // console.log(sigmoids.Tempo(0));
  attr_dict = {"Danceability":0,"Energy":0,"Speechiness":0, "Acousticness":0, "Valence":0, "Tempo":0};
  console.log(calc_attributes(attr_dict));
} else {
  // we were require()d from somewhere else
  module.exports = calc_attributes;
}
