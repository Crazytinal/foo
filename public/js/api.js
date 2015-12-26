var validator = require ('./validator');

module.exports = {
  validateUnique: function(users, req, res){
      user = {};
      user[req.body.field] = req.body.value;
      result = validator.isAttrValueUnique(users, user, req.body.field) ? 
        {isUnique: true} : {isUnique: false}
      res.json(result);

  }
}